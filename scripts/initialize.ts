/*
  Even though we deploy the program via `anchor deploy`,
  we still need to initialize and create the actual crowdsale
  by interacting with the deployed program.
*/

// We include nocheck just to avoid 
// conflicts and simplify the script
// @ts-nocheck

import * as anchor from "@coral-xyz/anchor"
import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js'

import IDL from "../target/idl/crowdsale.json"
import { Crowdsale } from "../target/types/crowdsale"

async function main() {
  // Setup wallet, which is the  Solana key pair we set up ealier is our anchor wallet
  // ANCHOR_WALLET = ~/.config/solana/id.json
  const creator = anchor.Wallet.local()

  // Setup provider
  const provider = new anchor.AnchorProvider(
    new Connection(clusterApiUrl('devnet')),
    creator,
    { preflightCommitment: "confirmed" } //make the Solana cluster wait until the transaction is confirmed
  )

  anchor.setProvider(provider)

  // Create Crowdsale keypair
  const crowdsaleKeypair = anchor.web3.Keypair.generate()

  // Crowdsale state
  const ID = crowdsaleKeypair.publicKey
  const COST = 1

  const CROWDSALE_PROGRAM_ID = new PublicKey("HciPz9qoNEBBWga6KWomnDovANbQWnTAT5iFSNW7Ji3K")
  // run terminal command to generate the actual
  const TOKEN_MINT_ACCOUNT = new PublicKey("")

  const program = anchor.workspace.Crowdsale as anchor.program<Crowdsale>

  console.log(program)

  // Generate the Crowdsale PDA (program derived address)
  // special address controlled by the program, meaning only our program can sign for it.
  // holds the state of our crowdsale
  const crowdsalePDA = PublicKey.findProgramAddressSync(
    [ID.toBuffer()],
    CROWDSALE_PROGRAM_ID
  )[0];


  // Generate the Crowdsale authority PDA
  // address to sign off on behalf of the crowdsale
  const crowdsaleAuthorityPDA = PublicKey.findProgramAddressSync(
    [ID.toBuffer(), Buffer.from("authority")],
    CROWDSALE_PROGRAM_ID
  )[0];

  // Create the crowdsale
  await program.methods.initialize(ID, COST).accounts({
    crowdsale: crowdsalePDA,
    mintAccount: TOKEN_MINT_ACCOUNT,
    crowdsaleAuthority: crowdsaleAuthorityPDA,
  }).signers([createBrotliCompress.payer]).rpc()

  // Get the state
  const crowdsaleSate = await program.account.fetch(crowdsalePDA)

  console.log(`Successfully initialized Crowdsale at ${crowdsalePDA}\n`)
  console.log(`Crowdsale Authority ${crowdsaleAuthorityPDA}\n`)
  console.log(`ID ${crowdsaleSate.id}\n`)
  console.log(`COST ${crowdsaleSate.cost}\n`)
  console.log(`TOKEN MINT ${crowdsaleSate.mintAccount}\n`)
  console.log(`TOKEN ACCOUNT ${crowdsaleSate.tokenAccount}\n`)

}

main()