'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import LogoutModal from './LogoutModal';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { LogOut } from 'lucide-react';

const LogoutButton: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { getTranslation } = useLanguage();
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    setIsModalOpen(false);
    
    window.location.href = "/results/login";
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
      >
        <LogOut className="w-5 h-5" />
        <span className='HeaderNavExitText'>{getTranslation("HeaderNavExit")}</span>
      </button>

      {isModalOpen && (
        <LogoutModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleLogout}
        />
      )}
    </>
  );
};

export default LogoutButton;
