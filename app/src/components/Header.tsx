import type { FC } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { DollarSign } from 'lucide-react';
import type { View } from '../types';

interface HeaderProps {
  setView: (view: View) => void;
}

const Header: FC<HeaderProps> = ({ setView }) => {
  return (
    <header className="bg-black bg-opacity-30 backdrop-blur-md border-b border-purple-500 border-opacity-30">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
            <DollarSign className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold">SolanaForm</h1>
        </div>

        <nav className="flex items-center space-x-4">
          <button
            onClick={() => setView('home')}
            className="hover:text-purple-300 transition"
          >
            Explore
          </button>
          <button
            onClick={() => setView('create')}
            className="hover:text-purple-300 transition"
          >
            Create Form
          </button>
          <button
            onClick={() => setView('dashboard')}
            className="hover:text-purple-300 transition"
          >
            Dashboard
          </button>
          <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700" />
        </nav>
      </div>
    </header>
  );
};

export default Header;
