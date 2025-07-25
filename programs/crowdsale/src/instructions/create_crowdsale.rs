use {
    anchor_lang::prelude::*,
    anchor_spl::{
        associated_token::AssociatedToken,
        token::{Mint, Token, TokenAccount},
    },
};

use crate::{
    constants::AUTHORITY_SEED,
    state::{Crowdsale, CrowdsaleStatus},
    errors::CrowdsaleError,  // Import for direct access (avoids crate:: prefix)
};

/**
   A Crowdsale or Initial Token Offering (ITO) is commonly used in blockchain and cryptocurrency contexts to describe a 
   mechanism where a project sells newly created tokens to raise funds, often via a smart contract, as here in this Solana/Anchor code, 
   This code handles opening the store,  token distribution at a fixed cost, buying, and withdrawal.
 */



/// Accounts struct for creating a crowdsale.
#[derive(Accounts)]
#[instruction(id: Pubkey)]
pub struct CreateCrowdSale<'info>{
    #[account(
        init, 
        payer = creator,
        space = 8 + Crowdsale::MAXIMUM_SIZE,
        seeds = [
            id.as_ref(),
        ],
        bump,
    )]
    pub crowdsale: Account<'info, Crowdsale>,    
    pub mint_account: Account<'info, Mint>,
    #[account(
        init, 
        payer = creator,
        associated_token::mint = mint_account, 
        associated_token::authority = crowdsale_authority,
    )]
    pub token_account: Account<'info, TokenAccount>,
    /// CHECK: This account is a program-derived address (PDA) used as the authority for the token account.
    /// It is derived deterministically from the crowdsale ID and seed, so no type checks or deserialization are needed—it's controlled solely by the program.
    #[account(
        seeds = [
            id.as_ref(),
            AUTHORITY_SEED
        ],
        bump,
    )]
    pub crowdsale_authority: AccountInfo<'info>,
    #[account(mut)]
    pub creator: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

impl<'info> CreateCrowdSale<'info> {
    /// Initializes a new crowdsale from the context with the given ID and cost.
    pub fn handler(ctx: Context<CreateCrowdSale>, id: Pubkey, cost: u32) -> Result<()> {
        require!(cost > 0, CrowdsaleError::InvalidCost);
        let crowdsale_account = &mut ctx.accounts.crowdsale;
        let token_account = &ctx.accounts.token_account;
        let mint_account = &ctx.accounts.mint_account;
        require_keys_eq!(token_account.mint, mint_account.key(), CrowdsaleError::MintMismatch);

        crowdsale_account.id = id;
        crowdsale_account.cost = cost;
        crowdsale_account.mint_account = mint_account.key();
        crowdsale_account.token_account = token_account.key();
        crowdsale_account.status = CrowdsaleStatus::Open;
        crowdsale_account.owner = ctx.accounts.creator.key();

        msg!("Crowdsale created!");  

        Ok(())
    }
}