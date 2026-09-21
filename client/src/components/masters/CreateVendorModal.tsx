import React, { useState } from 'react';
import { VendorMaster } from '../../types/masters';
import { X, Building2, CheckCircle, Mail, Phone, MapPin, Landmark } from 'lucide-react';

interface CreateVendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (vendorData: Partial<VendorMaster>) => void;
}

export function CreateVendorModal({ isOpen, onClose, onSubmit }: CreateVendorModalProps) {
  const [name, setName] = useState('');
  const [code, setCode] = useState(`VEND-${Date.now().toString().slice(-4)}`);
  const [gstIn, setGstIn] = useState('');
  const [pan, setPan] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [stateCode, setStateCode] = useState('27');
  const [bankAccount, setBankAccount] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [openingBalance, setOpeningBalance] = useState(0);

  if (!isOpen) return null;

  const handleGstinChange = (val: string) => {
    const uppercaseVal = val.toUpperCase();
    setGstIn(uppercaseVal);
    if (uppercaseVal.length >= 2) {
      setStateCode(uppercaseVal.slice(0, 2));
    }
    if (uppercaseVal.length >= 12) {
      setPan(uppercaseVal.slice(2, 12));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSubmit({
      name,
      code,
      gstIn,
      pan,
      contactPerson,
      email,
      phone,
      address,
      stateCode,
      bankAccount,
      ifscCode,
      openingBalance,
      currentBalance: openingBalance,
      isActive: true,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden text-slate-900 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Add Vendor Master (Sundry Creditor)</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Register supplier details, statutory tax IDs, and NEFT/RTGS bank settlement info
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Vendor / Supplier Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Stark Logistics & Industrial Tools Ltd"
                required
                className="w-full px-3.5 py-2 rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Vendor Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                GSTIN (15-Digit)
              </label>
              <input
                type="text"
                value={gstIn}
                onChange={(e) => handleGstinChange(e.target.value)}
                placeholder="27AABCS1429B1Z8"
                maxLength={15}
                className="w-full px-3.5 py-2 rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none uppercase transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                PAN Number
              </label>
              <input
                type="text"
                value={pan}
                onChange={(e) => setPan(e.target.value.toUpperCase())}
                placeholder="AABCS1429B"
                maxLength={10}
                className="w-full px-3.5 py-2 rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none uppercase transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                State Code
              </label>
              <input
                type="text"
                value={stateCode}
                onChange={(e) => setStateCode(e.target.value)}
                placeholder="27"
                className="w-full px-3.5 py-2 rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Contact Person
              </label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="e.g. Anand Kulkarni"
                className="w-full px-3.5 py-2 rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sales@starklogistics.com"
                className="w-full px-3.5 py-2 rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Phone / Mobile
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 94220 98765"
                className="w-full px-3.5 py-2 rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Opening Balance (₹)
              </label>
              <input
                type="number"
                value={openingBalance}
                onChange={(e) => setOpeningBalance(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2 rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-xs font-mono text-right text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Bank Account Number
              </label>
              <input
                type="text"
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                placeholder="50200012984112"
                className="w-full px-3.5 py-2 rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Bank IFSC Code
              </label>
              <input
                type="text"
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                placeholder="HDFC0000129"
                maxLength={11}
                className="w-full px-3.5 py-2 rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none uppercase transition-all"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Vendor Address & Factory Location
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Industrial Estate, Factory Shed #14, Bhosari, Pune"
                rows={2}
                className="w-full px-3.5 py-2 rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center space-x-2 shadow-xs transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Save Vendor Master</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
