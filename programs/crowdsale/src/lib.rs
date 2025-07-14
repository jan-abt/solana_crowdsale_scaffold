#![allow(unexpected_cfgs)] // Suppress the cfg warning

use anchor_lang::prelude::*;

mod constants;
mod errors;  // Ensures CrowdsaleError is available at crate root
mod instructions;
mod state;

// Re-export for convenience inside [program]
use instructions::create_crowdsale::*;
use instructions::buy_tokens::*;  // Add this for the buy_tokens instruction

// Program ID
declare_id!("HciPz9qoNEBBWga6KWomnDovANbQWnTAT5iFSNW7Ji3K");

#[program]
pub mod crowdsale {
    use super::{Context, CreateCrowdSale, BuyTokens, Pubkey, Result};

    /// Initializes a new crowdsale with the given ID and cost.
    pub fn initialize(ctx: Context<CreateCrowdSale>, id: Pubkey, cost: u32) -> Result<()> {
        CreateCrowdSale::do_init(ctx, id, cost)
    }

    /// Allows buying tokens from the crowdsale.
    pub fn buy_tokens(ctx: Context<BuyTokens>, amount: u32) -> Result<()> {
        BuyTokens::handler(ctx, amount)
    }
}