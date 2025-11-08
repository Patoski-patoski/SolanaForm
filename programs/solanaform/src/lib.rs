use anchor_lang::prelude::*;
use anchor_lang::system_program;

declare_id!("YourProgramIDHere111111111111111111111111111");

#[program]
pub mod solana_form {
    use super::*;

    /// Initialize a new form with prize pool
    pub fn initialize_form(
        ctx: Context<InitializeForm>,
        form_id: String,
        prize_pool: u64,
        deadline: i64,
        max_participants: u32,
    ) -> Result<()> {
        let form = &mut ctx.accounts.form;
        form.authority = ctx.accounts.authority.key();
        form.form_id = form_id;
        form.prize_pool = prize_pool;
        form.collected_amount = 0;
        form.deadline = deadline;
        form.max_participants = max_participants;
        form.participant_count = 0;
        form.is_active = true;
        form.is_distributed = false;
        form.bump = ctx.bumps.form;

        msg!("Form initialized: {}", form.form_id);
        Ok(())
    }

    /// Deposit prize pool by form creator
    pub fn deposit_prize(ctx: Context<DepositPrize>) -> Result<()> {
        let form = &mut ctx.accounts.form;
        
        require!(form.is_active, ErrorCode::FormInactive);
        require!(!form.is_distributed, ErrorCode::AlreadyDistributed);
        require!(
            form.collected_amount < form.prize_pool,
            ErrorCode::PrizePoolFilled
        );

        let deposit_amount = form.prize_pool - form.collected_amount;

        // Transfer SOL from authority to form PDA
        system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                system_program::Transfer {
                    from: ctx.accounts.authority.to_account_info(),
                    to: ctx.accounts.form.to_account_info(),
                },
            ),
            deposit_amount,
        )?;

        form.collected_amount += deposit_amount;
        msg!("Prize deposited: {} lamports", deposit_amount);
        Ok(())
    }

    /// Submit form and register participant
    pub fn submit_form(
        ctx: Context<SubmitForm>,
        email_hash: [u8; 32], // Hash of email for privacy
    ) -> Result<()> {
        let form = &mut ctx.accounts.form;
        let participant = &mut ctx.accounts.participant;
        let clock = Clock::get()?;

        require!(form.is_active, ErrorCode::FormInactive);
        require!(!form.is_distributed, ErrorCode::AlreadyDistributed);
        require!(
            clock.unix_timestamp < form.deadline,
            ErrorCode::DeadlinePassed
        );
        require!(
            form.participant_count < form.max_participants,
            ErrorCode::MaxParticipantsReached
        );

        participant.wallet = ctx.accounts.user.key();
        participant.form = form.key();
        participant.email_hash = email_hash;
        participant.timestamp = clock.unix_timestamp;
        participant.bump = ctx.bumps.participant;

        form.participant_count += 1;

        msg!("Participant registered: {}", ctx.accounts.user.key());
        Ok(())
    }

    /// Distribute prizes to random participants
    pub fn distribute_prizes(ctx: Context<DistributePrizes>) -> Result<()> {
        let form = &mut ctx.accounts.form;
        let clock = Clock::get()?;

        require!(form.is_active, ErrorCode::FormInactive);
        require!(!form.is_distributed, ErrorCode::AlreadyDistributed);
        require!(
            clock.unix_timestamp >= form.deadline,
            ErrorCode::DeadlineNotReached
        );
        require!(
            ctx.accounts.authority.key() == form.authority,
            ErrorCode::Unauthorized
        );
        require!(form.participant_count > 0, ErrorCode::NoParticipants);

        // Calculate prize per winner (for MVP: equal distribution)
        let total_prize = form.collected_amount;
        let winners_count = form.participant_count.min(10); // Max 10 winners for MVP
        let prize_per_winner = total_prize / winners_count as u64;

        form.is_distributed = true;
        form.is_active = false;
        
        msg!(
            "Distribution initialized: {} winners, {} lamports each",
            winners_count,
            prize_per_winner
        );

        Ok(())
    }

    /// Transfer prize to individual winner (called multiple times)
    pub fn claim_prize(ctx: Context<ClaimPrize>) -> Result<()> {
        let form = &ctx.accounts.form;
        let participant = &mut ctx.accounts.participant;

        require!(form.is_distributed, ErrorCode::NotDistributed);
        require!(!participant.claimed, ErrorCode::AlreadyClaimed);

        // Calculate prize amount
        let winners_count = form.participant_count.min(10);
        let prize_amount = form.collected_amount / winners_count as u64;

        // Transfer from form PDA to participant
        let form_seeds = &[
            b"form",
            form.form_id.as_bytes(),
            &[form.bump],
        ];
        let signer_seeds = &[&form_seeds[..]];

        **form.to_account_info().try_borrow_mut_lamports()? -= prize_amount;
        **ctx.accounts.winner.try_borrow_mut_lamports()? += prize_amount;

        participant.claimed = true;

        msg!("Prize claimed: {} lamports to {}", prize_amount, ctx.accounts.winner.key());
        Ok(())
    }

    /// Close form and refund if no participants
    pub fn close_form(ctx: Context<CloseForm>) -> Result<()> {
        let form = &ctx.accounts.form;
        
        require!(
            ctx.accounts.authority.key() == form.authority,
            ErrorCode::Unauthorized
        );
        require!(
            form.participant_count == 0 || form.is_distributed,
            ErrorCode::CannotClose
        );

        msg!("Form closed and refunded");
        Ok(())
    }
}

