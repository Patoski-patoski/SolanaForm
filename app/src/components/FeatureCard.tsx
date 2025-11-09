import type { FC, ReactNode } from 'react';

interface FeatureCardProps {
  icon: ReactNode;
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

export default FeatureCard;
