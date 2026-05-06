import mongoose, { Document, Schema } from 'mongoose';

interface DescriptionItem {
  item: string;
  denomination: string;
  quantity: string;
  rate: string;
}

export interface IEntry extends Document {
  type: 'Quotation' | 'Invoice' | 'Purchase' | 'Goods Exp' | 'Cash Exp';
  company_name?: string;
  client_name?: string;
  status?: string;
  quotation_no?: string;
  invoice_no?: string;
  reference_no?: string;
  buying_company?: string;
  selling_company?: string;
  mop?: string;
  s_no?: string;
  unit: string;
  date: string;
  description: DescriptionItem[];
  total: string;
  createdBy?: string;
}

const DescriptionItemSchema = new Schema<DescriptionItem>({
  item: { type: String, required: true },
  denomination: { type: String, required: true },
  quantity: { type: String, required: true },
  rate: { type: String, required: true },
});

const EntrySchema = new Schema<IEntry>(
  {
    type: {
      type: String,
      enum: ['Quotation', 'Invoice', 'Purchase', 'Sale', 'Expense', 'Payment Pending', 'Goods Exp', 'Cash Exp'],
      required: true,
    },
    company_name: String,
    client_name: String,
    status: { type: String, default: 'Unpaid' },
    quotation_no: String,
    invoice_no: String,
    reference_no: String,
    buying_company: String,
    selling_company: String,
    mop: String,
    s_no: String,
    unit: { type: String, required: true },
    date: { type: String, required: true }, // stored as dd-mm-yyyy
    description: {
      type: [DescriptionItemSchema],
      required: true,
    },
    total: { type: String, required: true },
    createdBy: { type: String, required: false },
  },
  { timestamps: true }
);

export default mongoose.model<IEntry>('Entry', EntrySchema);
