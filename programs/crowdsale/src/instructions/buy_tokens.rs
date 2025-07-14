use anchor_lang::solana_program::example_mocks::solana_sdk::system_instruction;

use {
    anchor_lang::prelude::*,
    anchor_spl::{
        associated_token::AssociatedToken,
        token::{transfer, Mint, Token, TokenAccount, Transfer},
    },
};

use crate::{
    constants::AUTHORITY_SEED,
    errors::CrowdsaleError,
    state::{Crowdsale, CrowdsaleStatus},
};

/// Accounts for buying tokens from the crowdsale.
#[derive(Accounts)]
pub struct BuyTokens<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,

    #[account(
        init_if_needed,
        payer = buyer,
        associated_token::mint = mint_account,
        associated_token::authority = buyer
    )]
    pub buyer_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [
            crowdsale.id.as_ref(),
        ],
        bump,
    )]
    pub crowdsale: Account<'info, Crowdsale>,

    #[account(
        mut,
        associated_token::mint = mint_account,
        associated_token::authority = crowdsale_authority
    )]
    pub crowdsale_token_account: Account<'info, TokenAccount>,

    /// CHECK: This is a PDA authority, derived from crowdsale ID and seed—program-controlled, no data to deserialize.
    #[account(
        seeds = [
            crowdsale.id.as_ref(),
            AUTHORITY_SEED,
        ],
        bump,
    )]
    pub crowdsale_authority: AccountInfo<'info>,

    #[account(mut)]
    pub mint_account: Account<'info, Mint>,

    /// CHECK: This is the crowdsale owner's account for receiving payments. It's validated by the `address = crowdsale.owner` constraint, ensuring it matches the stored owner key—no further type checks or deserialization needed as it's just for lamport transfers.
    #[account(
        mut,
        address = crowdsale.owner
    )]
    pub owner_account: AccountInfo<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

impl<'info> BuyTokens<'info> {
    /// Handles buying tokens from the crowdsale: Validates, transfers payment, and transfers tokens.
    pub fn handler(ctx: Context<BuyTokens>, amount: u32) -> Result<()> {
        
        let crowdsale = &mut ctx.accounts.crowdsale;
        
        require_eq!(
            crowdsale.status,
            CrowdsaleStatus::Open,
            CrowdsaleError::CrowdsaleClosed
        );
        
        require!(amount > 0, CrowdsaleError::InvalidAmount);

        let cost = amount
            .checked_mul(crowdsale.cost)
            .ok_or(CrowdsaleError::Overflow)? as u64; // Safe mul to prevent overflow

        // Check sufficient tokens in vault
        require!(
            ctx.accounts.crowdsale_token_account.amount >= amount as u64,
            CrowdsaleError::InsufficientTokens
        );

        // Check buyer has enough lamports (optional but good practice)
        require!(
            ctx.accounts.buyer.lamports() >= cost,
            CrowdsaleError::InsufficientFunds
        );

        // Transfer SOL/lamports from buyer to crowdsale owner
        anchor_lang::system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                anchor_lang::system_program::Transfer {
                    from: ctx.accounts.buyer.to_account_info(),
                    to: ctx.accounts.owner_account.to_account_info(),
                },
            ),
            cost,
        )?;

        // Transfer tokens from crowdsale vault to buyer (via CPI)
        let authority_seeds = &[
            crowdsale.id.as_ref(),
            AUTHORITY_SEED,
            &[ctx.bumps.crowdsale_authority],
        ];
        transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.crowdsale_token_account.to_account_info(),
                    to: ctx.accounts.buyer_token_account.to_account_info(),
                    authority: ctx.accounts.crowdsale_authority.to_account_info(),
                },
                &[authority_seeds],
            ),
            amount as u64,
        )?;

        msg!("Bought {} tokens for {} lamports", amount, cost);

        Ok(())
    }

    pub fn handler_deprecated(ctx: Context<BuyTokens>, amount: u32) -> Result<()> {
        // calculate the amount of SOL needed to buy n number of token x, in lamport
        let amount_of_lamports = (amount * ctx.accounts.crowdsale.cost) as u64;

        let from = &ctx.accounts.buyer;
        let to = &ctx.accounts.crowdsale;

        let transfer_intstruction =
            system_instruction::transfer(&from.key(), &to.key(), amount_of_lamports);

        anchor_lang::solana_program::program::invoke_signed(
            &transfer_intstruction,
            &[
                from.to_account_info(),
                to.to_account_info().clone(),
                ctx.accounts.system_program.to_account_info(),
            ],
            &[],
        )?;

        let authority_seeds = &[
            &ctx.accounts.crowdsale.id.to_bytes(),
            AUTHORITY_SEED,
            &[ctx.bumps.crowdsale_authority],
        ];
        let signer_seeds = &[&authority_seeds[..]];

        transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.crowdsale_token_account.to_account_info(),
                    to: ctx.accounts.buyer_token_account.to_account_info(),
                    authority: ctx.accounts.crowdsale_authority.to_account_info(),
                },
                signer_seeds,
            ),
            amount as u64,
        )?;

        msg!("Token transfered");
        Ok(())
    }

}
