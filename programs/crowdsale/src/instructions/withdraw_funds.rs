use crate::{
    errors::CrowdsaleError, // Import for direct access (avoids crate:: prefix)
    state::{Crowdsale, CrowdsaleStatus},
};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct WithdrawFunds<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(
        mut,
        has_one = owner @ CrowdsaleError::Unauthorized,  // Enforce owner check
        constraint = crowdsale.status == CrowdsaleStatus::Closed @ CrowdsaleError::CrowdsaleNotClosed  // Assuming status check
    )]
    pub crowdsale: Account<'info, Crowdsale>,
    // No system_program needed
}

impl<'info> WithdrawFunds<'info> {
    pub fn handler(ctx: Context<WithdrawFunds>) -> Result<()> {
        let from = ctx.accounts.crowdsale.to_account_info();
        let to = ctx.accounts.owner.to_account_info();

        // Calculate transferable amount (full balance minus rent-exempt minimum to avoid closing the account unintentionally)
        let rent = Rent::get()?;
        let min_balance = rent.minimum_balance(from.data_len());
        let transferable = from
            .lamports()
            .checked_sub(min_balance)
            .ok_or(CrowdsaleError::InsufficientFunds)?;

        require_gt!(transferable, 0, CrowdsaleError::InsufficientFunds);

        // Directly mutate lamports
        **from.try_borrow_mut_lamports()? -= transferable;
        **to.try_borrow_mut_lamports()? += transferable;

        Ok(())
    }
}
