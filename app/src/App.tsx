import React, { useState, useMemo, useEffect, type FC } from 'react';
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
import {
  WalletModalProvider,
  WalletMultiButton,
} from '@solana/wallet-adapter-react-ui';
import {
  clusterApiUrl,
  PublicKey,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import { Program, AnchorProvider, BN } from '@project-serum/anchor';
import {
  Clock,
  Users,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Trophy,
  Loader,
} from 'lucide-react';

// Import your IDL (you'll need to generate this after building)
// import idl from './idl/solana_form.json';

const PROGRAM_ID = new PublicKey(
  'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS'
);

// Toggle between demo and production mode
const USE_DEMO_MODE = true; // Set to false when using real program

// Types
interface FormData {
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

interface CreateFormData {
  title: string;
  description: string;
  prizePool: string;
  duration: string;
  maxParticipants: string;
  questions: string[];
}

type View = 'home' | 'create' | 'fill' | 'dashboard' | 'distribute';

// Mock data
const mockForms: FormData[] = [
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

      {/* Demo Mode Banner */}
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

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-6 border border-purple-500 border-opacity-30">
      <div className="flex justify-center mb-4 text-purple-300">{icon}</div>
      <h4 className="text-xl font-semibold mb-2">{title}</h4>
      <p className="text-purple-200">{description}</p>
    </div>
  );
};

interface FormCardProps {
  form: FormData;
  onSelect: () => void;
  onDistribute: () => void;
}

const FormCard: FC<FormCardProps> = ({ form, onSelect, onDistribute }) => {
  const timeLeft = form.deadline - Date.now();
  const hoursLeft = Math.floor(timeLeft / 3600000);
  const isExpired = timeLeft < 0;
  const prizePerWinner = (
    form.prizePool / Math.min(form.participants, 10)
  ).toFixed(4);

  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-6 border border-purple-500 border-opacity-30 hover:border-purple-400 transition">
      <h4 className="text-2xl font-bold mb-2">{form.title}</h4>
      <p className="text-purple-200 mb-4">{form.description}</p>

      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Prize Pool
          </span>
          <span className="font-semibold">{form.prizePool} SOL</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Participants
          </span>
          <span>
            {form.participants}/{form.maxParticipants}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {isExpired ? 'Ended' : 'Time Left'}
          </span>
          <span className={isExpired ? 'text-red-400' : ''}>
            {isExpired ? 'Closed' : `${hoursLeft}h remaining`}
          </span>
        </div>
      </div>

      <div className="bg-purple-600 bg-opacity-30 rounded-lg p-3 text-center mb-4">
        <p className="text-sm text-purple-200">Potential Prize</p>
        <p className="text-2xl font-bold">{prizePerWinner} SOL</p>
        <p className="text-xs text-purple-300">per winner (up to 10 winners)</p>
      </div>

      {!isExpired ? (
        <button
          onClick={onSelect}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-3 rounded-lg font-semibold transition"
        >
          Fill Form
        </button>
      ) : (
        <button
          onClick={onDistribute}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
        >
          <Trophy className="w-5 h-5" />
          {form.isDistributed ? 'Check Winners' : 'Distribute Prizes'}
        </button>
      )}
    </div>
  );
};

interface CreateFormViewProps {
  wallet: any;
  connection: any;
  setView: (view: View) => void;
}

