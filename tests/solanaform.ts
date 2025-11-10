import * as anchor from '@coral-xyz/anchor';
import { Program } from '@project-serum/anchor';
import { SolanaForm } from '../target/types/solana_form';
import { assert } from 'chai';

describe('solana_form', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.SolanaForm as Program<SolanaForm>;
  const authority = provider.wallet;

  const formId = `test-form-${Date.now()}`;
  const prizePool = new anchor.BN(1 * anchor.web3.LAMPORTS_PER_SOL); // 1 SOL
  const deadline = new anchor.BN(Date.now() / 1000 + 60 * 60); // 1 hour from now
  const maxParticipants = 100;

  const [formPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from('form'), Buffer.from(formId)],
    program.programId
  );

  it('Initializes a form', async () => {
    // Call the initialize_form instruction
    await program.methods
      .initializeForm(
        formId,
        prizePool,
        deadline,
        maxParticipants
      )
      .accounts({
        form: formPda,
        authority: authority.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    // Fetch the created form account
    const formAccount = await program.account.form.fetch(formPda);

    // Assert that the data was written correctly
    assert.ok(formAccount.authority.equals(authority.publicKey));
    assert.equal(formAccount.formId, formId);
    assert.ok(formAccount.prizePool.eq(prizePool));
    assert.ok(formAccount.deadline.eq(deadline));
    assert.equal(formAccount.maxParticipants, maxParticipants);
    assert.equal(formAccount.participantCount, 0);
    assert.isTrue(formAccount.isActive);
    assert.isFalse(formAccount.isDistributed);
  });
});

