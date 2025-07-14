
use anchor_lang::prelude::*;

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
    pub const MAXIMUM_SIZE: usize = 32 + 4 + 32 + 32 + 1 + 32;
}

// deserialize/serialize enum  bytes
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum CrowdsaleStatus {
    Open,
    Closed,
}