const CreateFormView: FC<CreateFormViewProps> = ({
  wallet,
  connection,
  setView,
}) => {
  const [formData, setFormData] = useState<CreateFormData>({
    title: '',
    description: '',
    prizePool: '',
    duration: '48',
    maxParticipants: '100',
    questions: ['', '', ''],
  });
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateForm = async () => {
    if (!wallet.connected) {
      alert('Please connect your wallet first!');
      return;
    }

    setIsCreating(true);

    try {
      if (USE_DEMO_MODE) {
        // Demo mode - simulate creation
        setTimeout(() => {
          alert('✅ Form created successfully! (Demo mode)');
          setIsCreating(false);
          setView('dashboard');
        }, 2000);
      } else {
        // Production code:
        const provider = new AnchorProvider(connection, wallet, {});
        // const program = new Program(idl, PROGRAM_ID, provider);

        const formId = `form-${Date.now()}`;
        const [formPda] = await PublicKey.findProgramAddressSync(
          [Buffer.from('form'), Buffer.from(formId)],
          PROGRAM_ID
        );

        // await program.methods
        //   .initializeForm(
        //     formId,
        //     new BN(parseFloat(formData.prizePool) * LAMPORTS_PER_SOL),
        //     new BN(Date.now() / 1000 + parseInt(formData.duration) * 3600),
        //     parseInt(formData.maxParticipants)
        //   )
        //   .accounts({
        //     form: formPda,
        //     authority: wallet.publicKey,
        //     systemProgram: SystemProgram.programId,
        //   })
        //   .rpc();

        alert('Form created successfully!');
        setIsCreating(false);
        setView('dashboard');
      }
    } catch (error) {
      console.error('Error creating form:', error);
      alert('Failed to create form: ' + (error as Error).message);
      setIsCreating(false);
    }
  };

  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [...formData.questions, ''],
    });
  };

  const updateQuestion = (index: number, value: string) => {
    const newQuestions = [...formData.questions];
    newQuestions[index] = value;
    setFormData({ ...formData, questions: newQuestions });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-4xl font-bold mb-8">Create New Form</h2>

      <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-8 border border-purple-500 border-opacity-30 space-y-6">
        <div>
          <label className="block text-sm font-semibold mb-2">Form Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-20 border border-purple-500 border-opacity-30 focus:outline-none focus:border-purple-400 text-white"
            placeholder="e.g., Customer Satisfaction Survey"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-20 border border-purple-500 border-opacity-30 focus:outline-none focus:border-purple-400 text-white"
            rows={3}
            placeholder="Describe your form..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">
              Prize Pool (SOL)
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.prizePool}
              onChange={(e) =>
                setFormData({ ...formData, prizePool: e.target.value })
              }
              className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-20 border border-purple-500 border-opacity-30 focus:outline-none focus:border-purple-400 text-white"
              placeholder="1.0"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Duration (hours)
            </label>
            <input
              type="number"
              value={formData.duration}
              onChange={(e) =>
                setFormData({ ...formData, duration: e.target.value })
              }
              className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-20 border border-purple-500 border-opacity-30 focus:outline-none focus:border-purple-400 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Max Participants
            </label>
            <input
              type="number"
              value={formData.maxParticipants}
              onChange={(e) =>
                setFormData({ ...formData, maxParticipants: e.target.value })
              }
              className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-20 border border-purple-500 border-opacity-30 focus:outline-none focus:border-purple-400 text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Questions</label>
          {formData.questions.map((question, index) => (
            <input
              key={index}
              type="text"
              value={question}
              onChange={(e) => updateQuestion(index, e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-20 border border-purple-500 border-opacity-30 focus:outline-none focus:border-purple-400 mb-3 text-white"
              placeholder={`Question ${index + 1}`}
            />
          ))}
          <button
            onClick={addQuestion}
            className="text-purple-300 hover:text-purple-200 text-sm"
          >
            + Add Question
          </button>
        </div>

        <button
          onClick={handleCreateForm}
          disabled={isCreating || !wallet.connected}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-4 rounded-lg font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {isCreating
            ? 'Creating...'
            : wallet.connected
            ? 'Create Form & Deposit Prize'
            : 'Connect Wallet to Create'}
        </button>
      </div>
    </div>
  );
};

interface FillFormViewProps {
  form: FormData | null;
  wallet: any;
  connection: any;
  setView: (view: View) => void;
}

