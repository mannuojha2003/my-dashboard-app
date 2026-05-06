import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import EntriesTable from '../components/EntriesTable';
import { useAuth } from '../context/AuthContext';
import { Entry, EntryType } from '../types';
import api from '../utils/axiosInstance';
import { Wallet, Clock, CheckCircle, TrendingUp } from 'lucide-react';

export default function BillingPage() {
  const { userRole } = useAuth();
  const [allEntries, setAllEntries] = useState<Entry[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  const invoices = allEntries.filter(e => e.type === 'Invoice');
  const totalBilled = invoices.reduce((sum, e) => sum + Number(e.total || 0), 0);
  const totalPaid = invoices.filter(e => e.status === 'Paid').reduce((sum, e) => sum + Number(e.total || 0), 0);
  const totalPending = totalBilled - totalPaid;

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors overflow-hidden">
      <Sidebar onSelectMenu={() => {}} onSelectUnit={() => {}} />
      <div className="flex flex-col flex-1 h-full overflow-hidden">
        <Header 
          selectedMenu="Billing Overview" 
          selectedUnit="Financials" 
          allEntries={allEntries}
        />
        <main className="p-4 md:p-8 flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-[1600px] mx-auto space-y-8">
            
            {/* 📊 Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border dark:border-gray-700 flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Total Billed</p>
                  <h3 className="text-2xl font-black dark:text-white">₹{totalBilled.toLocaleString()}</h3>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border dark:border-gray-700 flex items-center gap-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl">
                  <CheckCircle size={24} />
                </div>
                <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Received</p>
                  <h3 className="text-2xl font-black dark:text-white">₹{totalPaid.toLocaleString()}</h3>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border dark:border-gray-700 flex items-center gap-4">
                <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl">
                  <Clock size={24} />
                </div>
                <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Outstanding</p>
                  <h3 className="text-2xl font-black dark:text-white">₹{totalPending.toLocaleString()}</h3>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border dark:border-gray-700 flex items-center gap-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl">
                  <Wallet size={24} />
                </div>
                <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Efficiency</p>
                  <h3 className="text-2xl font-black dark:text-white">
                    {totalBilled > 0 ? ((totalPaid / totalBilled) * 100).toFixed(1) : 0}%
                  </h3>
                </div>
              </div>
            </div>

            {/* 🧾 Invoices Table */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700 overflow-hidden">
              <div className="p-6 border-b dark:border-gray-700 flex items-center justify-between">
                <h2 className="text-lg font-black dark:text-white uppercase tracking-tight">Recent Invoices</h2>
              </div>
              <EntriesTable 
                type="Invoice"
                entries={invoices}
                units={units}
                userRole={userRole}
                selectedUnit="All"
                onRefresh={fetchData}
              />
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
