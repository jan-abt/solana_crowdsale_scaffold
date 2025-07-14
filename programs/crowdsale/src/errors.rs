use anchor_lang::prelude::*;

/// Custom error codes for the crowdsale program.
#[error_code]
pub enum CrowdsaleError {
    #[msg("Cost must be greater than zero")]
    InvalidCost,
    #[msg("Token account mint does not match provided mint")]
    MintMismatch,

    // Variants for buy_tokens and future instructions
    #[msg("Crowdsale is closed and not accepting purchases")]
    CrowdsaleClosed,
    #[msg("Purchase amount must be greater than zero")]
    InvalidAmount,
    #[msg("Insufficient tokens in the crowdsale vault")]
    InsufficientTokens,
    #[msg("Payment amount is incorrect (expected: amount * cost)")]
    IncorrectPayment,
    #[msg("Arithmetic overflow during cost calculation")]
    Overflow,
    #[msg("Buyer has insufficient lamports for the purchase")]
    InsufficientFunds,

    // Variants for withdraw_funds
    #[msg("Only the crowdsale owner can perform this action")]
    Unauthorized,
    #[msg("Crowdsale must be closed before withdrawing funds")]
    CrowdsaleNotClosed,
    #[msg("No funds available to withdraw")]
    NoFundsToWithdraw,
}