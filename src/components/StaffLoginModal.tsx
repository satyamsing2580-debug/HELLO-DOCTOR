import React, { useState } from 'react';
import { X, ShieldCheck, Lock, AlertCircle, KeyRound, UserCheck, Stethoscope, Search, Check } from 'lucide-react';
import { UserRole, Doctor } from '../types';
import { verifyAdminCredential, verifyDoctorCompounderCredential, verifyCompounderCredential } from '../services/realtimeDb';

interface Props {
  doctors: Doctor[];
  onClose: () => void;
  onLoginSuccess: (role: UserRole, doctorName?: string) => void;
}

export const StaffLoginModal: React.FC<Props> = ({ doctors, onClose, onLoginSuccess }) => {
  const [selectedRole, setSelectedRole] = useState<'admin' | 'compounder'>('admin');
  const [password, setPassword] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [doctorSearch, setDoctorSearch] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId);

  const filteredDoctors = doctors.filter(
    (d) =>
      d.name.toLowerCase().includes(doctorSearch.toLowerCase()) ||
      d.specialty.toLowerCase().includes(doctorSearch.toLowerCase()) ||
      d.roomNumber.toLowerCase().includes(doctorSearch.toLowerCase())
  );

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (selectedRole === 'admin') {
      if (!password.trim()) {
        setErrorMessage('Please enter your Super Admin access password.');
        return;
      }
      const isValid = verifyAdminCredential(password);
      if (isValid) {
        onLoginSuccess('admin');
      } else {
        setErrorMessage('Authentication Failed: Invalid Group Admin password.');
      }
      return;
    }

    // Compounder Login Flow: Must select doctor first
    if (!selectedDoctorId) {
      setErrorMessage('Please select your assigned doctor from the list below.');
      return;
    }

    if (!password.trim()) {
      setErrorMessage(`Please enter the security password for ${selectedDoctor?.name || 'this doctor'}.`);
      return;
    }

    const isValid = verifyDoctorCompounderCredential(selectedDoctorId, password) || verifyCompounderCredential(password);
    if (isValid) {
      onLoginSuccess('compounder', selectedDoctor?.name);
    } else {
      setErrorMessage(`Authentication Failed: Incorrect compounder password for ${selectedDoctor?.name}. Contact Group Admin to verify password.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 border border-slate-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-sky-400" />
            <h3 className="font-extrabold text-sm">Staff Authentication Portal</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Role Toggle */}
        <div className="p-3.5 bg-slate-50 border-b border-slate-200/80">
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Select Staff Portal Role
          </label>
          <div className="grid grid-cols-2 gap-1.5 bg-slate-200/70 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setSelectedRole('admin');
                setErrorMessage('');
                setPassword('');
              }}
              className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                selectedRole === 'admin'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5 text-sky-600" />
              <span>Super Admin</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedRole('compounder');
                setErrorMessage('');
                setPassword('');
              }}
              className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                selectedRole === 'compounder'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>Doctor Compounder</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleLogin} className="p-4 sm:p-5 overflow-y-auto space-y-3.5 text-xs">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ADMIN FLOW */}
          {selectedRole === 'admin' && (
            <div className="space-y-3">
              <div className="p-3 bg-sky-50/70 border border-sky-100 rounded-2xl flex items-start space-x-2.5">
                <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-sky-900 leading-relaxed">
                  Super Admin has unrestricted control over User/Patient Block/Unblock, Doctor Passwords, Promo CMS, Dynamic Coupons, and OPD Analytics.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Super Admin Security Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="password"
                    required
                    autoFocus
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter authorized admin security code"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* COMPOUNDER FLOW: SELECT DOCTOR FIRST */}
          {selectedRole === 'compounder' && (
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center space-x-1">
                    <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                    <span>Step 1: Select Your Assigned Doctor *</span>
                  </label>
                  {selectedDoctor && (
                    <span className="text-[10px] text-emerald-600 font-extrabold flex items-center">
                      <Check className="w-3 h-3 mr-0.5" /> Selected
                    </span>
                  )}
                </div>

                {/* Search Box */}
                <div className="relative mb-2">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search doctor name or room..."
                    value={doctorSearch}
                    onChange={(e) => setDoctorSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                {/* Doctor Selection List */}
                <div className="max-h-40 overflow-y-auto space-y-1.5 p-1 bg-slate-50/70 border border-slate-200 rounded-2xl">
                  {filteredDoctors.map((doc) => {
                    const isSelected = selectedDoctorId === doc.id;
                    return (
                      <button
                        type="button"
                        key={doc.id}
                        onClick={() => {
                          setSelectedDoctorId(doc.id);
                          setErrorMessage('');
                        }}
                        className={`w-full p-2 rounded-xl flex items-center justify-between text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-teal-600 text-white shadow-xs'
                            : 'bg-white hover:bg-teal-50 border border-slate-100 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center space-x-2 min-w-0">
                          <span className="text-lg shrink-0">{doc.emoji || '👨‍⚕️'}</span>
                          <div className="min-w-0">
                            <p className={`font-bold text-xs truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                              {doc.name}
                            </p>
                            <p className={`text-[10px] truncate ${isSelected ? 'text-teal-100' : 'text-slate-500'}`}>
                              {doc.specialty} • {doc.roomNumber}
                            </p>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-white text-teal-700 flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                  {filteredDoctors.length === 0 && (
                    <p className="text-center py-4 text-xs text-slate-400">No doctors found matching search.</p>
                  )}
                </div>
              </div>

              {/* Password for Selected Doctor */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Step 2: Enter Password for {selectedDoctor ? selectedDoctor.name : 'Selected Doctor'} *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={selectedDoctor ? `Enter password for ${selectedDoctor.name}` : 'First select a doctor above'}
                    disabled={!selectedDoctorId}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 disabled:opacity-50"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Each doctor has a specific compounder password set by the Super Admin.
                </p>
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              className={`w-full py-3 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                selectedRole === 'admin'
                  ? 'bg-slate-900 hover:bg-slate-800'
                  : 'bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>
                {selectedRole === 'admin'
                  ? 'Access Super Admin Dashboard'
                  : selectedDoctor
                  ? `Login as ${selectedDoctor.name}'s Compounder`
                  : 'Select Doctor & Login'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
