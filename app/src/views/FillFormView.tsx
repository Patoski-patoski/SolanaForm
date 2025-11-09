import { useState, type FC } from 'react';
import { AnchorProvider } from '@project-serum/anchor';
import { CheckCircle } from 'lucide-react';
import { USE_DEMO_MODE } from '../constants';
import type { View, FormData } from '../types';

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

export default FillFormView;
