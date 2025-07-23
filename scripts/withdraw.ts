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
import { config } from "chai";

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
    const CROWDSALE_PROGRAM_ID = new PublicKey("CBH9TrtBXphZkLchx1nvdjnsDY4VMYoMpiQ9Vw2MyefD")
    const CROWDSALE_PDA = new PublicKey("A47fAseLaHKfmm77U2zD587DXowscBvE6ZqsSfc18zhk")

    const program = new anchor.Program(IDL as anchor.Idl, provider) as anchor.Program<Crowdsale>;
    
    console.log(program);

    try {
    // Step 1: Close if not already (idempotent if closed)
    const closeTx = await program.methods
      .closeCrowdsale()
      .accounts({
        owner: creator.publicKey,
        crowdsale: CROWDSALE_PDA,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([creator.payer])
      .rpc();
    await provider.connection.confirmTransaction(closeTx, "finalized");
    console.log(`Close tx: ${closeTx}`);

    // Step 2: Withdraw
    const withdrawTx = await program.methods
      .withdrawFunds()
      .accounts({
        owner: creator.publicKey,
        crowdsale: CROWDSALE_PDA,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([creator.payer])
      .rpc();
    await provider.connection.confirmTransaction(withdrawTx, "finalized");

    console.log(`Withdraw tx: ${withdrawTx}`);
    console.log(`Withdraw complete!`);
  } catch (error) {
    console.error('Error:', error);
    if (error.logs) console.error('Logs:', error.logs);
  }
}

main().then(()=> console.log("Script finished")).catch((e)=> console.log(e));