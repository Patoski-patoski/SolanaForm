import { useState, type FC } from 'react';
import { AnchorProvider, Program } from '@coral-xyz/anchor';
import { AlertCircle, CheckCircle, Loader, Trophy } from 'lucide-react';
import { USE_DEMO_MODE, PROGRAM_ID } from '../constants';
import type { View, FormData } from '../types';
import idl from '../idl/solana_form.json';
import { type SolanaForm } from '../idl/solana_form';
import { SystemProgram } from '@solana/web3.js';

interface DistributeViewProps {
  form: FormData | null;
  wallet: any;
  connection: any;
  setView: (view: View) => void;
}

// Helper function to deterministically select winners based on a seed
const calculateWinners = (
  participants: any[],
  seed: Buffer,
  maxWinners: number
) => {
  if (participants.length === 0) return [];

  // A simple pseudo-random number generator using the seed
  let random = new DataView(seed.buffer).getUint32(0, true);
  const shuffle = (arr: any[]) => {
    for (let i = arr.length - 1; i > 0; i--) {
      random = (random * 1664525 + 1013904223) | 0; // LCG
      const j = Math.abs(random) % (i + 1);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const shuffled = shuffle([...participants]);
  return shuffled
    .slice(0, maxWinners)
    .map((p) => p.account.user.toBase58());
};

const DistributeView: FC<DistributeViewProps> = ({
  form,
  wallet,
  connection,
  setView,
}) => {
  const [isDistributing, setIsDistributing] = useState(false);
  const [distributionStep, setDistributionStep] = useState<
    'idle' | 'distributing' | 'complete'
  >('idle');
  const [winners, setWinners] = useState<string[]>([]);

  if (!form || !form.publicKey) return null;

  const handleDistribute = async () => {
    if (!wallet.connected) {
      alert('Please connect your wallet first!');
      return;
    }

    setIsDistributing(true);
    setDistributionStep('distributing');

    try {
      if (USE_DEMO_MODE) {
        // Demo: Simulate distribution
        setTimeout(() => {
          const mockWinners = [
            'HN7cA...vQT9',
            'Gx9bF...kL2P',
            'Qw8vC...mN4R',
            'Zt7uD...pQ6S',
            'Lk6tE...rT8U',
          ];
          setWinners(mockWinners);
          setDistributionStep('complete');
          setIsDistributing(false);
        }, 3000);
      } else {
        // Production: Call distribute_prizes instruction
        const provider = new AnchorProvider(connection, wallet, {});
        const program = new Program<SolanaForm>(
          idl as any,
          PROGRAM_ID,
          provider
        ) as any;

        await program.methods
          .distributePrizes()
          .accounts({
            form: form.publicKey,
            authority: wallet.publicKey,
            systemProgram: SystemProgram.programId, // Added for recent Anchor versions
          })
          .rpc();

        // Fetch all participants for this form
        const participantAccounts = await program.account.participant.all([
          { memcmp: { offset: 8, bytes: form.publicKey!.toBase58() } },
        ]);

        // Fetch the updated form account to get the random seed
        const formAccount = await program.account.form.fetch(form.publicKey);
        const seed = Buffer.from(formAccount.randomSeed);

        // Calculate winners off-chain using the on-chain seed
        const winnerAddresses = calculateWinners(
          participantAccounts,
          seed,
          10 // Max winners
        );

        setWinners(winnerAddresses);
        setDistributionStep('complete');
        setIsDistributing(false);
      }
    } catch (error) {
      console.error('Error distributing prizes:', error);
      alert('Failed to distribute prizes: ' + (error as Error).message);
      setIsDistributing(false);
      setDistributionStep('idle');
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={() => setView('home')}
        className="text-purple-300 hover:text-purple-200 mb-6"
      >
        ← Back to Forms
      </button>

      <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-8 border border-purple-500 border-opacity-30 space-y-6">
        <div className="text-center">
          <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
          <h2 className="text-4xl font-bold mb-2">{form.title}</h2>
          <p className="text-purple-200">Prize Distribution</p>
        </div>

        <div className="bg-purple-600 bg-opacity-30 rounded-lg p-6 text-center">
          <p className="text-sm text-purple-200 mb-2">Total Prize Pool</p>
          <p className="text-4xl font-bold mb-2">{form.prizePool} SOL</p>
          <p className="text-sm text-purple-200">
            {form.participants} participants • Up to 10 winners
          </p>
          <p className="text-lg font-semibold mt-2 text-green-300">
            ~{(form.prizePool / Math.min(form.participants, 10)).toFixed(4)} SOL
            per winner
          </p>
        </div>

        {distributionStep === 'idle' && (
          <div className="space-y-4">
            <div className="bg-blue-600 bg-opacity-20 border border-blue-500 border-opacity-30 rounded-lg p-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                How it works
              </h3>
              <ol className="text-sm text-purple-200 space-y-2 list-decimal list-inside">
                <li>
                  The program generates a random seed from blockchain data.
                </li>
                <li>
                  This app uses the seed to deterministically select winners.
                </li>
                <li>Winners can then claim their prizes from the dashboard.</li>
                <li>Each winner gets an equal share of the prize pool.</li>
              </ol>
            </div>

            <button
              onClick={handleDistribute}
              disabled={isDistributing || !wallet.connected}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 py-4 rounded-lg font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              {!wallet.connected ? (
                'Connect Wallet to Distribute'
              ) : (
                <>
                  <Trophy className="w-5 h-5" />
                  Distribute Prizes
                </>
              )}
            </button>
          </div>
        )}

        {distributionStep === 'distributing' && (
          <div className="text-center py-8">
            <Loader className="w-12 h-12 mx-auto mb-4 animate-spin text-purple-400" />
            <h3 className="text-xl font-semibold mb-2">
              Generating Random Seed...
            </h3>
            <p className="text-purple-200 text-sm">
              Using on-chain data to select winners fairly
            </p>
          </div>
        )}

        {distributionStep === 'complete' && (
          <div className="space-y-4">
            <div className="bg-green-600 bg-opacity-20 border border-green-500 border-opacity-30 rounded-lg p-6 text-center">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-400" />
              <h3 className="text-2xl font-bold mb-2">
                Distribution Complete!
              </h3>
              <p className="text-purple-200">
                Winners can now claim their prizes
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">🎉 Winners</h3>
              <div className="space-y-2">
                {winners.map((winner, index) => (
                  <div
                    key={index}
                    className="bg-white bg-opacity-10 rounded-lg p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-yellow-500 bg-opacity-20 rounded-full w-10 h-10 flex items-center justify-center font-bold text-yellow-400">
                        {index + 1}
                      </div>
                      <span className="font-mono">{winner}</span>
                    </div>
                    <span className="text-green-400 font-semibold">
                      {(form.prizePool / winners.length).toFixed(4)} SOL
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setView('home')}
              className="w-full bg-purple-600 hover:bg-purple-700 py-3 rounded-lg font-semibold transition"
            >
              Back to Forms
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DistributeView;
