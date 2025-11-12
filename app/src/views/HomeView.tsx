// app/src/views/HomeView.tsx
import { useState, useEffect, type FC } from 'react';
import { Users, CheckCircle, DollarSign, Loader, AlertCircle } from 'lucide-react';
import { Program, AnchorProvider } from '@coral-xyz/anchor';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';
import idl from '../idl/solana_form.json';
import { RPC_URL, USE_DEMO_MODE, mockForms } from '../constants';
import type { View, FormData } from '../types';
import FeatureCard from '../components/FeatureCard';
import FormCard from '../components/FormCard';

interface HomeViewProps {
  setView: (view: View) => void;
  setSelectedForm: (form: FormData) => void;
}

const HomeView: FC<HomeViewProps> = ({ setView, setSelectedForm }) => {
  const [forms, setForms] = useState<FormData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const wallet = useAnchorWallet();

  useEffect(() => {
    const fetchAllForms = async () => {
      if (USE_DEMO_MODE) {
        // Demo mode - use mock data
        setForms(mockForms);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Anonymous provider for fetching public data
        const connection = new Connection(RPC_URL, 'confirmed');
        const provider = new AnchorProvider(
          connection,
          wallet || ({} as any),
          { commitment: 'confirmed' }
        );

        // Use 'any' type for program to avoid strict type checking issues
        const program = new Program(
          idl as any,
          provider
        ) as any;

        const formAccounts = await program.account.form.all();
        const now = Date.now() / 1000;

        const activeForms: FormData[] = formAccounts
          .filter((form: any) => form.account.deadline.toNumber() > now)
          .map((form: any) => ({
            id: form.account.formId,
            title: form.account.formId.replace(/-/g, ' '),
            description: `Complete this survey to win SOL prizes`,
            participants: form.account.participantCount,
            prizePool: form.account.prizePool.toNumber() / LAMPORTS_PER_SOL,
            deadline: form.account.deadline.toNumber() * 1000,
            maxParticipants: form.account.maxParticipants,
            questions: ['Question 1', 'Question 2', 'Question 3'], // Placeholder
            isDistributed: form.account.isDistributed,
            publicKey: form.publicKey,
          }));

        setForms(activeForms);
      } catch (err) {
        console.error('Error fetching forms:', err);
        setError('Failed to fetch active forms. Please try refreshing.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllForms();
  }, [wallet]);

  return (
    <div className="space-y-8">
      <div className="text-center py-12">
        <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
          Get Paid to Share Your Opinion
        </h2>
        <p className="text-xl text-purple-200 mb-8">
          Complete forms, connect your Solana wallet, and win rewards instantly
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
          <FeatureCard
            icon={<Users className="w-8 h-8" />}
            title="Connect Wallet"
            description="Link your Solana wallet securely"
          />
          <FeatureCard
            icon={<CheckCircle className="w-8 h-8" />}
            title="Fill Forms"
            description="Complete surveys and questionnaires"
          />
          <FeatureCard
            icon={<DollarSign className="w-8 h-8" />}
            title="Win Rewards"
            description="Get randomly selected for SOL prizes"
          />
        </div>
      </div>

      <div>
        <h3 className="text-3xl font-bold mb-6">Active Forms</h3>
        {isLoading ? (
          <div className="text-center py-10">
            <Loader className="w-12 h-12 mx-auto animate-spin text-purple-300" />
            <p className="mt-4 text-purple-200">Loading active forms...</p>
          </div>
        ) : error ? (
          <div className="text-center py-10 bg-red-500 bg-opacity-20 rounded-lg">
            <AlertCircle className="w-12 h-12 mx-auto text-red-400" />
            <p className="mt-4 text-red-300">{error}</p>
          </div>
        ) : forms.length === 0 ? (
          <div className="text-center py-10 bg-purple-500 bg-opacity-20 rounded-lg">
            <AlertCircle className="w-12 h-12 mx-auto text-purple-300" />
            <p className="mt-4 text-purple-200">No active forms available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {forms.map((form) => (
              <FormCard
                key={form.id}
                form={form}
                onSelect={() => {
                  setSelectedForm(form);
                  setView('fill');
                }}
                onDistribute={() => {
                  setSelectedForm(form);
                  setView('distribute');
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeView;