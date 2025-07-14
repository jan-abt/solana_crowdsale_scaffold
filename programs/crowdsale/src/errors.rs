use anchor_lang::prelude::*;

#[error_code]
pub enum CrowdsaleError {
    #[msg("Cost must be greater than zero")]
    InvalidCost,
    #[msg("Token account mint does not match provided mint")]
    MintMismatch,
}