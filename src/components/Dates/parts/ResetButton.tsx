import { RefreshCcw } from 'lucide-react';
import React from 'react';

interface ResetButtonProps { onReset: () => void; label: string; }
const ResetButton: React.FC<ResetButtonProps> = ({ onReset, label }) => (
  <button onClick={onReset} className="px-4 py-2 rounded-xl font-medium transition-all duration-200 bg-white text-gray-700 hover:bg-blue-50 flex items-center gap-2 shadow-sm border-b-2 border-red-100 hover:border-red-200">
  <RefreshCcw size={20} strokeWidth={1.75} />
  <span className="hidden xs530:inline">{label}</span>
  </button>
);
export default ResetButton;