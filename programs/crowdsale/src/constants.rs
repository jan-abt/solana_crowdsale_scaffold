/*
    PDA (Program Derived Address):
        A deterministically generated public key used by programs to:
            - Act as an authority over token accounts, mints, or other assets
            - Be controlled only by the program, not by any private key
*/


use anchor_lang::prelude::*;

#[constant]
pub const AUTHORITY_SEED: &[u8] = b"authority";