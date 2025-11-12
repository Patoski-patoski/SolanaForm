import { useState, type FC } from 'react';
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Program, AnchorProvider, BN } from '@coral-xyz/anchor';
import idl from '../../idl/solana_form.json';
import { type SolanaForm } from '../../idl/solana_form';
import { USE_DEMO_MODE, PROGRAM_ID } from '../constants';
import type { View, CreateFormData } from '../types';

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
        const program = new Program<SolanaForm>(
          idl as any,
          PROGRAM_ID,
          provider
        );

        const formId = `form-${Date.now()}`;
        const [formPda] = await PublicKey.findProgramAddressSync(
          [Buffer.from('form'), Buffer.from(formId)],
          program.programId
        );

        await program.methods
          .initializeForm(
            formId,
            new BN(parseFloat(formData.prizePool) * LAMPORTS_PER_SOL),
            new BN(Date.now() / 1000 + parseInt(formData.duration) * 3600),
            parseInt(formData.maxParticipants)
          )
          .accounts({
            form: formPda,
            authority: wallet.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .rpc();

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

export default CreateFormView;
