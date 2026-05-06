// src/components/EntriesTable.tsx

import React, { useEffect, useState } from 'react';
import api from '../utils/axiosInstance';
import { EntryType, Entry, ItemRow, Role } from '../types';
import { Pencil, Trash2, Save, X, Plus, Search, Printer, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BillTemplate from './BillTemplate';

interface Props {
  type: EntryType;
  entries: Entry[];
  units: any[];                    // units passed from Dashboard
  userRole: Role | null;
  selectedUnit: string;
  onRefresh?: () => void;          // Optional refresh callback
}

const tableHeaders: Record<EntryType, string[]> = {
  Quotation: ['quotation_no', 'client_name', 'unit', 'description', 'date', 'total'],
  Invoice: ['invoice_no', 'client_name', 'unit', 'description', 'date', 'reference_no', 'status', 'total'],
  Purchase: ['buying_company', 'selling_company', 'unit', 'amount', 'mop', 'date', 'description', 'total'],
  Sale: ['selling_company', 'buying_company', 'unit', 'amount', 'mop', 'date', 'description', 'total'],
  Expense: ['date', 'unit', 'description', 'amount', 'mop'],
  'Payment Pending': ['date', 'company_name', 'unit', 'description', 'amount', 'mop'],
  'Goods Exp': ['s_no', 'date', 'unit', 'description', 'total'],
  'Cash Exp': ['s_no', 'date', 'unit', 'description', 'total'],
};

const COMPANY_OPTIONS = ['AT', 'PAM', 'MSC', 'SRS'];

export default function EntriesTable({ type, entries, units, userRole, selectedUnit, onRefresh }: Props) {
  const [visibleRows, setVisibleRows] = useState<Entry[]>([]);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editData, setEditData] = useState<Entry>({ description: [] });
  const [newEntry, setNewEntry] = useState<Entry>({ description: [] });
  const [searchUnit, setSearchUnit] = useState<string>('All');
  const [searchNo, setSearchNo] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [showLocalResults, setShowLocalResults] = useState(false);
  const [printEntry, setPrintEntry] = useState<Entry | null>(null);

  // Using userRole from props

  // Compute total for entries from description
  const computeTotal = (desc: ItemRow[] = []) =>
    desc.reduce((sum, i) => sum + (Number(i.quantity || 0) * Number(i.rate || 0)), 0).toFixed(2);

  const formatDate = (iso: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
  };

  // Apply filters whenever relevant dependencies change
  useEffect(() => {
    let filtered = [...entries];

    if (searchUnit !== 'All') {
      filtered = filtered.filter((r) => r.unit === searchUnit);
    }

    if (searchNo.trim()) {
      filtered = filtered.filter((r) => {
        const term = searchNo.toLowerCase();
        if (type === 'Sale' || type === 'Purchase') {
          return (r.unit?.toLowerCase().includes(term) ?? false) ||
                 (r.buying_company?.toLowerCase().includes(term) ?? false) ||
                 (r.selling_company?.toLowerCase().includes(term) ?? false);
        }
        return (r.quotation_no?.toLowerCase().includes(term) ?? false) ||
               (r.invoice_no?.toLowerCase().includes(searchNo.toLowerCase()) ?? false);
      });
    }

    if (fromDate) {
      const from = new Date(fromDate);
      filtered = filtered.filter((r) => new Date(r.date) >= from);
    }

    if (toDate) {
      const to = new Date(toDate);
      filtered = filtered.filter((r) => new Date(r.date) <= to);
    }

    setVisibleRows(filtered);
  }, [entries, searchUnit, searchNo, fromDate, toDate, selectedUnit]);

  // Reset new entry form when type changes
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setNewEntry({ description: [], company_name: selectedUnit, date: today });
    setSearchUnit('All');
    setSearchNo('');
    setFromDate('');
    setToDate('');
  }, [type]);

  const handleAddRow = () => {
    setNewEntry((prev) => ({
      ...prev,
      description: [...(prev.description || []), { item: '', denomination: '', quantity: '', rate: '' }],
    }));
  };

  const handleNewItemChange = (i: number, key: keyof ItemRow, value: string) => {
    const desc = [...(newEntry.description || [])];
    desc[i] = { ...desc[i], [key]: value };
    setNewEntry({ ...newEntry, description: desc, total: computeTotal(desc) });
  };

  const handleNewChange = (key: string, val: string) => {
    setNewEntry((prev) => ({ ...prev, [key]: val }));
  };

  const handleAdd = async () => {
    const total = computeTotal(newEntry.description || []);
    try {
      const res = await api.post(
        '/api/entries',
        { ...newEntry, type, total }
      );
      const added = res.data;
      if (onRefresh) onRefresh();
      setNewEntry({ description: [], company_name: selectedUnit, date: new Date().toISOString().split('T')[0] });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Add failed');
    }
  };

  const handleEdit = (i: number) => {
    setEditIndex(i);
    setEditData({ ...visibleRows[i] });
  };

  const handleEditChange = (key: string, value: string) => {
    setEditData((prev) => ({ ...prev, [key]: value }));
  };

  const handleEditItemChange = (i: number, key: keyof ItemRow, value: string) => {
    const desc = [...(editData.description || [])];
    desc[i] = { ...desc[i], [key]: value };
    setEditData({ ...editData, description: desc, total: computeTotal(desc) });
  };

  const handleSave = async () => {
    try {
      const res = await api.put(`/api/entries/${editData._id}`, editData);
      if (onRefresh) onRefresh();
      setEditIndex(null);
    } catch {
      alert('Update failed');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/api/entries/${id}`);
      if (onRefresh) onRefresh();
    } catch {
      alert('Delete failed');
    }
  };

  const handlePrint = (entry: Entry) => {
    setPrintEntry(entry);
    // Give state a moment to update before triggering print
    setTimeout(() => {
      window.print();
      setPrintEntry(null);
    }, 100);
  };

  const toggleStatus = async (row: Entry) => {
    const newStatus = row.status === 'Paid' ? 'Unpaid' : 'Paid';
    try {
      await api.put(`/api/entries/${row._id}`, { ...row, status: newStatus });
      if (onRefresh) onRefresh();
    } catch {
      alert('Status update failed');
    }
  };

  return (
    <div className="p-2 space-y-4">
      {/* 🔍 Search Section */}
      <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border dark:border-gray-700">
        <select
          value={searchUnit}
          onChange={(e) => setSearchUnit(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none min-w-[140px]"
        >
          <option value="All">All Units</option>
          {units.map((unit) => (
            <option key={unit._id} value={unit.name}>
              {unit.name}
            </option>
          ))}
        </select>
        
        <div className="relative flex-1 min-w-[200px]">
          <input
            value={searchNo}
            onChange={(e) => {
              setSearchNo(e.target.value);
              setShowLocalResults(true);
            }}
            onFocus={() => setShowLocalResults(true)}
            placeholder={type === 'Sale' || type === 'Purchase' ? "Search Unit/Company" : "No. Search..."}
            className="w-full border rounded-lg pl-10 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          
          {showLocalResults && searchNo.trim().length > 0 && (
            <div className="absolute top-full left-0 z-50 w-full bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl shadow-2xl mt-2 max-h-60 overflow-auto animate-slideDown">
              {entries
                .filter(e => {
                  const term = searchNo.toLowerCase();
                  if (type === 'Sale' || type === 'Purchase') {
                    return (e.unit?.toLowerCase().includes(term) ?? false) ||
                           (e.buying_company?.toLowerCase().includes(term) ?? false) ||
                           (e.selling_company?.toLowerCase().includes(term) ?? false);
                  }
                  return (e.quotation_no?.toLowerCase().includes(term) ?? false) ||
                         (e.invoice_no?.toLowerCase().includes(term) ?? false);
                })
                .slice(0, 5)
                .map((e, idx) => (
                  <div 
                    key={idx}
                    className="p-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer text-xs border-b dark:border-gray-700 last:border-0 dark:text-white transition-colors"
                    onClick={() => {
                      setSearchNo(e.unit || e.quotation_no || e.invoice_no || '');
                      setShowLocalResults(false);
                    }}
                  >
                    <div className="font-black text-blue-600 dark:text-blue-400">
                      {type === 'Sale' || type === 'Purchase' ? e.unit : (e.quotation_no || e.invoice_no)}
                    </div>
                    <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                      {type === 'Sale' || type === 'Purchase' ? (e.buying_company || e.selling_company) : e.unit} • {formatDate(e.date)}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="flex-1 sm:flex-none border rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <span className="text-gray-400">→</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="flex-1 sm:flex-none border rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Click outside to close local results */}
      {showLocalResults && (
        <div 
          className="fixed inset-0 z-[40]" 
          onClick={() => setShowLocalResults(false)}
        />
      )}

      {/* 📊 Table Container with Horizontal Scroll */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-gray-50 dark:bg-gray-700/50 border-b dark:border-gray-700">
              <tr>
                {tableHeaders[type].map((h) => (
                  <th key={h} className={`p-4 font-black text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 ${h === 'description' ? 'min-w-[300px]' : 'whitespace-nowrap'}`}>
                    {h.replace(/_/g, ' ')}
                  </th>
                ))}
                <th className="p-4 font-black text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700">
              {/* ➕ New Entry Row */}
              {(userRole === 'admin' || userRole === 'employee') && (
                <tr className="bg-blue-50/30 dark:bg-blue-900/10">
                  {tableHeaders[type].map((key) => (
                    <td key={key} className="p-3">
                      {key === 'total' ? (
                        <span className="font-black text-blue-600 dark:text-blue-400">{newEntry.total ?? '0.00'}</span>
                      ) : key === 'unit' ? (
                        <select
                          value={newEntry.unit ?? ''}
                          onChange={(e) => handleNewChange('unit', e.target.value)}
                          className="w-full border rounded-lg p-2 text-xs bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                        >
                          <option value="">Select</option>
                          {units.map((unit) => (
                            <option key={unit._id} value={unit.name}>
                              {unit.name}
                            </option>
                          ))}
                        </select>
                      ) : (key === 'client_name' || key === 'buying_company' || key === 'selling_company') && (type === 'Quotation' || type === 'Invoice') ? (
                        <input
                          value={newEntry[key] ?? ''}
                          onChange={(e) => handleNewChange(key, e.target.value)}
                          className="w-full border rounded p-2 text-xs bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                          placeholder="Client/Customer Name"
                        />
                      ) : key === 'company_name' ? (
                        <select
                          value={newEntry.company_name ?? ''}
                          onChange={(e) => handleNewChange('company_name', e.target.value)}
                          className="w-full border rounded-lg p-2 text-xs bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                        >
                          <option value="">Select</option>
                          {COMPANY_OPTIONS.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      ) : key === 'description' ? (
                        <div className="space-y-2">
                          {(newEntry.description || []).map((item, i) => (
                            <div key={i} className="flex gap-1">
                              <input
                                value={item.item}
                                onChange={(e) => handleNewItemChange(i, 'item', e.target.value)}
                                className="w-20 border rounded p-1.5 text-xs bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                placeholder="Item"
                              />
                              <input
                                value={item.denomination}
                                onChange={(e) => handleNewItemChange(i, 'denomination', e.target.value)}
                                className="w-16 border rounded p-1.5 text-xs bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                placeholder="Deno"
                              />
                              <input
                                value={item.quantity}
                                onChange={(e) => handleNewItemChange(i, 'quantity', e.target.value)}
                                className="w-12 border rounded p-1.5 text-xs bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                placeholder="Qty"
                              />
                              <input
                                value={item.rate}
                                onChange={(e) => handleNewItemChange(i, 'rate', e.target.value)}
                                className="w-16 border rounded p-1.5 text-xs bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                placeholder="Rate"
                              />
                            </div>
                          ))}
                          <button onClick={handleAddRow} className="flex items-center gap-1 text-blue-600 text-[10px] font-bold uppercase tracking-tighter hover:underline">
                            <Plus size={10} /> Add Item
                          </button>
                        </div>
                      ) : (
                        <input
                          value={newEntry[key] ?? ''}
                          onChange={(e) => handleNewChange(key, e.target.value)}
                          className="w-full border rounded p-2 text-xs bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                          placeholder={key.replace(/_/g, ' ')}
                        />
                      )}
                    </td>
                  ))}
                  <td className="p-3 text-center">
                    <button 
                      onClick={handleAdd} 
                      className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow-lg shadow-green-500/20 transition-all active:scale-90"
                      title="Add Entry"
                    >
                      <Plus size={18} />
                    </button>
                  </td>
                </tr>
              )}

              {/* 🔄 Display Filtered Entries */}
              {visibleRows.length > 0 ? (
                visibleRows.map((row, idx) => (
                  <tr key={row._id || idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    {tableHeaders[type].map((key) => (
                      <td key={key} className="p-4">
                        {editIndex === idx ? (
                          key === 'description' ? (
                            <div className="space-y-2">
                              {(editData.description || []).map((item, i) => (
                                <div key={i} className="flex gap-1">
                                  <input
                                    value={item.item}
                                    onChange={(e) => handleEditItemChange(i, 'item', e.target.value)}
                                    className="w-20 border rounded p-1.5 text-xs bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                  />
                                  <input
                                    value={item.denomination}
                                    onChange={(e) => handleEditItemChange(i, 'denomination', e.target.value)}
                                    className="w-16 border rounded p-1.5 text-xs bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                  />
                                  <input
                                    value={item.quantity}
                                    onChange={(e) => handleEditItemChange(i, 'quantity', e.target.value)}
                                    className="w-12 border rounded p-1.5 text-xs bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                  />
                                  <input
                                    value={item.rate}
                                    onChange={(e) => handleEditItemChange(i, 'rate', e.target.value)}
                                    className="w-16 border rounded p-1.5 text-xs bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                  />
                                </div>
                              ))}
                            </div>
                          ) : (
                            <input
                              value={editData[key] ?? ''}
                              onChange={(e) => handleEditChange(key, e.target.value)}
                              className="w-full border rounded p-2 text-xs bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                            />
                          )
                        ) : key === 'description' ? (
                          <div className="space-y-1">
                            {(row.description || []).map((d, i) => (
                              <div key={i} className="text-[11px] text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                <span className="w-1 h-1 rounded-full bg-blue-400" />
                                <span className="font-bold text-gray-800 dark:text-gray-200">{d.item}</span>
                                <span>{d.denomination} • {d.quantity} × {d.rate}</span>
                              </div>
                            ))}
                          </div>
                        ) : key === 'date' ? (
                          <span className="font-medium text-gray-500 whitespace-nowrap">{formatDate(row.date)}</span>
                        ) : key === 'total' ? (
                          <span className="font-black text-blue-600 dark:text-blue-400">
                            {/* @ts-ignore */}
                            {row[key]}
                          </span>
                        ) : key === 'status' ? (
                          <button 
                            onClick={() => toggleStatus(row)}
                            className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black uppercase transition-all ${
                              row.status === 'Paid' 
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            }`}
                          >
                            {row.status === 'Paid' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                            {row.status || 'Unpaid'}
                          </button>
                        ) : (
                          <span className="font-bold text-gray-700 dark:text-gray-200 whitespace-nowrap">
                            {/* @ts-ignore */}
                            {row[key]}
                          </span>
                        )}
                      </td>
                    ))}
                    <td className="p-4">
                      {editIndex === idx ? (
                        <div className="flex justify-center gap-2">
                          <button onClick={handleSave} className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors">
                            <Save size={16} />
                          </button>
                          <button onClick={() => setEditIndex(null)} className="p-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <div className="flex justify-center gap-2">
                            {(type === 'Invoice' || type === 'Quotation') && (
                              <button 
                                onClick={() => handlePrint(row)} 
                                className="p-1.5 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
                                title="Print Bill"
                              >
                                <Printer size={16} />
                              </button>
                            )}
                            {userRole === 'admin' && (
                              <>
                                <button onClick={() => handleEdit(idx)} className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                                  <Pencil size={16} />
                                </button>
                                <button onClick={() => handleDelete(row._id!)} className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                                  <Trash2 size={16} />
                                </button>
                              </>
                            )}
                          </div>
                          {userRole === 'admin' && (
                            <div className="text-[9px] font-black uppercase tracking-tighter text-gray-400">
                              By: {row.createdBy || 'SYSTEM'}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={tableHeaders[type].length + 1} className="p-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <Search size={40} className="opacity-20" />
                      <p className="font-bold text-sm">No entries found for this filter</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🖨️ Hidden Print Template */}
      <div className="hidden print:block fixed inset-0 z-[9999] bg-white">
        {printEntry && (
          <BillTemplate 
            entry={printEntry} 
            company={printEntry.company_name || selectedUnit} 
          />
        )}
      </div>
    </div>
  );
}
