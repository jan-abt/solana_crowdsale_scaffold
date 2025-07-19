# Solana Crowdsale 

## Project Overview
This is a Solana program built with Anchor (version 0.31.1) for a crowdsale (or token sale/ITO), <br>
allowing initialization of a crowdsale with a fixed token price, <br>
buying tokens in exchange for SOL and withdrawing excess funds by the owner.<br>
It uses SPL tokens for the token vault and PDA for authority control.<br>
The structure is modular, with separate files for state, errors, constants, and instructions.<br>


## Key components:

* `constants.rs`: Defines PDA seed.
* `lib.rs`: Program entry, declaring ID and instructions.
* `mod.rs`: Exports instruction submodules.
* `create_crowdsale.rs`: Initialize the crowdsale.
* `buy_tokens.rs`: Buy tokens with SOL.
* `withdraw_funds.rs`: Withdraw excess SOL from crowdsale account.
* `errors.rs`: Custom error enum.
* `state.rs`: Crowdsale account and status enum.

<br><br>

# Local Blockchain 


Create a new program id by the following means:

## Create a new anchor project (option a)
1) Run `anchor init <name>` <br>
   This scaffolds the project (with directories like programs/, tests/, Anchor.toml, etc.<br>
  `<project-name>-keypair.json` is generated under the `target/deploy/`.<br>
   The public key is added automatically to `declare_id!` macro in the program's `lib.rs` . <br>
   Finally, `[programs.localnet]` in `Anchor.toml` is automatically updated.<br>

## Manually re-create the Keypair (option b)
1) Create new Keypair: `solana-keygen new -o target/deploy/crowdsale-keypair.json --force` <br>
2) Read/Verify public address: `solana address -k target/deploy/crowdsale-keypair.json` <br>
3) `declare_id!` macro. in `lib.rs`, as well as `[programs.localnet]`  in `Anchor.toml`need to be updated manually.
4) Run `anchor build` This regenerates the IDL `<project-name>-keypair.json` under `target/deploy/` with the new id.


## Run Tests
* `anchor test --provider.cluster localnet`


<br><br>

# Solana Blockchain

## Generate mint account token on devnet
* `spl-token create-token --url devnet`

## Verify deployment
* `spl-token display <mint_address> --url devnet`


## Fund your wallet if needed (for rent exemption)
* Use a faucet like https://faucet.solana.com.


## Deploy program to the Solana blockchain

Use `anchor deploy` to compile your Anchor program from the project root and upload/deploy the executable code to the Solana network <br>
for example, `devnet` or `mainnet`, based on your `[provider.cluster]` setting in `Anchor.toml`.

## Verify deployment
* `solana program show <program-id> --url devnet`

## Run program
* `yarn ts-node scripts/initialize.ts`


## Post-Initialization: Mint Tokens to the Vault
* mint some tokens to the vault for sales: `spl-token mint <MINT_ADDRESS> 1000 <VAULT_ATA> --url devnet` <br>
  Get `<VAULT_ATA>` from the script output or derive it: associated token account of the crowdsale authority PDA for your mint.


<br><br>



## Technology Stack & Tools
- Typescript (Unit testing)
- [Rust](https://www.rust-lang.org/tools/install) (Language for Solana programs)
- [Solana CLI (v1.18.22)](https://solana.com/docs/intro/installation) (Solana tools)
- [Anchor CLI (v0.30.1)](https://www.anchor-lang.com/) (Solana development framework)
- [Yarn (v4.4.1)](https://yarnpkg.com/getting-started/install) (Package manager)

## Further Resources
- [Anchor Documentation](https://www.anchor-lang.com/)
- [Solana SPL Token Program](https://spl.solana.com/token)
- [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/)
- [Solana Token Examples](https://solana.com/docs/programs/examples#tokens)

## Prerequisites
### Rust
1. You'll want to have rust installed. You can execute:
`curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y`

You can also look here for installing:
[https://www.rust-lang.org/tools/install](https://www.rust-lang.org/tools/install)

2. Add cargo to your PATH:
`. "$HOME/.cargo/env"`

3. Close and reopen your terminal

4. Verify Rust was installed:
`rustc --version`

### Solana CLI
1. Install Solana
`sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"`

2. Close and reopen your terminal

3. Verify Solana was installed:
`solana --version`

### Anchor CLI
1. Install AVM
`cargo install --git https://github.com/coral-xyz/anchor avm --force`

2. Verify AVM was installed
`avm --version`

3. Install Anchor CLI
`avm install 0.30.1`

4. Use Anchor CLI
`avm use 0.30.1`

5. Verify Anchor CLI version
`anchor --version`

### Yarn
1. Enable corepack 
`corepack enable`

## Compiling & Running Tests
1. Clone and enter the repository

2. Build the project
`anchor build`

3. Install Yarn Dependencies
`yarn install`

Note that you may need to manually set your yarn version by executing
`yarn set version 4.4.1`

4. Run the tests
`anchor test`


---


#### Local Git repo

1) git init
2) git add .gitignore
3) git commit -m "initial commit"

#### Connect remote repo and push 
4) git remote add origin git@github.com:user-id/repo-name.git
5) git push origin main                                                       
