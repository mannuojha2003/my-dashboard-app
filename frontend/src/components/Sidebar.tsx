// src/components/Sidebar.tsx
import React, { useState } from 'react';
import { EntryType } from '../types';
import { Menu, X, Users, MapPin, PlusCircle, CreditCard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axiosInstance';

interface SidebarProps {
  onSelectMenu: (menu: EntryType) => void;
  onSelectUnit: (unit: string) => void;
}

interface Unit {
  _id?: string;
  name: string;
  address: string;
  contact: string;
}

const Sidebar: React.FC<SidebarProps> = ({ onSelectMenu, onSelectUnit }) => {
  const { userRole } = useAuth();
  const navigate = useNavigate();
  const companies = ['AT', 'PAM', 'MSC', 'SRS'];
  const menus: EntryType[] = ['Quotation', 'Invoice', 'Sale', 'Purchase'];
  
  const [units, setUnits] = useState<Unit[]>([]);
  const [isOpen, setIsOpen] = useState(true);
  const [hoveredCompany, setHoveredCompany] = useState<string | null>(null);
  const [showAddUnit, setShowAddUnit] = useState(false);
  const [newUnit, setNewUnit] = useState({ name: '', address: '', contact: '' });

  React.useEffect(() => {
    fetchUnits();
  }, []);

  const fetchUnits = async () => {
    try {
      const res = await api.get('/api/units');
      if (Array.isArray(res.data)) {
        setUnits(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch units', err);
    }
  };

  const handleAddUnit = async () => {
    try {
      await api.post('/api/units', newUnit);
      setNewUnit({ name: '', address: '', contact: '' });
      setShowAddUnit(false);
      fetchUnits();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add unit');
    }
  };

  const handleSubOptionClick = (company: string, menu: EntryType) => {
    onSelectUnit(company);
    onSelectMenu(menu);
  };

  return (
    <>
      {/* 📱 Mobile Toggle Bar */}
      <div className="md:hidden fixed top-0 left-0 w-full z-[60] bg-white dark:bg-gray-800 border-b dark:border-gray-700 h-16 flex items-center px-4 shadow-sm">
        <button 
          onClick={() => setIsOpen(true)} 
          className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
          aria-label="Open sidebar"
        >
          <Menu size={24} />
        </button>
        <h1 className="ml-4 font-bold text-gray-800 dark:text-white truncate">Dashboard</h1>
      </div>

      {/* 🌑 Backdrop (Mobile only) */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* 📂 Sidebar Container */}
      <div className={`
        fixed inset-y-0 left-0 z-[80] w-64 bg-white dark:bg-gray-800 shadow-2xl transition-transform duration-300 ease-in-out transform
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:z-auto md:shadow-md
      `}>
        <div className="h-full flex flex-col p-4 overflow-y-auto">
          <div className="flex items-center justify-end mb-8 md:mb-6">
            <button 
              onClick={() => setIsOpen(false)}
              className="md:hidden p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            >
              <X size={20} />
            </button>
          </div>

          <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 mb-4 tracking-widest uppercase">Companies</h2>
          <div className="space-y-1">
            {companies.map((company) => (
              <div 
                key={company} 
                className="relative"
                onMouseEnter={() => setHoveredCompany(company)}
                onMouseLeave={() => setHoveredCompany(null)}
              >
                <div className="group cursor-pointer flex items-center justify-between font-bold text-sm py-2.5 px-4 rounded-xl transition-all hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200">
                  {company}
                  <div className={`w-1.5 h-1.5 rounded-full bg-blue-500 transition-opacity ${hoveredCompany === company ? 'opacity-100' : 'opacity-0'}`} />
                </div>
                
                {/* Dropdown Menu on Hover */}
                <div 
                  className={`ml-4 space-y-1 overflow-hidden transition-all duration-300 ${
                    hoveredCompany === company ? 'max-h-48 opacity-100 mt-1 pb-2' : 'max-h-0 opacity-0 pointer-events-none'
                  }`}
                >
                  {menus.map((menu) => (
                    <div
                      key={menu}
                      onClick={() => {
                        handleSubOptionClick(company, menu);
                        setIsOpen(false); // Close sidebar on mobile after selection
                      }}
                      className="cursor-pointer text-xs py-2 px-4 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-300 font-bold transition-colors"
                    >
                      {menu}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Admin only: Employee Logs */}
          {userRole === 'admin' && (
            <div className="mt-8 pt-6 border-t dark:border-gray-700">
              <button
                onClick={() => {
                  navigate('/billing');
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl font-bold transition mb-1"
              >
                <CreditCard size={18} className="text-purple-500" />
                Billing Overview
              </button>
              <button
                onClick={() => {
                  navigate('/employee-logs');
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl font-bold transition"
              >
                <Users size={18} className="text-blue-500" />
                Employee Logs
              </button>
            </div>
          )}

          {/* Units Section */}
          <div className="mt-6 pt-6 border-t dark:border-gray-700">
            <div className="flex items-center justify-between px-4 mb-4">
              <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 tracking-widest uppercase">Units</h3>
              <button 
                onClick={() => setShowAddUnit(!showAddUnit)}
                className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full transition"
                title="Add New Unit"
              >
                <PlusCircle size={18} />
              </button>
            </div>

            {showAddUnit && (
              <div className="px-2 mb-4 space-y-2 bg-gray-50 dark:bg-gray-900/30 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                <input
                  placeholder="Unit Name"
                  className="w-full text-xs p-2.5 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newUnit.name}
                  onChange={e => setNewUnit({...newUnit, name: e.target.value})}
                />
                <input
                  placeholder="Location"
                  className="w-full text-xs p-2.5 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newUnit.address}
                  onChange={e => setNewUnit({...newUnit, address: e.target.value})}
                />
                <input
                  placeholder="Contact Number"
                  className="w-full text-xs p-2.5 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newUnit.contact}
                  onChange={e => setNewUnit({...newUnit, contact: e.target.value})}
                />
                <button 
                  onClick={handleAddUnit}
                  className="w-full bg-blue-600 text-white text-xs py-2.5 rounded-lg font-black hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                >
                  Save Unit
                </button>
              </div>
            )}

            <div className="space-y-1">
              {units.map(unit => (
                <div
                  key={unit._id}
                  onClick={() => {
                    navigate(`/units/${encodeURIComponent(unit.name)}`);
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl cursor-pointer transition"
                >
                  <MapPin size={16} className="text-gray-400 group-hover:text-blue-500" />
                  <span className="truncate font-medium">{unit.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
