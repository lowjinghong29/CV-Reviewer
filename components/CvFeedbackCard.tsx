
import React, { ReactNode } from 'react';
import { CheckCircle } from 'lucide-react';

interface CvFeedbackCardProps {
  title: string;
  items: string[];
  icon: ReactNode;
  description: string;
}

const CvFeedbackCard: React.FC<CvFeedbackCardProps> = ({ title, items, icon, description }) => {
  if (items.length === 0) return null;

  return (
    <div className="bg-gray-800/60 p-5 rounded-lg border border-gray-700 h-full shadow-md">
      <div className="flex items-center mb-3">
        <div className="mr-3">{icon}</div>
        <h4 className="text-lg font-semibold capitalize text-gray-100">{title}</h4>
      </div>
      <p className="text-sm text-gray-400 mb-4">{description}</p>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-start">
            <CheckCircle className="w-4 h-4 text-blue-400 mr-3 mt-1 flex-shrink-0" />
            <span className="text-gray-300 text-sm">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CvFeedbackCard;
