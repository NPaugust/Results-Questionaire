"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

interface TableSearchProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  columnName: string;
  className?: string;
} 

export const TableSearch: React.FC<TableSearchProps> = ({
  placeholder = "Поиск...",
  onSearch,
  columnName,
  className = ""
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const inputRef = useRef<HTMLInputElement>(null);

  // Открывает поиск и фокусируется на инпуте
  const openSearch = () => {
    setIsSearchOpen(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  // Закрывает поиск и очищает запрос
  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery("");
    onSearch("");
  };

  // Обновляет поисковый запрос
  useEffect(() => {
    onSearch(debouncedSearchQuery);
  }, [debouncedSearchQuery, onSearch]);

  return (
    <div className={`flex items-center justify-between ${className}`}>
      {!isSearchOpen ? (
        <>
          <span className="truncate mr-2">{columnName}</span>
          <button 
            onClick={openSearch}
            className="p-1 hover:bg-gray-100 rounded-full"
            aria-label="Поиск"
          >
            <Search className="w-4 h-4 text-gray-500" />
          </button>
        </>
      ) : (
        <div className="flex items-center justify-between w-full">
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full border-0 outline-none bg-transparent text-sm focus:ring-0 py-1"
          />
          <button
            onClick={closeSearch}
            className="p-1 hover:bg-gray-100 rounded-full"
            aria-label="Закрыть поиск"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      )}
    </div>
  );
}; 