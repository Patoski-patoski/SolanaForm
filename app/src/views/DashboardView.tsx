import { useState, useEffect, type FC } from 'react';
import { AlertCircle, Loader, Trophy } from 'lucide-react';
import { Program, AnchorProvider } from '@coral-xyz/anchor';
import { LAMPORTS_PER_SOL, SystemProgram } from '@solana/web3.js';
import idl from '../idl/solana_form.json';
import { type SolanaForm } from '../idl/solana_form';
import { USE_DEMO_MODE, PROGRAM_ID } from '../constants';
import StatCard from '../components/StatCard';

interface DashboardViewProps {
  wallet: any;
  connection: any;
}

const DashboardView: FC<DashboardViewProps> = ({ wallet, connection }) => {
  const [myForms, setMyForms] = useState<any[]>([]);
  const [mySubmissions, setMySubmissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkingPrize, setCheckingPrize] = useState(false);

  useEffect(() => {
    const fetchMyData = async () => {
      if (!wallet.connected || !wallet.publicKey) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const provider = new AnchorProvider(connection, wallet, {
          preflightCommitment: 'processed',
        });
        const program = new Program<SolanaForm>(
          idl as any,
          PROGRAM_ID,
          provider
        ) as any;

        // Fetch forms created by the user
        const formAccounts = await program.account.form.all([
          { 
            memcmp: {
              offset: 8, // Discriminator
              bytes: wallet.publicKey.toBase58(),
            },
          },
        ]);
        const formattedForms = formAccounts.map((form) => ({
          publicKey: form.publicKey,
          id: form.account.formId,
          title: form.account.formId.replace(/-/g, ' '),
          participants: form.account.participantCount,
          prizePool: form.account.prizePool.toNumber() / LAMPORTS_PER_SOL,
          status:
            form.account.endTime.toNumber() > Date.now() / 1000
              ? 'active'
              : 'ended',
        }));
        setMyForms(formattedForms);

        // Fetch submissions made by the user
        const participantAccounts = await program.account.participant.all([
          {
            memcmp: {
              offset: 8 + 32, // Discriminator + Form Pubkey
              bytes: wallet.publicKey.toBase58(),
            },
          },
        ]);

        const submissions = await Promise.all(
          participantAccounts.map(async (p) => {
            const formAccount = await program.account.form.fetch(
              p.account.form
            );
            const canClaim =
              formAccount.endTime.toNumber() < Date.now() / 1000 &&
              !p.account.claimed;
            return {
              formPublicKey: p.account.form,
              participantPublicKey: p.publicKey,
              formTitle: formAccount.formId.replace(/-/g, ' '),
              submittedAt: p.account.submissionTime.toNumber() * 1000,
              status: p.account.claimed
                ? 'Claimed'
                : canClaim
                ? 'Ended'
                : 'Pending',
              canClaim,
            };
          })
        );
        setMySubmissions(submissions);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to fetch your data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyData();
  }, [wallet, connection]);

  const handleCheckPrize = async (submission: any) => {
    if (!wallet.connected || !wallet.publicKey) return;

    setCheckingPrize(true);

    try {
      if (USE_DEMO_MODE) {
        setTimeout(() => {
          const isWinner = Math.random() > 0.5;
          if (isWinner) {
            alert(
              '🎉 Congratulations! You won 0.05 SOL! Click to claim your prize.'
            );
          } else {
            alert(
              'Sorry, you were not selected as a winner this time. Better luck next time!'
            );
          }
          setCheckingPrize(false);
        }, 2000);
      } else {
        const provider = new AnchorProvider(connection, wallet, {});
        const program = new Program<SolanaForm>(
          idl as any,
          PROGRAM_ID,
          provider
        ) as any;

        await program.methods
          .checkAndClaimPrize()
          .accounts({
            form: submission.formPublicKey,
            participant: submission.participantPublicKey,
            winner: wallet.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .rpc();

        alert('Prize claimed successfully! Check your wallet for the SOL.');
        // Refresh data
        setMySubmissions(
          mySubmissions.map((s) =>
            s.participantPublicKey === submission.participantPublicKey
              ? { ...s, canClaim: false, status: 'Claimed' }
              : s
          )
        );
      }
    } catch (error: any) {
      if (error.toString().includes('NotAWinner')) {
        alert('You were not selected as a winner this time.');
      } else {
        alert('Error claiming prize: ' + error.message);
      }
    } finally {
      setCheckingPrize(false);
    }
  };

  if (!wallet.connected) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="w-16 h-16 mx-auto mb-4 text-purple-300" />
        <h3 className="text-2xl font-bold mb-2">Connect Your Wallet</h3>
        <p className="text-purple-200">
          Please connect your wallet to view your dashboard
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-16">
        <Loader className="w-16 h-16 mx-auto mb-4 text-purple-300 animate-spin" />
        <h3 className="text-2xl font-bold mb-2">Loading Dashboard</h3>
        <p className="text-purple-200">Fetching your on-chain data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 bg-red-500 bg-opacity-20 rounded-lg">
        <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
        <h3 className="text-2xl font-bold mb-2 text-white">
          An Error Occurred
        </h3>
        <p className="text-red-300">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-4xl font-bold mb-6">My Dashboard</h2>

        <div className="grid grid-cols-1 md-grid-cols-3 gap-6 mb-8">
          <StatCard title="Forms Created" value={myForms.length} />
          <StatCard title="Forms Completed" value={mySubmissions.length} />
          <StatCard title="Total Winnings" value="0.00 SOL" />
        </div>
      </div>

      <div>
        <h3 className="text-2xl font-bold mb-4">My Forms</h3>
        {myForms.length > 0 ? (
          <div className="space-y-4">
            {myForms.map((form) => (
              <div
                key={form.id}
                className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-6 border border-purple-500 border-opacity-30"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-xl font-semibold">{form.title}</h4>
                    <p className="text-sm text-purple-200">
                      {form.participants} participants
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{form.prizePool} SOL</p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        form.status === 'active'
                          ? 'bg-green-600'
                          : 'bg-gray-600'
                      }`}
                    >
                      {form.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-purple-200">You haven't created any forms yet.</p>
        )}
      </div>

      <div>
        <h3 className="text-2xl font-bold mb-4">My Submissions</h3>
        {mySubmissions.length > 0 ? (
          <div className="space-y-4">
            {mySubmissions.map((submission, index) => (
              <div
                key={index}
                className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-6 border border-purple-500 border-opacity-30"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-xl font-semibold">
                      {submission.formTitle}
                    </h4>
                    <p className="text-sm text-purple-200">
                      Submitted{' '}
                      {new Date(submission.submittedAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs px-3 py-1 rounded-full ${
                        submission.status === 'Claimed'
                          ? 'bg-green-600'
                          : 'bg-yellow-600'
                      }`}
                    >
                      {submission.status}
                    </span>
                    {submission.canClaim && (
                      <button
                        onClick={() => handleCheckPrize(submission)}
                        disabled={checkingPrize}
                        className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-semibold text-sm disabled:opacity-50 transition flex items-center gap-2"
                      >
                        {checkingPrize ? (
                          <>
                            <Loader className="w-4 h-4 animate-spin" />
                            Checking...
                          </>
                        ) : (
                          <>
                            <Trophy className="w-4 h-4" />
                            Check Prize
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-purple-200">
            You haven't submitted any forms yet.
          </p>
        )}
      </div>
    </div>
  );
};

export default DashboardView;
