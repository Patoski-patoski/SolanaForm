import { useState, useEffect, type FC } from 'react';
import { Users, CheckCircle, DollarSign, Loader, AlertCircle } from 'lucide-react';
import { Program, AnchorProvider } from '@coral-xyz/anchor';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';
import idl from '../../idl/solana_form.json';
import { type SolanaForm } from '../../idl/solana_form';
import { PROGRAM_ID, RPC_URL } from '../constants';
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
      setIsLoading(true);
      setError(null);
      try {
        // Anonymous provider for fetching public data
        const connection = new Connection(RPC_URL, 'confirmed');
        const provider = new AnchorProvider(
          connection,
          wallet || ({} as any),
          {}
        );
        const program = new Program<SolanaForm>(
          idl as any,
          PROGRAM_ID,
          provider
        );

        const formAccounts = await program.account.form.all();
        const now = Date.now() / 1000;

        const activeForms = formAccounts
          .filter((form) => form.account.endTime.toNumber() > now)
          .map((form) => ({
            id: form.account.formId,
            title: form.account.formId.replace(/-/g, ' '),
            participants: form.account.participantCount,
            prizePool: form.account.prizePool.toNumber() / LAMPORTS_PER_SOL,
            status: 'active',
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
            <p className="mt-4 text-red-300">Failed to edit, 0 occurrences found for old_string (// app/src/views.HomeView.tsx

import type { FC } from 'react';
import { Users, CheckCircle, DollarSign } from 'lucide-react';
import type { View, FormData } from '../types';
import { mockForms } from '../constants';
import FeatureCard from '../components/FeatureCard';
import FormCard from '../components/FormCard';

interface HomeViewProps {
  setView: (view: View) => void;
  setSelectedForm: (form: FormData) => void;
}

const HomeView: FC<HomeViewProps> = ({ setView, setSelectedForm }) => {
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
          }
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockForms.map((form) => (
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
      </div>
    </div>
  );
};

export default HomeView;
). Original old_string was (// app/src/views.HomeView.tsx

import type { FC } from 'react';
import { Users, CheckCircle, DollarSign } from 'lucide-react';
import type { View, FormData } from '../types';
import { mockForms } from '../constants';
import FeatureCard from '../components/FeatureCard';
import FormCard from '../components/FormCard';

interface HomeViewProps {
  setView: (view: View) => void;
  setSelectedForm: (form: FormData) => void;
}

const HomeView: FC<HomeViewProps> = ({ setView, setSelectedForm }) => {
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
          }
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockForms.map((form) => (
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
      </div>
    </div>
  );
};

export default HomeView;
) in /home/patrick/solanaform/app/src/views/HomeView.tsx. No edits made. The exact text in old_string was not found. Ensure you're not escaping content incorrectly and check whitespace, indentation, and context. Use read_file tool to verify.</p>
          </div>
        ) : (
