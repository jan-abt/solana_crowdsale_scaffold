import * as anchor from "@coral-xyz/anchor";
import { Keypair, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { createAssociatedTokenAccountInstruction, getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { expect } from 'chai';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
import { Crowdsale } from "../target/types/crowdsale";
import { transferLamports, createMintAccount, mintTokens } from "./_helpers";

describe("Crowdsale", () => {

  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  const connection = provider.connection;
  anchor.setProvider(provider);

  // Our overall program
  const program = anchor.workspace.Crowdsale as anchor.Program<Crowdsale>;

  // Main account.
  // It will issue the token mint, crowdsale, and fund the buyer account with SOL
  const creator = (program.provider as anchor.AnchorProvider).wallet;

  // Create Crowdsale keypair
  const crowdsaleKeypair = anchor.web3.Keypair.generate();

  // Create the buyer keypair
  const buyerKeypair = anchor.web3.Keypair.generate();

  // set up crowdsale params
  // we'll use the crowsdale keypair's public key as the ID and set
  // the cost of buying a token
  const ID = crowdsaleKeypair.publicKey;
  const COST = 1;

  // Set up the crowdsale authority.
  // In order to transfer tokens, we need to create the authoriy of the crowdsale.
  // It will be based off the ID of the crowdsale keypair's public keyy.
  // Hence, PDA (Program Derived Address)
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

  let mintKeypair, crowdsaleTokenAccount, buyerTokenAccount;

  before("Set up",async () => {
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


      console.log('\n\tAccounts:');
      console.log(`\t\tCreator: ${creator.publicKey}`);
      console.log(`\t\tCrowdsale: ${crowdsaleKeypair.publicKey}`);
      console.log(`\t\tBuyer: ${buyerKeypair.publicKey}`);

      // Derive token_account (vault ATA) before initialize
      const tokenAccount = getAssociatedTokenAddressSync(
        mintKeypair.publicKey,
        crowdsaleAuthorityPDA,
        true // Allow off-curve for PDA
      );

      console.log('\n\tAccounts required for initialize():');
      console.log('\t\tcreator: ', creator.publicKey.toBase58());
      console.log('\t\tcrowdsalePDA: ', crowdsalePDA.toBase58());
      console.log('\t\tcrowdsaleAuthorityPDA: ', crowdsaleAuthorityPDA.toBase58());
      console.log('\t\tmintAccount: ', mintKeypair.publicKey.toBase58());
      console.log('\t\ttokenAccount: ', tokenAccount.toBase58(), "\n");

      console.log('\n\tProgram Ids:');
      console.log('\t\ttokenProgram: ', TOKEN_PROGRAM_ID.toBase58());
      console.log('\t\tassociatedTokenProgram: ', ASSOCIATED_TOKEN_PROGRAM_ID.toBase58());
      console.log('\t\tsystemProgram: ', SystemProgram.programId.toBase58(), '\n');

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
      expect(crowdsaleState.status).to.deep.equal({ open: {} });
    });

    it("Has tokens", async () => {
      const crowdsaleTokenBalance = await connection.getTokenAccountBalance(crowdsaleTokenAccount);
      expect(crowdsaleTokenBalance.value.amount).to.equal("1000000000000");
    });
  });

  describe("Buy Tokens", () => {
    it("Buys tokens successfully", async () => {
      const amount = 100_000_000; // 0.1 tokens (9 decimals)
      const cost = amount * COST;

      // Derive buyer ATA
      const buyerATA = getAssociatedTokenAddressSync(mintKeypair.publicKey, buyerKeypair.publicKey);

      // Call buyTokens
      await program.methods
        .buyTokens(amount)
        .accounts({
          buyer: buyerKeypair.publicKey,
          buyerTokenAccount: buyerATA,
          crowdsale: crowdsalePDA,
          crowdsaleTokenAccount: crowdsaleTokenAccount,
          crowdsaleAuthority: crowdsaleAuthorityPDA,
          mintAccount: mintKeypair.publicKey,
          ownerAccount: creator.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([buyerKeypair])
        .rpc();

      // Assert balances
      const buyerBalance = await connection.getTokenAccountBalance(buyerATA);
      expect(buyerBalance.value.amount).to.equal(amount.toString());
      const vaultBalance = await connection.getTokenAccountBalance(crowdsaleTokenAccount);
      expect(vaultBalance.value.amount).to.equal((1_000_000_000_000 - amount).toString());
    });

    it("Fails if amount is zero", async () => {


      // Derive buyer ATA
      const buyerATA = getAssociatedTokenAddressSync(mintKeypair.publicKey, buyerKeypair.publicKey);


      await expect(program.methods.buyTokens(0)
        .accounts({
          buyer: buyerKeypair.publicKey,
          buyerTokenAccount: buyerATA,
          crowdsale: crowdsalePDA,
          crowdsaleTokenAccount: crowdsaleTokenAccount,
          crowdsaleAuthority: crowdsaleAuthorityPDA,
          mintAccount: mintKeypair.publicKey,
          ownerAccount: creator.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([buyerKeypair])
        .rpc()).to.be.rejectedWith('InvalidAmount');
    });
  });

  describe("Fund Withdrawal", () => {
    it("Withdraws funds successfully", async () => {
      // Close crowdsale (assume close instruction; or manually set for test)
      await program.methods.closeCrowdsale().accounts({ crowdsale: crowdsalePDA }).rpc();

      // Send extra SOL to crowdsale PDA for test
      const airdropSignature = await connection.requestAirdrop(crowdsalePDA, 1_000_000);
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        signature: airdropSignature,
        blockhash,
        lastValidBlockHeight,
      });

      const ownerBalanceBefore = await connection.getBalance(creator.publicKey);
      await program.methods
        .withdrawFunds()
        .accounts({
          owner: creator.publicKey,
          crowdsale: crowdsalePDA,
          systemProgram: SystemProgram.programId,
        })
        .signers([creator.payer])
        .rpc();

      const ownerBalanceAfter = await connection.getBalance(creator.publicKey);
      expect(ownerBalanceAfter).to.be.above(ownerBalanceBefore);
    });

    it("Fails if not owner", async () => {
      await expect(program.methods.withdrawFunds()
        .accounts({
          owner: buyerKeypair.publicKey,
          crowdsale: crowdsalePDA,
          systemProgram: SystemProgram.programId,
        })
        .signers([buyerKeypair]).rpc()).to.be.rejectedWith('Unauthorized');
    });

  });

});