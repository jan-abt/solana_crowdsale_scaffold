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


## Deploy Program to Blockchain - check existence
* `anchor build && anchor deploy`
* `solana program show <F4i513PaVxwz1UV3h5ShdXq3faMyAEaAezDGih1SEap4> --url devnet`


## Generate mint account token - check existence
* `spl-token create-token --url devnet`
* `spl-token display 6rCYL7uxUhQFBYyCLFs7RVeZNzBfCa2UEvgQqpgF3iv5 --url devnet`


```

Program Id: F4i513PaVxwz1UV3h5ShdXq3faMyAEaAezDGih1SEap4
Owner: BPFLoaderUpgradeab1e11111111111111111111111
ProgramData Address: Ew1hMyDRLBwPfDHimkmE5aiESPez61JVouBNtUcvM7MN
Authority: GX2iadvwHkL8nTG8NnM6HFrQjsrDCfGQrk5VuG3fePum
Last Deployed In Slot: 394727605
Data Length: 282664 (0x45028) bytes
Balance: 1.96854552 SOL

```

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
