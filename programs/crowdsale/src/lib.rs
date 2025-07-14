#![allow(unexpected_cfgs)] // Suppress the cfg warning

use anchor_lang::prelude::*;

mod constants;
mod errors;  // Ensures ErrorCode is available at crate root
mod instructions;
mod state;

// Re-export for convenience inside [program]
use instructions::create_crowdsale::*;

// Program ID
declare_id!("HciPz9qoNEBBWga6KWomnDovANbQWnTAT5iFSNW7Ji3K");

#[program]
pub mod crowdsale {
    use super::{Context, CreateCrowdSale, Pubkey, Result};

    /// Initializes a new crowdsale with the given ID and cost.
    pub fn initialize(ctx: Context<CreateCrowdSale>, id: Pubkey, cost: u32) -> Result<()> {
        CreateCrowdSale::do_init(ctx, id, cost)
    }
}