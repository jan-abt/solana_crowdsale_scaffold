import {
    type Connection,
    Keypair,
    type Signer,
    Transaction,
    SystemProgram,
    sendAndConfirmTransaction
} from '@solana/web3.js'

import {
    createMint,
    mintTo
} from '@solana/spl-token'

export async function createMintAccount({
    connection,
    creator,
    decimals = 9
}: {
    connection: Connection,
    creator: Signer,
    decimals?: number
}) {

    const mintKeypair = Keypair.generate()

    const mint = await createMint(
        connection, // Connection to the block chain
        creator, // who is paying for the transaction
        creator.publicKey, // who is allowed to mint - mint authority
        creator.publicKey, // who is allowed to freeze - freeze authority
        decimals,
        mintKeypair
    )

    const mintId = mint.toBase58()
    console.log(`Created Mint Account: ${mintId}`)
    return mintKeypair

}

export async function mintTokens({
    connection,
    creator,
    mintKeypair,
    tokenAccount, // Changed to PublicKey
    amount
}: {
    connection: Connection,
    creator: Signer,
    mintKeypair: Keypair,
    tokenAccount: PublicKey, // Fix: ATAs are PublicKey, not Keypair
    amount: number
}) {

    const mintAuthority = creator

    await mintTo(
        connection,
        creator,
        mintKeypair.publicKey,
        tokenAccount, // No .publicKey needed
        mintAuthority,
        amount
    )

    console.log(`Minted ${amount / 10 ** 9} Tokens to ${tokenAccount}`)
}

export async function transferLamports({
    connection,
    from,
    to,
    amount
}: {
    connection: Connection,
    from: Signer,
    to: Keypair,
    amount: number
}) {
    const transaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: from.publicKey,
            toPubkey: to.publicKey,
            lamports: amount,
        })
    )

    await sendAndConfirmTransaction(
        connection,
        transaction,
        [from],
    )

    console.log(`Sent ${amount / 10 ** 9} SOL to ${to.publicKey}\n`)
}