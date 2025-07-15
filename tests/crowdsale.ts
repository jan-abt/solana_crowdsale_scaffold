import * as anchor from "@coral-xyz/anchor";
import { Keypair, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { createAssociatedTokenAccountInstruction, getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { expect } from 'chai';
import { Crowdsale } from "../target/types/crowdsale";
import { transferLamports, createMintAccount, mintTokens } from "./_helpers";

describe("Crowdsale", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  const connection = provider.connection;
  anchor.setProvider(provider);

  // Our overall program
  const program = anchor.workspace.Crowdsale as anchor.Program<Crowdsale>;

  // Our main account.
  // This is who will create the token mint, crowdsale, and fund the buyer account with SOL
  const creator = (program.provider as anchor.AnchorProvider).wallet;

  /* --- GENERATE KEYPAIRS --- */
  // Create Crowdsale keypair
  const crowdsaleKeypair = anchor.web3.Keypair.generate();

  // Create the buyer keypair
  const buyerKeypair = anchor.web3.Keypair.generate();

  // Console log our keys
  console.log(`Creator Public Key: ${creator.publicKey}`);
  console.log(`Crowdsale Public Key: ${crowdsaleKeypair.publicKey}`);
  console.log(`Buyer Public Key: ${buyerKeypair.publicKey}\n`);

  // set up crowdsale params
  // we'll use the crowsdale keypair's public key as the ID and set
  // the cost of buying a token
  const ID = crowdsaleKeypair.publicKey;
  const COST = 1;

  // Set up the crowdsale authority.
  // In order to transfer tokens, we need to create the authoriy of the crowdsale.
  // It will be based off the ID of the crowdsale keypair's public key, 
  // hence PDA (Program Derived Address)
  // Set up the crowdsale PDA (seeds: [ID])
  const crowdsalePDA = PublicKey.findProgramAddressSync(
    [ID.toBuffer()],
    anchor.workspace.Crowdsale.programId
  )[0];

  // Set up the crowdsale authority PDA (seeds: [ID, "authority"])
  const crowdsaleAuthorityPDA = PublicKey.findProgramAddressSync(
    [ID.toBuffer(), Buffer.from("authority")],
    anchor.workspace.Crowdsale.programId
  )[0];

  console.log(`Crowdsale Key: ${crowdsalePDA}\n`);
  console.log(`Crowdsale Authority: ${crowdsaleAuthorityPDA}\n`);

  let mintKeypair, crowdsaleTokenAccount, buyerTokenAccount;

  before(async () => {
    try {

       if (!creator.payer) {
        throw new Error('Payer keypair is undefined - check wallet config');
      }
      
      // Create mint account
      mintKeypair = await createMintAccount({
        connection,
        creator: creator.payer, // Use payer (Keypair) for Signer
        decimals: 9,
      });

      // Derive token_account (vault ATA) before initialize
      const tokenAccount = getAssociatedTokenAddressSync(
        mintKeypair.publicKey,
        crowdsaleAuthorityPDA,
        true // Allow off-curve for PDA
      );

      // Debug: Log all accounts before call
      console.log('Accounts for initialize:');
      console.log('crowdsale: ', crowdsalePDA.toBase58());
      console.log('mintAccount: ', mintKeypair.publicKey.toBase58());
      console.log('tokenAccount: ', tokenAccount.toBase58());
      console.log('crowdsaleAuthority: ', crowdsaleAuthorityPDA.toBase58());
      console.log('creator: ', creator.publicKey.toBase58());
      console.log('tokenProgram: ', TOKEN_PROGRAM_ID.toBase58());
      console.log('associatedTokenProgram: ', ASSOCIATED_TOKEN_PROGRAM_ID.toBase58());
      console.log('systemProgram: ', SystemProgram.programId.toBase58());

      // Call initialize with ALL required accounts
      await program.methods
        .initialize(ID, COST)
        .accounts({
          crowdsale: crowdsalePDA,
          mintAccount: mintKeypair.publicKey,
          tokenAccount: tokenAccount, // Vault ATA
          crowdsaleAuthority: crowdsaleAuthorityPDA,
          creator: creator.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([creator.payer]) // Use payer for signing
        .rpc();

      // Now set crowdsaleTokenAccount after init
      crowdsaleTokenAccount = tokenAccount;

      // Mint tokens to vault
      await mintTokens({
        connection,
        creator: creator.payer, // Use payer
        mintKeypair,
        tokenAccount: crowdsaleTokenAccount,
        amount: 1_000_000_000_000,
      });

      // Fund buyer with SOL
      await transferLamports({
        connection,
        from: creator.payer, // Use payer
        to: buyerKeypair,
        amount: 10_000_000_000, // 10 SOL
      });
    } catch (error) {
      if (error instanceof Error) { // Narrow to Error
        console.error('Error in before hook:', error.message);
        if ('logs' in error && Array.isArray(error.logs)) {
          console.error('Transaction logs:', error.logs);
        }
      } else {
        console.error('Unexpected error:', error);
      }
      throw error;
    }
  });

  describe("Deployment", () => {
    it("Creates the Crowdsale", async () => {
      const crowdsaleState = await program.account.crowdsale.fetch(crowdsalePDA);
      expect(crowdsaleState.id.toBase58()).to.equal(ID.toBase58());
      expect(crowdsaleState.cost).to.equal(COST);
      // Add other expects for mintAccount, status, etc.
    });
  });

});