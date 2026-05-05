import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import UserCircle from './UserCircle';
import PendingListMenu from './PendingListMenu';
import { Search, MapPin, FileText } from 'lucide-react';
import { Entry, EntryType } from '../types';

interface HeaderProps {
  selectedMenu: string | null;
  selectedUnit: string;
  allEntries?: Entry[];
  onSearchResultClick?: (company: string, menu: EntryType) => void;
}

export default function Header({ selectedMenu, selectedUnit, allEntries = [], onSearchResultClick }: HeaderProps) {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);

  const nameInitial =
    user?.role === 'admin'
      ? 'A'
      : user?.username?.[0]?.toUpperCase() || 'U';

  const loginTime = user?.loginTime || new Date().toLocaleString();
  const headerTitle = selectedMenu ? `${selectedUnit} - ${selectedMenu}` : 'Dashboard';

  // Filter entries based on search term
  const results = searchTerm.trim().length > 1
    ? allEntries.filter(e => 
        (e.quotation_no?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (e.invoice_no?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (e.buying_company?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (e.selling_company?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (e.company_name?.toLowerCase().includes(searchTerm.toLowerCase()))
      ).slice(0, 10) // Limit to 10 results
    : [];

  const handleResultClick = (e: Entry) => {
    if (onSearchResultClick) {
      onSearchResultClick(e.company_name || 'AT', e.type);
    }
    setSearchTerm('');
    setShowResults(false);
  };

  return (
    <div className="w-full bg-white dark:bg-gray-800 shadow-md border-b dark:border-gray-700 relative z-50 transition-colors h-16 md:h-20 flex items-center mt-16 md:mt-0">
      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

      <div className="w-full flex items-center justify-between px-4 sm:px-8 h-full gap-4">
        
        {/* 🔍 Global Search Section */}
        <div className="relative group flex-1 max-w-xs md:max-w-md hidden sm:block">
          <div className="flex items-center bg-gray-50 dark:bg-gray-700/50 rounded-xl px-4 py-2 border border-transparent focus-within:border-blue-500 focus-within:bg-white dark:focus-within:bg-gray-700 transition-all shadow-inner">
            <Search size={16} className="text-gray-400" />
            <input 
              type="text" 
              placeholder="Search everywhere..." 
              className="bg-transparent border-none focus:ring-0 text-sm ml-2 w-full dark:text-white placeholder-gray-400 font-medium"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowResults(true);
              }}
              onFocus={() => setShowResults(true)}
            />
          </div>

          {/* 🔽 Search Results Dropdown */}
          {showResults && searchTerm.trim().length > 1 && (
            <div className="absolute top-full left-0 mt-3 w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border dark:border-gray-700 overflow-hidden animate-slideDown z-[100]">
              {results.length > 0 ? (
                <div className="max-h-80 overflow-y-auto">
                  {results.map((res, i) => (
                    <div 
                      key={i} 
                      onClick={() => handleResultClick(res)}
                      className="p-4 hover:bg-blue-50 dark:hover:bg-blue-900/10 cursor-pointer border-b dark:border-gray-700 last:border-0 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-black text-blue-600 dark:text-blue-400 text-xs tracking-tight">
                          {res.quotation_no || res.invoice_no || 'ENTRY'}
                        </span>
                        <span className="text-[10px] bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-md font-black uppercase tracking-tighter">
                          {res.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-[11px] text-gray-500 dark:text-gray-400 font-bold">
                        <div className="flex items-center gap-1 uppercase tracking-tighter">
                          <MapPin size={10} /> {res.company_name}
                        </div>
                        <div className="flex items-center gap-1 uppercase tracking-tighter">
                          <FileText size={10} /> {res.unit}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-gray-400 text-sm font-bold">
                  No matching entries
                </div>
              )}
            </div>
          )}
        </div>

        {/* Center section: Dynamic Title (Hidden on mobile toggle bar already has it) */}
        <div className="flex-1 text-center hidden md:block">
          <h2 className="text-lg font-black text-gray-800 dark:text-white transition tracking-tight truncate uppercase px-2">
            {headerTitle}
          </h2>
        </div>

        {/* Right section: Pending List + User Circle */}
        <div className="flex justify-end items-center gap-3 sm:gap-6">
          <PendingListMenu />
          <UserCircle nameInitial={nameInitial} loginTime={loginTime} />
        </div>

      </div>
      
      {/* Click outside to close results */}
      {showResults && (
        <div 
          className="fixed inset-0 z-[-1]" 
          onClick={() => setShowResults(false)}
        />
      )}
    </div>
  );
}
