/*
  Even though we deploy the program via `anchor deploy`,
  we still need to initialize and create the actual crowdsale
  by interacting with the deployed program.
*/

// @ts-nocheck

import * as anchor from "@coral-xyz/anchor";
import { clusterApiUrl, Connection, PublicKey, SystemProgram } from '@solana/web3.js';
import { getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';

import IDL from "../target/idl/crowdsale.json";
import { Crowdsale } from "../target/types/crowdsale";

async function main() {
  // Setup wallet
  const creator = anchor.Wallet.local();

  // Setup provider
  const provider = new anchor.AnchorProvider(
    new Connection(clusterApiUrl('devnet')),
    creator,
    { preflightCommitment: "confirmed" }
  );

  // Instantiate program explicitly
  const CROWDSALE_PROGRAM_ID = new PublicKey("CBH9TrtBXphZkLchx1nvdjnsDY4VMYoMpiQ9Vw2MyefD");
  //const program = new anchor.Program(IDL, CROWDSALE_PROGRAM_ID, provider);
  const program = new anchor.Program(IDL, provider);

  console.log(program);

  // Create Crowdsale keypair
  const crowdsaleKeypair = anchor.web3.Keypair.generate();

  // Crowdsale state
  const ID = crowdsaleKeypair.publicKey;
  const COST = 1;
  const TOKEN_MINT_ACCOUNT = new PublicKey("3s3D9a5mNjQpEG5SUx1Nmsre91viUfGECVVy1iruBV9U"); // Confirm this exists on devnet

  // Generate the Crowdsale PDA
  const crowdsalePDA = PublicKey.findProgramAddressSync(
    [ID.toBuffer()],
    CROWDSALE_PROGRAM_ID
  )[0];

  // Generate the Crowdsale authority PDA
  const crowdsaleAuthorityPDA = PublicKey.findProgramAddressSync(
    [ID.toBuffer(), Buffer.from("authority")],
    CROWDSALE_PROGRAM_ID
  )[0];

  // Compute token account (vault ATA)
  const tokenAccount = getAssociatedTokenAddressSync(
    TOKEN_MINT_ACCOUNT,
    crowdsaleAuthorityPDA,
    true
  );

  try {
    // Create the crowdsale
    const txSignature =
      await program.methods.initialize(ID, COST).accounts({
        crowdsale: crowdsalePDA,
        mintAccount: TOKEN_MINT_ACCOUNT,
        tokenAccount: tokenAccount,
        crowdsaleAuthority: crowdsaleAuthorityPDA,
        creator: creator.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      }).signers([creator.payer]).rpc({ skipPreflight: false });

    // verify that the transaction has finished
    await provider.connection.confirmTransaction(txSignature, "finalized");


    // Get the state
    const crowdsaleState = await program.account.crowdsale.fetch(crowdsalePDA);

    console.log(`Successfully initialized Crowdsale at ${crowdsalePDA}\n`);
    console.log(`Crowdsale Authority ${crowdsaleAuthorityPDA}\n`);
    console.log(`ID ${crowdsaleState.id}\n`);
    console.log(`COST ${crowdsaleState.cost}\n`);
    console.log(`TOKEN MINT ${crowdsaleState.mintAccount}\n`);
    console.log(`TOKEN ACCOUNT ${crowdsaleState.tokenAccount}\n`);
  } catch (error) {
    console.error('Error:', error);
    if (error.logs) console.error('Logs:', error.logs);
  }
}

main();