// ============ CONTEXTS ============

#[derive(Accounts)]
#[instruction(form_id: String)]
pub struct InitializeForm<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Form::INIT_SPACE,
        seeds = [b"form", form_id.as_bytes()],
        bump
    )]
    pub form: Account<'info, Form>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DepositPrize<'info> {
    #[account(
        mut,
        seeds = [b"form", form.form_id.as_bytes()],
        bump = form.bump,
        has_one = authority
    )]
    pub form: Account<'info, Form>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SubmitForm<'info> {
    #[account(
        mut,
        seeds = [b"form", form.form_id.as_bytes()],
        bump = form.bump
    )]
    pub form: Account<'info, Form>,
    
    #[account(
        init,
        payer = user,
        space = 8 + Participant::INIT_SPACE,
        seeds = [b"participant", form.key().as_ref(), user.key().as_ref()],
        bump
    )]
    pub participant: Account<'info, Participant>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DistributePrizes<'info> {
    #[account(
        mut,
        seeds = [b"form", form.form_id.as_bytes()],
        bump = form.bump,
        has_one = authority
    )]
    pub form: Account<'info, Form>,
    
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct ClaimPrize<'info> {
    #[account(
        mut,
        seeds = [b"form", form.form_id.as_bytes()],
        bump = form.bump
    )]
    pub form: Account<'info, Form>,
    
    #[account(
        mut,
        seeds = [b"participant", form.key().as_ref(), winner.key().as_ref()],
        bump = participant.bump,
        has_one = form
    )]
    pub participant: Account<'info, Participant>,
    
    /// CHECK: Winner receiving prize
    #[account(mut)]
    pub winner: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CloseForm<'info> {
    #[account(
        mut,
        seeds = [b"form", form.form_id.as_bytes()],
        bump = form.bump,
        has_one = authority,
        close = authority
    )]
    pub form: Account<'info, Form>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
}

// ============ ACCOUNTS ============

#[account]
#[derive(InitSpace)]
pub struct Form {
    pub authority: Pubkey,           // 32
    #[max_len(50)]
    pub form_id: String,             // 4 + 50
    pub prize_pool: u64,             // 8
    pub collected_amount: u64,       // 8
    pub deadline: i64,               // 8
    pub max_participants: u32,       // 4
    pub participant_count: u32,      // 4
    pub is_active: bool,             // 1
    pub is_distributed: bool,        // 1
    pub bump: u8,                    // 1
}

#[account]
#[derive(InitSpace)]
pub struct Participant {
    pub wallet: Pubkey,              // 32
    pub form: Pubkey,                // 32
    #[max_len(64)]
    pub email_hash: [u8; 32],        // 4 + 64 (SHA256 hash)
    pub timestamp: i64,              // 8
    pub claimed: bool,               // 1
    pub bump: u8,                    // 1
}

// ============ ERRORS ============

#[error_code]
pub enum ErrorCode {
    #[msg("Form is not active")]
    FormInactive,
    
    #[msg("Prizes already distributed")]
    AlreadyDistributed,
    
    #[msg("Prize pool already filled")]
    PrizePoolFilled,
    
    #[msg("Deadline has passed")]
    DeadlinePassed,
    
    #[msg("Deadline has not been reached yet")]
    DeadlineNotReached,
    
    #[msg("Maximum participants reached")]
    MaxParticipantsReached,
    
    #[msg("Unauthorized")]
    Unauthorized,
    
    #[msg("No participants to distribute to")]
    NoParticipants,
    
    #[msg("Prizes not distributed yet")]
    NotDistributed,
    
    #[msg("Prize already claimed")]
    AlreadyClaimed,
    
    #[msg("Cannot close form with active participants")]
    CannotClose,
}