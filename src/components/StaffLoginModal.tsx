import React, { useState } from 'react';
import { X, ShieldCheck, Lock, AlertCircle, KeyRound, UserCheck } from 'lucide-react';
import { UserRole } from '../types';
import { verifyAdminCredential, verifyCompounderCredential } from '../services/realtimeDb';

interface Props {
  onClose: () => void;
  onLoginSuccess: (role: UserRole) => void;
}

export const StaffLoginModal: React.FC<Props> = ({ onClose, onLoginSuccess }) => {
  const [selectedRole, setSelectedRole] = useState<'admin' | 'compounder'>('admin');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!password.trim()) {
      setErrorMessage('Please enter your security access password.');
      return;
    }

    if (selectedRole === 'admin') {
      const isValid = verifyAdminCredential(password);
      if (isValid) {
        onLoginSuccess('admin');
      } else {
        setErrorMessage('Authentication Failed: Invalid Group Admin password.');
      }
    } else {
      const isValid = verifyCompounderCredential(password);
      if (isValid) {
        onLoginSuccess('compounder');
      } else {
        setErrorMessage('Authentication Failed: Invalid Compounder / Receptionist password.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 border border-slate-100">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-sky-400" />
            <h3 className="font-extrabold text-sm">Staff Authentication</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Role Toggle */}
        <div className="p-4 bg-slate-50 border-b border-slate-200/80">
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Select Staff Portal Role
          </label>
          <div className="grid grid-cols-2 gap-1.5 bg-slate-200/70 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setSelectedRole('admin');
                setErrorMessage('');
              }}
              className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1 ${
                selectedRole === 'admin'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5 text-sky-600" />
              <span>Group Admin</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedRole('compounder');
                setErrorMessage('');
              }}
              className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1 ${
                selectedRole === 'compounder'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>Compounder</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleLogin} className="p-5 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {selectedRole === 'admin' ? 'Group Admin Password' : 'Compounder / Receptionist Password'}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="password"
                required
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter authorized security code"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              Authorized credentials only. All access attempts are logged.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              <span>Authenticate & Enter Portal</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
