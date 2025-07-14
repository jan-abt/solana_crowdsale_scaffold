import * as anchor from "@coral-xyz/anchor"
import { PublicKey } from '@solana/web3.js'
import { getAssociatedTokenAddressSync } from '@solana/spl-token'
import { expect } from 'chai'
import { Crowdsale } from "../target/types/crowdsale"

describe("Crowdsale", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  const connection = provider.connection
  anchor.setProvider(provider)

  // Our overall program
  const program = anchor.workspace.Crowdsale as anchor.Program<Crowdsale>

  // Our main account. This is who will create 
  // the token mint, crowdsale, and fund the buyer account with SOL
  const creator = (program.provider as anchor.AnchorProvider).wallet

  /* --- GENERATE KEYPAIRS --- */
  // Create Crowdsale keypair
  const crowdsaleKeypair = anchor.web3.Keypair.generate()

  // Create the buyer keypair
  const buyerKeypair = anchor.web3.Keypair.generate()

  // Console log our keys
  console.log(`Creator Public Key: ${creator.publicKey}`)
  console.log(`Crowdsale Public Key: ${crowdsaleKeypair.publicKey}`)
  console.log(`Buyer Public Key: ${buyerKeypair.publicKey}\n`)

  const ID = crowdsaleKeypair.publicKey
  const COST = 1

  // Set up the crowdsale authority.
  // In order to transfer tokens, we need to create the authoriy of the crowdsale.
  // It will be based off the ID of the crowdsale keypair's public key, hence PDA (Program Derived Address)
  const crowdsalePDA = PublicKey.findProgramAddressSync(
    [ID.toBuffer()],
    anchor.workspace.Crowdsale.programId
  )[0]

  const crowdsaleAuthorityPDA = PublicKey.findProgramAddressSync(
    [ID.toBuffer()], //'authority',
    anchor.workspace.Crowdsale.programId
  )[0]

  console.log(`Crowdsale Key: ${crowdsalePDA}\n`)
  console.log(`Crowdsale Authority: ${crowdsaleAuthorityPDA}\n`)

  let mintKeypair, crowdsaleTokenAccount

  before(async () => {

  })


});
