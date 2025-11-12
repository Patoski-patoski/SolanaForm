// app/src/constants/index.ts
import { PublicKey, clusterApiUrl } from '@solana/web3.js';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import type { FormData } from '../types';


export const PROGRAM_ID = new PublicKey(
  'FnBCbFZ1Y4rhjRuKe94HDfXcxkjL9DiU21YhCJzHRcZY'
);

export const NETWORK = WalletAdapterNetwork.Devnet;
export const RPC_URL = clusterApiUrl(NETWORK);

export const USE_DEMO_MODE = false;

export const mockForms: FormData[] = [
  {
    id: 'survey-2024-1',
    title: 'Product Feedback Survey',
    description: 'Help us improve our product by sharing your thoughts',
    prizePool: 0.5,
    deadline: Date.now() + 3600000 * 48,
    participants: 23,
    maxParticipants: 100,
    questions: [
      'How satisfied are you with our product?',
      'What feature would you like to see next?',
      'Would you recommend us to a friend?',
    ],
    isDistributed: false,
  },
  {
    id: 'marketing-study-2024',
    title: 'Consumer Behavior Study',
    description: 'Win SOL by completing our 5-minute marketing survey',
    prizePool: 1.0,
    deadline: Date.now() - 3600000, // Expired (for testing distribution)
    participants: 45,
    maxParticipants: 200,
    questions: [
      'What social media platforms do you use daily?',
      'How often do you make online purchases?',
      'What factors influence your buying decisions?',
    ],
    isDistributed: false,
  },
];