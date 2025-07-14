#![allow(unexpected_cfgs)] // Suppress the cfg warning

use anchor_lang::prelude::*;

mod constants;
mod instructions;
mod state;

// Re-export for convenience inside [program]
use instructions::create_crowdsale::*;

// Program ID
declare_id!("HciPz9qoNEBBWga6KWomnDovANbQWnTAT5iFSNW7Ji3K");

#[program]
pub mod crowdsale {
    use super::{Context, CreateCrowdSale, Pubkey, Result, do_init};

    pub fn initialize(ctx: Context<CreateCrowdSale>, id: Pubkey, cost: u32) -> Result<()> {
        do_init(ctx, id, cost)          
    }
}

#[derive(Accounts)]
pub struct Initialize {}
