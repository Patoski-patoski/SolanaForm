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
