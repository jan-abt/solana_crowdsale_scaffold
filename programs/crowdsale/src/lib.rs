#![allow(unexpected_cfgs)] // Suppress the cfg warning

use anchor_lang::prelude::*;

mod constants;
mod errors; // Ensures CrowdsaleError is available at crate root
mod instructions;
mod state;

// Re-export for convenience inside [program]
use instructions::buy_tokens::*;
use instructions::create_crowdsale::*;
use instructions::close_crowdsale::*;
use instructions::withdraw_funds::*;

// Program ID
declare_id!("F4i513PaVxwz1UV3h5ShdXq3faMyAEaAezDGih1SEap4");

#[program]
pub mod crowdsale {
    use super::{BuyTokens, Context, CreateCrowdSale, CloseCrowdsale, Pubkey, Result, WithdrawFunds};

    /// Initializes a new crowdsale with the given ID and cost.
    pub fn initialize(ctx: Context<CreateCrowdSale>, id: Pubkey, cost: u32) -> Result<()> {
        CreateCrowdSale::handler(ctx, id, cost) // Note: You had 'handler' here in your code, but based on earlier refactor, it's 'do_init'—adjust if needed
    }

    pub fn close_crowdsale(ctx: Context<CloseCrowdsale>) -> Result<()> {
        CloseCrowdsale::handler(ctx)
    }

    /// Allows buying tokens from the crowdsale.
    pub fn buy_tokens(ctx: Context<BuyTokens>, amount: u32) -> Result<()> {
        BuyTokens::handler(ctx, amount)
    }

    /// Allows the owner to withdraw funds from the crowdsale.
    pub fn withdraw_funds(ctx: Context<WithdrawFunds>) -> Result<()> {
        WithdrawFunds::handler(ctx)
    }
}