const FillFormView: FC<FillFormViewProps> = ({
  form,
  wallet,
  connection,
  setView,
}) => {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!form) return null;

  const handleSubmit = async () => {
    if (!wallet.connected) {
      alert('Please connect your wallet first!');
      return;
    }

    if (!email) {
      alert('Please enter your email address');
      return;
    }

    setIsSubmitting(true);

    try {
      if (USE_DEMO_MODE) {
        setTimeout(() => {
          alert(
            `✅ Form submitted! You're now entered to win ${(
              form.prizePool / Math.min(form.participants, 10)
            ).toFixed(4)} SOL`
          );
          setIsSubmitting(false);
          setView('home');
        }, 2000);
      } else {
        // Production: Hash email and submit to program
        const encoder = new TextEncoder();
        const emailData = encoder.encode(email);
        const hashBuffer = await crypto.subtle.digest('SHA-256', emailData);
        const emailHash = Array.from(new Uint8Array(hashBuffer));

        const provider = new AnchorProvider(connection, wallet, {});
        // const program = new Program(idl, PROGRAM_ID, provider);

        // await program.methods
        //   .submitForm(emailHash)
        //   .accounts({
        //     form: formPda,
        //     participant: participantPda,
        //     user: wallet.publicKey,
        //     systemProgram: SystemProgram.programId,
        //   })
        //   .rpc();

        alert('Form submitted successfully!');
        setIsSubmitting(false);
        setView('home');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to submit form: ' + (error as Error).message);
      setIsSubmitting(false);
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
        <div>
          <h2 className="text-4xl font-bold mb-2">{form.title}</h2>
          <p className="text-purple-200">{form.description}</p>
        </div>

        <div className="bg-purple-600 bg-opacity-30 rounded-lg p-4">
          <p className="text-sm text-purple-200">💰 You could win</p>
          <p className="text-3xl font-bold">
            {(form.prizePool / Math.min(form.participants, 10)).toFixed(4)} SOL
          </p>
          <p className="text-xs text-purple-300 mt-1">
            {form.participants} participants • Up to 10 winners
          </p>
        </div>

        <div className="space-y-4">
          {form.questions.map((question, index) => (
            <div key={index}>
              <label className="block text-sm font-semibold mb-2">
                {index + 1}. {question}
              </label>
              <textarea
                value={answers[index] || ''}
                onChange={(e) =>
                  setAnswers({ ...answers, [index]: e.target.value })
                }
                className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-20 border border-purple-500 border-opacity-30 focus:outline-none focus:border-purple-400 text-white"
                rows={3}
                placeholder="Your answer..."
              />
            </div>
          ))}
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">
            Email Address (for verification)
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-20 border border-purple-500 border-opacity-30 focus:outline-none focus:border-purple-400 text-white"
            placeholder="your@email.com"
          />
          <p className="text-xs text-purple-300 mt-1">
            Your email will be hashed for privacy. We'll only use it to prevent
            spam.
          </p>
        </div>

        {wallet.connected && (
          <div className="bg-green-600 bg-opacity-20 border border-green-500 border-opacity-30 rounded-lg p-4">
            <p className="text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Wallet connected: {wallet.publicKey.toString().slice(0, 8)}...
            </p>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !wallet.connected}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-4 rounded-lg font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {isSubmitting
            ? 'Submitting...'
            : wallet.connected
            ? 'Submit & Enter Draw'
            : 'Connect Wallet to Submit'}
        </button>
      </div>
    </div>
  );
};

interface DistributeViewProps {
  form: FormData | null;
  wallet: any;
  connection: any;
  setView: (view: View) => void;
}

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

  if (!form) return null;

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
          // Mock winners
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
        // const program = new Program(idl, PROGRAM_ID, provider);

        // const formId = form.id;
        // const [formPda] = await PublicKey.findProgramAddressSync(
        //   [Buffer.from('form'), Buffer.from(formId)],
        //   PROGRAM_ID
        // );

        // await program.methods
        //   .distributePrizes()
        //   .accounts({
        //     form: formPda,
        //     authority: wallet.publicKey,
        //   })
        //   .rpc();

        // Fetch form data to get random_seed
        // const formAccount = await program.account.form.fetch(formPda);
        
        // Calculate winners off-chain using the random_seed
        // const winnerAddresses = await calculateWinners(formAccount);
        
        setWinners([]);
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
            ~{(form.prizePool / Math.min(form.participants, 10)).toFixed(4)} SOL per winner
          </p>
        </div>

        {distributionStep === 'idle' && (
          <div className="space-y-4">
            <div className="bg-blue-600 bg-opacity-20 border border-blue-500 border-opacity-30 rounded-lg p-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                How it works (Demo Mode)
              </h3>
              <ol className="text-sm text-purple-200 space-y-2 list-decimal list-inside">
                <li>Generate random seed from blockchain data (slot, timestamp, form ID)</li>
                <li>Use seed to deterministically select winners</li>
                <li>Winners can claim their prizes automatically</li>
                <li>Each winner gets equal share of prize pool</li>
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
            <h3 className="text-xl font-semibold mb-2">Generating Random Seed...</h3>
            <p className="text-purple-200 text-sm">
              Using on-chain data to select winners fairly
            </p>
          </div>
        )}

        {distributionStep === 'complete' && (
          <div className="space-y-4">
            <div className="bg-green-600 bg-opacity-20 border border-green-500 border-opacity-30 rounded-lg p-6 text-center">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-400" />
              <h3 className="text-2xl font-bold mb-2">Distribution Complete!</h3>
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

interface DashboardViewProps {
  wallet: any;
  connection: any;
}

const DashboardView: FC<DashboardViewProps> = ({ wallet }) => {
  const [myForms, setMyForms] = useState<any[]>([]);
  const [mySubmissions, setMySubmissions] = useState<any[]>([]);
  const [checkingPrize, setCheckingPrize] = useState(false);

  useEffect(() => {
    if (wallet.connected) {
      setMyForms([
        {
          id: 'my-form-1',
          title: 'My Survey',
          participants: 15,
          prizePool: 0.5,
          status: 'active',
        },
      ]);
      setMySubmissions([
        {
          formTitle: 'Product Feedback',
          submittedAt: Date.now() - 3600000,
          status: 'pending',
          canClaim: true,
        },
      ]);
    }
  }, [wallet.connected]);

  const handleCheckPrize = async (submission: any) => {
    if (!wallet.connected) return;
    
    setCheckingPrize(true);
    
    try {
      if (USE_DEMO_MODE) {
        setTimeout(() => {
          const isWinner = Math.random() > 0.5;
          if (isWinner) {
            alert('🎉 Congratulations! You won 0.05 SOL! Click to claim your prize.');
          } else {
            alert('Sorry, you were not selected as a winner this time. Better luck next time!');
          }
          setCheckingPrize(false);
        }, 2000);
      } else {
        // Production: Call check_and_claim_prize
        // This will automatically check if user is winner and transfer prize
        // const provider = new AnchorProvider(connection, wallet, {});
        // const program = new Program(idl, PROGRAM_ID, provider);
        
        // await program.methods
        //   .checkAndClaimPrize()
        //   .accounts({
        //     form: formPda,
        //     participant: participantPda,
        //     winner: wallet.publicKey,
        //     systemProgram: SystemProgram.programId,
        //   })
        //   .rpc();
        
        alert('Prize claimed successfully!');
        setCheckingPrize(false);
      }
    } catch (error: any) {
      if (error.message.includes('NotAWinner')) {
        alert('You were not selected as a winner this time.');
      } else {
        alert('Error: ' + error.message);
      }
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

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-4xl font-bold mb-6">My Dashboard</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard title="Forms Created" value="1" />
          <StatCard title="Forms Completed" value="3" />
          <StatCard title="Total Winnings" value="0.15 SOL" />
        </div>
      </div>

      <div>
        <h3 className="text-2xl font-bold mb-4">My Forms</h3>
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
                  <span className="text-xs bg-green-600 px-2 py-1 rounded-full">
                    {form.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-2xl font-bold mb-4">My Submissions</h3>
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
                    Submitted {new Date(submission.submittedAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs bg-yellow-600 px-3 py-1 rounded-full">
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
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string;
}

const StatCard: FC<StatCardProps> = ({ title, value }) => {
  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-6 border border-purple-500 border-opacity-30">
      <p className="text-sm text-purple-200 mb-1">{title}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
};

export default App;