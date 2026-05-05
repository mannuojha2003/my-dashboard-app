// src/pages/Dashboard.tsx

import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import EntriesTable from '../components/EntriesTable';
import WelcomeScreen from '../components/WelcomeScreen';
import { useAuth } from '../context/AuthContext';
import { Entry, EntryType } from '../types';
import api from '../utils/axiosInstance';

const Dashboard: React.FC = () => {
  const { userRole } = useAuth();

  const [selectedMenu, setSelectedMenu] = useState<EntryType | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<string>('AT');
  const [allEntries, setAllEntries] = useState<Entry[]>([]);
  const [units, setUnits] = useState<any[]>([]); // New state for units
  const [loading, setLoading] = useState<boolean>(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [entriesRes, unitsRes] = await Promise.all([
        api.get('/api/entries'),
        api.get('/api/units')
      ]);
      setAllEntries(Array.isArray(entriesRes.data) ? entriesRes.data : []);
      setUnits(Array.isArray(unitsRes.data) ? unitsRes.data : []);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const isHome = !selectedMenu;

  const filteredData = selectedMenu
    ? allEntries.filter(
        (entry) => entry.type === selectedMenu && entry.company_name === selectedUnit
      )
    : [];

  const handleGlobalSearchResult = (company: string, menu: EntryType) => {
    setSelectedUnit(company);
    setSelectedMenu(menu);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors overflow-hidden md:overflow-visible">
      <Sidebar onSelectMenu={setSelectedMenu} onSelectUnit={setSelectedUnit} />
      <div className="flex flex-col flex-1 h-full overflow-hidden">
        <Header 
          selectedMenu={selectedMenu} 
          selectedUnit={selectedUnit} 
          allEntries={allEntries}
          onSearchResultClick={handleGlobalSearchResult}
        />
        <main className="p-4 md:p-8 flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-[1600px] mx-auto">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : isHome ? (
              <WelcomeScreen />
            ) : (
              <div className="animate-fadeIn">
                <button
                  onClick={() => setSelectedMenu(null)}
                  className="mb-6 flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 rounded-xl font-black text-xs uppercase tracking-widest shadow-sm hover:shadow-md transition-all active:scale-95 border dark:border-gray-700"
                >
                  <span className="text-lg">←</span> Back to Overview
                </button>

                <EntriesTable
                  type={selectedMenu!}
                  entries={filteredData}
                  units={units}
                  userRole={userRole}
                  selectedUnit={selectedUnit}
                  onRefresh={fetchData}
                />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
