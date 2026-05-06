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

  const [activeTab, setActiveTab] = useState<'Invoice' | 'Quotation'>('Invoice');

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
  const quotations = allEntries.filter(e => e.type === 'Quotation');
  
  const totalBilled = invoices.reduce((sum, e) => sum + Number(e.total || 0), 0);
  const totalPaid = invoices.filter(e => e.status === 'Paid').reduce((sum, e) => sum + Number(e.total || 0), 0);
  const totalPending = totalBilled - totalPaid;
  const totalQuotations = quotations.reduce((sum, e) => sum + Number(e.total || 0), 0);

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
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Total Billed (Invoices)</p>
                  <h3 className="text-2xl font-black dark:text-white">₹{totalBilled.toLocaleString()}</h3>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border dark:border-gray-700 flex items-center gap-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl">
                  <Wallet size={24} />
                </div>
                <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Total Quoted</p>
                  <h3 className="text-2xl font-black dark:text-white">₹{totalQuotations.toLocaleString()}</h3>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border dark:border-gray-700 flex items-center gap-4 border-l-4 border-l-green-500">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl">
                  <CheckCircle size={24} />
                </div>
                <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Payments Received</p>
                  <h3 className="text-2xl font-black dark:text-white">₹{totalPaid.toLocaleString()}</h3>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border dark:border-gray-700 flex items-center gap-4 border-l-4 border-l-red-500">
                <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl">
                  <Clock size={24} />
                </div>
                <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Payments Pending</p>
                  <h3 className="text-2xl font-black dark:text-white">₹{totalPending.toLocaleString()}</h3>
                </div>
              </div>
            </div>

            {/* 🧾 Tabs for Invoices and Quotations */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700 overflow-hidden">
              <div className="p-6 border-b dark:border-gray-700">
                <h2 className="text-lg font-black dark:text-white uppercase tracking-tight mb-4">Billing Records</h2>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setActiveTab('Invoice')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                      activeTab === 'Invoice' 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    Invoices
                  </button>
                  <button 
                    onClick={() => setActiveTab('Quotation')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                      activeTab === 'Quotation' 
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    Quotations
                  </button>
                </div>
              </div>
              <EntriesTable 
                type={activeTab}
                entries={activeTab === 'Invoice' ? invoices : quotations}
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
