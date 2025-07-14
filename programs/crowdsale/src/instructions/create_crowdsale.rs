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
};

// Initializes a new crowdsale from the context with the given ID and cost.
pub fn do_init(ctx: Context<CreateCrowdSale>, id: Pubkey, cost: u32) -> Result<()> {
    
    let crowdsale = &mut ctx.accounts.crowdsale;
    crowdsale.id = id;
    crowdsale.cost = cost;
    crowdsale.mint_account = ctx.accounts.mint_account.key();
    crowdsale.token_account = ctx.accounts.token_account.key();
    crowdsale.status = CrowdsaleStatus::Open;
    crowdsale.owner = ctx.accounts.creator.key();

    msg!("Crowdsale created!");  

    Ok(())
}

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

