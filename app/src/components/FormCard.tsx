import type { FC } from 'react';
import { Clock, Users, DollarSign, Trophy } from 'lucide-react';
import type { FormData } from '../types';

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

export default FormCard;
