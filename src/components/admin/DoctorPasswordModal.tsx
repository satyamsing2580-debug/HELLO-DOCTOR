import React, { useState } from 'react';
import { X, Lock, KeyRound, Check, Stethoscope } from 'lucide-react';
import { Doctor } from '../../types';

interface Props {
  doctor: Doctor;
  onClose: () => void;
  onSavePassword: (doctorId: string, newPassword: string) => Promise<void>;
}

export const DoctorPasswordModal: React.FC<Props> = ({ doctor, onClose, onSavePassword }) => {
  const [newPassword, setNewPassword] = useState(doctor.compounderPassword || '1234');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) {
      setError('Password cannot be empty');
      return;
    }
    setIsSaving(true);
    setError('');
    try {
      await onSavePassword(doctor.id, newPassword.trim());
      setSavedSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch {
      setError('Failed to update password');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <KeyRound className="w-5 h-5 text-amber-400" />
            <h3 className="font-extrabold text-sm">Compounder Password Manager</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-4 text-xs">
          {/* Doctor Brief */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-xl shrink-0">
              {doctor.emoji || '👨‍⚕️'}
            </div>
            <div className="min-w-0">
              <h4 className="font-extrabold text-xs text-slate-900 truncate">{doctor.name}</h4>
              <p className="text-[11px] text-teal-700 font-semibold">{doctor.specialty}</p>
              <p className="text-[10px] text-slate-400">Room: {doctor.roomNumber}</p>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1.5">
              Set Dedicated Compounder Access Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="text"
                required
                autoFocus
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="e.g. 1234, doc402, opd@1"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              When the compounder logs in, they select <strong>{doctor.name}</strong> and enter this password to advance tokens.
            </p>
          </div>

          {error && <p className="text-rose-600 font-bold">{error}</p>}
          {savedSuccess && (
            <p className="text-emerald-600 font-bold flex items-center">
              <Check className="w-3.5 h-3.5 mr-1" /> Password updated & synced!
            </p>
          )}

          <div className="pt-2 flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || savedSuccess}
              className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              <KeyRound className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Update Password'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
