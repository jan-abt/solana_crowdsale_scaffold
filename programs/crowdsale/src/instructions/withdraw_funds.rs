use {
    anchor_lang::prelude::*,
    anchor_lang::solana_program::rent::Rent,
};

use crate::{
    errors::CrowdsaleError,
    state::{Crowdsale, CrowdsaleStatus},
};

/// Accounts for withdrawing funds from the crowdsale.
#[derive(Accounts)]
pub struct WithdrawFunds<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        mut,
        seeds = [
            crowdsale.id.as_ref(),
        ],
        bump,
        constraint = owner.key() == crowdsale.owner @ CrowdsaleError::Unauthorized,
        constraint = crowdsale.status == CrowdsaleStatus::Closed @ CrowdsaleError::CrowdsaleNotClosed,
    )]
    pub crowdsale: Account<'info, Crowdsale>,

    pub system_program: Program<'info, System>,
}

impl<'info> WithdrawFunds<'info> {
    /// Handles withdrawing excess lamports from the crowdsale account to the owner.
    pub fn handler(ctx: Context<WithdrawFunds>) -> Result<()> {
        let crowdsale_account = &ctx.accounts.crowdsale.to_account_info();
        let owner_account = &ctx.accounts.owner.to_account_info();

        let rent = Rent::get()?.minimum_balance(8 + Crowdsale::MAXIMUM_SIZE);
        let balance = crowdsale_account.lamports();
        let withdrawable = balance.checked_sub(rent).ok_or(CrowdsaleError::InsufficientFunds)?;

        require!(withdrawable > 0, CrowdsaleError::NoFundsToWithdraw);

        // Transfer excess lamports to owner via CPI
        anchor_lang::system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                anchor_lang::system_program::Transfer {
                    from: crowdsale_account.clone(),
                    to: owner_account.clone(),
                },
            ),
            withdrawable,
        )?;

        msg!("Withdrew {} lamports to owner", withdrawable);

        Ok(())
    }
}