use anchor_lang::prelude::*;

/// Represents a crowdsale account, storing configuration and state for token sales.
#[account]
pub struct Crowdsale {
    pub id: Pubkey,              // 32 bytes
    pub cost: u32,               // 4 bytes  (cost per token in "lamports")
    pub mint_account: Pubkey,    // central source of SPL token account
    pub token_account: Pubkey,   // token vault account
    pub status: CrowdsaleStatus, // 1 byte
    pub owner: Pubkey,           // creator/owner of this crowdsale
}

impl Crowdsale {
    // Solana accounts need a fixed rent exempt space, allocated upfront
    // Pubkey u32 Pubkey Pubkey CrowdsaleStatus Pubkey
    // Added 32 bytes padding for future expansions without migrations
    pub const MAXIMUM_SIZE: usize = 32 + 4 + 32 + 32 + 1 + 32 + 32;
}


/// Represents the status of a crowdsale.
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum CrowdsaleStatus {
    /// The crowdsale is active and accepting purchases.
    Open,
    /// The crowdsale is inactive.
    Closed,
}

impl ToString for CrowdsaleStatus {
    fn to_string(&self) -> String {
        match self {
            CrowdsaleStatus::Open => "Open".to_string(),
            CrowdsaleStatus::Closed => "Closed".to_string(),
        }
    }
}