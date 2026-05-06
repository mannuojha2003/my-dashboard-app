import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axiosInstance';
import { ChevronDown, Clock, AlertCircle } from 'lucide-react';

interface Unit {
  _id?: string;
  name: string;
}

export default function PendingListMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        setLoading(true);
        const res = await api.get('/api/units');
        setUnits(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Failed to fetch units:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUnits();

    // Click outside handler
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUnitClick = (unitName: string) => {
    setIsOpen(false);
    navigate(`/pending-list/${encodeURIComponent(unitName)}`);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all duration-300
          ${isOpen 
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
            : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40'}
        `}
      >
        <Clock size={16} />
        <span>Pending List</span>
        <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-2xl shadow-2xl z-[100] overflow-hidden animate-slideDown">
          <div className="p-3 border-b dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
            <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Select Unit</h3>
          </div>
          
          <div className="max-h-64 overflow-y-auto custom-scrollbar p-1">
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full mx-auto" />
              </div>
            ) : units.length > 0 ? (
              units.map(unit => (
                <div 
                  key={unit._id || unit.name}
                  onClick={() => handleUnitClick(unit.name)}
                  className="flex items-center justify-between px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer rounded-xl transition-colors group"
                >
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {unit.name}
                  </span>
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))
            ) : (
              <div className="p-6 text-center">
                <AlertCircle size={24} className="mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                <p className="text-xs font-bold text-gray-400 dark:text-gray-500">No units found</p>
                <p className="text-[10px] text-gray-400 mt-1">Please add a unit first</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
