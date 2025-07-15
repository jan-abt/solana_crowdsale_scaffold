use anchor_lang::prelude::*;

use crate::{
    errors::CrowdsaleError,
    state::{Crowdsale, CrowdsaleStatus},
};

#[derive(Accounts)]
pub struct CloseCrowdsale<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
    mut,
    seeds = [crowdsale.id.as_ref()],
    bump,
    constraint = owner.key() == crowdsale.owner @ CrowdsaleError::Unauthorized
  )]
    pub crowdsale: Account<'info, Crowdsale>,

    pub system_program: Program<'info, System>,
}

impl<'info> CloseCrowdsale<'info> {
    pub fn handler(ctx: Context<CloseCrowdsale>) -> Result<()> {
        let crowdsale = &mut ctx.accounts.crowdsale;
        crowdsale.status = CrowdsaleStatus::Closed;
        msg!("Crowdsale closed");
        Ok(())
    }
}
