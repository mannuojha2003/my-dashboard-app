import React from 'react';
import { Entry, ItemRow } from '../types';

interface BillTemplateProps {
  entry: Entry;
  company: string;
  units?: any[];
}

const BillTemplate = React.forwardRef<HTMLDivElement, BillTemplateProps>(({ entry, company, units = [] }, ref) => {
  const getCompanyDetails = (name: string) => {
    switch (name) {
      case 'AT':
        return {
          fullName: 'AARYA TRADERS',
          taxType: 'IGST',
          taxRate: 18,
          terms: [
            'Our responsibility ceases soon after the goods leave from our premises.',
            'Goods once sold will not be returned under any circumstances.',
            'All goods remains the property of "Aarya Traders" until full payment has been received.'
          ]
        };
      case 'MSC':
        return {
          fullName: 'MARINE SHIP CARE',
          taxType: 'Inclusive',
          taxRate: 0,
          address: 'D. No. 71-31-801, Kranti Nagar, Malkapuram, Visakhapatnam - 530005',
          email: 'marineshipcare6419@gmail.com',
          cell: '8804536419',
          gstin: '37AXJPK7896A1Z2',
          pan: 'AXJPK7896A',
          bank: 'CBI',
          account: '5233456144',
          ifsc: 'CBIN0281170',
          terms: [
            'Our responsibility ceases soon after the goods leave from our premises.',
            'Goods once sold will not be returned under any circumstances.',
            'All Goods remains the property of Marine Ship Care until final receipt of payment.'
          ]
        };
      case 'PAM':
        return {
          fullName: 'PROACTIVE MARINERS',
          taxType: 'Split',
          taxRate: 18, // 9+9
          terms: [
            'Our responsibility ceases soon after the goods leave from our premises.',
            'Goods once sold will not be returned under any circumstances.',
            'All Goods remains the property of "PROACTIVE MARINERS" until final receipt of payment.'
          ]
        };
      case 'SRS':
        return {
          fullName: 'SRI RAM SOLUTIONS',
          taxType: 'IGST',
          taxRate: 5,
          terms: [
            'Our responsibility ceases soon after the goods leave from our premises.',
            'Goods once sold will not be returned under any circumstances.',
            'All goods remains the property of "Sri Ram Solutions" until full payment has been received.'
          ]
        };
      default:
        return { fullName: name, taxType: 'None', taxRate: 0, terms: [] };
    }
  };

  const details = getCompanyDetails(company);
  const items = entry.description || [];
  const subTotal = items.reduce((acc, item) => acc + (Number(item.quantity) * Number(item.rate)), 0);
  
  let taxAmount = 0;
  let cgst = 0;
  let sgst = 0;
  let igst = 0;

  if (details.taxType === 'IGST') {
    igst = (subTotal * details.taxRate) / 100;
    taxAmount = igst;
  } else if (details.taxType === 'Split') {
    cgst = (subTotal * (details.taxRate / 2)) / 100;
    sgst = (subTotal * (details.taxRate / 2)) / 100;
    taxAmount = cgst + sgst;
  }

  const grandTotal = subTotal + taxAmount;

  return (
    <div ref={ref} className="p-8 bg-white text-black min-h-[297mm] w-[210mm] mx-auto shadow-lg print:shadow-none print:m-0 font-serif">
      {/* Header */}
      <div className="text-center border-b-2 border-black pb-4 mb-6">
        <h1 className="text-3xl font-black tracking-widest">{details.fullName}</h1>
        {details.address && <p className="text-xs mt-1">{details.address}</p>}
        {details.email && <p className="text-xs">Email: {details.email} | Cell: {details.cell}</p>}
        {details.gstin && <p className="text-xs font-bold mt-1">GSTIN: {details.gstin} | PAN: {details.pan}</p>}
        <div className="mt-4 inline-block border-2 border-black px-4 py-1 font-black uppercase tracking-widest">
          {entry.type === 'Quotation' ? 'Quotation' : 'Tax Invoice'}
        </div>
      </div>

      {/* Info Section */}
      <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
        <div>
          <p className="font-bold border-b border-black inline-block mb-2">To,</p>
          <div className="min-h-[60px] space-y-1">
            <p className="font-bold">{entry.client_name || entry.company_name || entry.buying_company || entry.selling_company || '___________________'}</p>
            {(() => {
              const unitDetails = units.find(u => u.name === entry.unit);
              if (unitDetails) {
                return (
                  <>
                    <p>{unitDetails.address}</p>
                    <p>PH: {unitDetails.contact}</p>
                  </>
                );
              }
              return null;
            })()}
          </div>
        </div>
        <div className="text-right space-y-1">
          <p><strong>Invoice No:</strong> {entry.invoice_no || entry.quotation_no || '___________'}</p>
          <p><strong>Date:</strong> {new Date(entry.date).toLocaleDateString('en-GB')}</p>
          <p><strong>Ref/Work Order:</strong> {entry.reference_no || '___________'}</p>
        </div>
      </div>

      {/* Table */}
      <table className="w-full border-collapse border border-black text-sm mb-8">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-black p-2 w-12">Ser</th>
            <th className="border border-black p-2 text-left">Detailed Description of Items</th>
            <th className="border border-black p-2 w-16">Qty</th>
            <th className="border border-black p-2 w-20">Rate</th>
            <th className="border border-black p-2 w-24">Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i} className="min-h-[40px]">
              <td className="border border-black p-2 text-center">{i + 1}</td>
              <td className="border border-black p-2 font-bold">{item.item}</td>
              <td className="border border-black p-2 text-center">{item.quantity} {item.denomination}</td>
              <td className="border border-black p-2 text-right">{Number(item.rate).toFixed(2)}</td>
              <td className="border border-black p-2 text-right">{(Number(item.quantity) * Number(item.rate)).toFixed(2)}</td>
            </tr>
          ))}
          {/* Fill empty rows to maintain height */}
          {Array.from({ length: Math.max(0, 8 - items.length) }).map((_, i) => (
            <tr key={`empty-${i}`} className="h-10">
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2"></td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={4} className="border border-black p-2 text-right font-bold">SUB TOTAL</td>
            <td className="border border-black p-2 text-right font-bold">{subTotal.toFixed(2)}</td>
          </tr>
          {cgst > 0 && (
            <>
              <tr>
                <td colSpan={4} className="border border-black p-2 text-right font-bold">CGST @ {(details.taxRate / 2)}%</td>
                <td className="border border-black p-2 text-right font-bold">{cgst.toFixed(2)}</td>
              </tr>
              <tr>
                <td colSpan={4} className="border border-black p-2 text-right font-bold">SGST @ {(details.taxRate / 2)}%</td>
                <td className="border border-black p-2 text-right font-bold">{sgst.toFixed(2)}</td>
              </tr>
            </>
          )}
          {igst > 0 && (
            <tr>
              <td colSpan={4} className="border border-black p-2 text-right font-bold">IGST @ {details.taxRate}%</td>
              <td className="border border-black p-2 text-right font-bold">{igst.toFixed(2)}</td>
            </tr>
          )}
          <tr className="bg-gray-100">
            <td colSpan={4} className="border border-black p-2 text-right font-black text-lg">GRAND TOTAL</td>
            <td className="border border-black p-2 text-right font-black text-lg">{grandTotal.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>

      {/* Footer Info */}
      <div className="grid grid-cols-2 gap-8 text-[10px] mt-auto">
        <div>
          <p className="font-bold underline mb-2">Terms & Conditions:-</p>
          <ul className="list-decimal pl-4 space-y-1">
            {details.terms.map((term, i) => <li key={i}>{term}</li>)}
          </ul>
          {details.bank && (
            <div className="mt-4 border border-black p-2 inline-block">
              <p><strong>BANK:</strong> {details.bank}</p>
              <p><strong>A/C No:</strong> {details.account}</p>
              <p><strong>IFSC:</strong> {details.ifsc}</p>
            </div>
          )}
        </div>
        <div className="text-right flex flex-col justify-between items-end">
          <p className="italic">Thanking you,</p>
          <div className="text-center w-48">
            <p className="font-bold mb-12">for {details.fullName}</p>
            <div className="border-t border-black pt-1">Authorised Signatory</div>
          </div>
        </div>
      </div>
    </div>
  );
});

BillTemplate.displayName = 'BillTemplate';

export default BillTemplate;
