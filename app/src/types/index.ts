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
