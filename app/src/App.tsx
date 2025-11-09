import React, { useState, useMemo, type FC } from 'react';
import {
  ConnectionProvider,
  WalletProvider,
  useConnection,
  useWallet,
} from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';

import { USE_DEMO_MODE } from './constants';
import type { View, FormData } from './types';

import Header from './components/Header';
import HomeView from './views/HomeView';
import CreateFormView from './views/CreateFormView';
import FillFormView from './views/FillFormView';
import DashboardView from './views/DashboardView';
import DistributeView from './views/DistributeView';

const App: FC = () => {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter({ network }),
    ],
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <SolanaFormApp />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

const SolanaFormApp: FC = () => {
  const [view, setView] = useState<View>('home');
  const [selectedForm, setSelectedForm] = useState<FormData | null>(null);
  const { connection } = useConnection();
  const wallet = useWallet();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 text-white">
      <Header setView={setView} />

      {USE_DEMO_MODE && (
        <div className="bg-yellow-600 bg-opacity-20 border-b border-yellow-500 border-opacity-30 py-2 px-4 text-center">
          <p className="text-sm">
            🎮 <strong>Demo Mode</strong> - Using simplified on-chain randomness for testing
          </p>
        </div>
      )}

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {view === 'home' && (
          <HomeView setView={setView} setSelectedForm={setSelectedForm} />
        )}
        {view === 'create' && (
          <CreateFormView
            wallet={wallet}
            connection={connection}
            setView={setView}
          />
        )}
        {view === 'fill' && (
          <FillFormView
            form={selectedForm}
            wallet={wallet}
            connection={connection}
            setView={setView}
          }
        />
        )}
        {view === 'dashboard' && (
          <DashboardView wallet={wallet} connection={connection} />
        )}
        {view === 'distribute' && (
          <DistributeView
            form={selectedForm}
            wallet={wallet}
            connection={connection}
            setView={setView}
          />
        )}
      </main>
    </div>
  );
};

export default App;
