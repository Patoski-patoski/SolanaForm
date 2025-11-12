// app/src/types/index.ts
import type { PublicKey } from '@solana/web3.js';

export interface FormData {
  id: string;
  title: string;
  description: string;
  prizePool: number;
  deadline: number;
  participants: number;
  maxParticipants: number;
  questions: string[];
  isDistributed?: boolean;
  publicKey?: PublicKey; // Add optional publicKey for on-chain forms
}

export interface CreateFormData {
  title: string;
  description: string;
  prizePool: string;
  duration: string;
  maxParticipants: string;
  questions: string[];
}

export type View = 'home' | 'create' | 'fill' | 'dashboard' | 'distribute';