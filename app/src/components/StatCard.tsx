import type { FC } from 'react';

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

export default StatCard;
