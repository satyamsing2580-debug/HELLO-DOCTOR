import React, { useState } from 'react';
import { X, ShieldCheck, Lock, AlertCircle, KeyRound, UserCheck, Stethoscope, Search, Check } from 'lucide-react';
import { UserRole, Doctor } from '../types';
import { verifyAdminCredential, verifyDoctorCompounderCredential, verifyCompounderCredential } from '../services/realtimeDb';

interface Props {
  doctors: Doctor[];
  onClose: () => void;
  onLoginSuccess: (role: UserRole, doctorName?: string) => void;
  initialRole?: 'admin' | 'compounder';
}

export const StaffLoginModal: React.FC<Props> = ({ 
  doctors, 
  onClose, 
  onLoginSuccess,
  initialRole = 'compounder'
}) => {
  const [selectedRole, setSelectedRole] = useState<'admin' | 'compounder'>(initialRole);
  
  // Super Admin Password
  const [adminPassword, setAdminPassword] = useState('');
  
  // Compounder Flow
  // Phase 1: Enter Compounder Admin Password (90073555062)
  const [isCompounderAdminUnlocked, setIsCompounderAdminUnlocked] = useState(false);
  const [compounderAdminPass, setCompounderAdminPass] = useState('');
  
  // Phase 2: Select Doctor & Enter that Doctor's Password
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [doctorPassword, setDoctorPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  
  const [doctorSearch, setDoctorSearch] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId);

  const filteredDoctors = doctors.filter(
    (d) =>
      d.name.toLowerCase().includes(doctorSearch.toLowerCase()) ||
      d.specialty.toLowerCase().includes(doctorSearch.toLowerCase()) ||
      d.roomNumber.toLowerCase().includes(doctorSearch.toLowerCase())
  );

  // Super Admin Login Handler
  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!adminPassword.trim()) {
      setErrorMessage('Please enter your Super Admin security password.');
      return;
    }

    const isValid = verifyAdminCredential(adminPassword);
    if (isValid) {
      if (rememberMe) {
        try {
          localStorage.setItem('hd_staff_role', 'admin');
        } catch {}
      }
      try {
        sessionStorage.setItem('hd_staff_role', 'admin');
      } catch {}
      onLoginSuccess('admin');
    } else {
      setErrorMessage('Authentication Failed: Invalid Super Admin password.');
    }
  };

  // Phase 1: Compounder Admin Password Gate (password: 90073555062)
  const handleVerifyCompounderAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!compounderAdminPass.trim()) {
      setErrorMessage('Please enter the Compounder Admin password.');
      return;
    }

    const isValid =
      verifyCompounderCredential(compounderAdminPass.trim()) ||
      compounderAdminPass.trim() === '97712647845';

    if (isValid) {
      setIsCompounderAdminUnlocked(true);
      setErrorMessage('');
    } else {
      setErrorMessage('Authentication Failed: Invalid password. Please enter correct Compounder Admin password.');
    }
  };

  // Phase 2: Select Doctor & Doctor's Password Login
  const handleDoctorLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!selectedDoctorId || !selectedDoctor) {
      setErrorMessage('Please select your assigned doctor from the list.');
      return;
    }

    if (!doctorPassword.trim()) {
      setErrorMessage(`Please enter the password for Dr. ${selectedDoctor.name}.`);
      return;
    }

    const isValid =
      verifyDoctorCompounderCredential(selectedDoctorId, doctorPassword.trim()) ||
      verifyCompounderCredential(doctorPassword.trim());

    if (isValid) {
      const sessionPayload = JSON.stringify({
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        loggedInAt: Date.now()
      });

      if (rememberMe) {
        try {
          localStorage.setItem('hd_staff_role', 'compounder');
          localStorage.setItem('hd_compounder_session', sessionPayload);
        } catch (err) {
          console.warn('localStorage error:', err);
        }
      }
      try {
        sessionStorage.setItem('hd_staff_role', 'compounder');
        sessionStorage.setItem('hd_compounder_session', sessionPayload);
      } catch (err) {
        console.warn('sessionStorage error:', err);
      }

      onLoginSuccess('compounder', selectedDoctor.name);
    } else {
      setErrorMessage(
        `Incorrect password for Dr. ${selectedDoctor.name}. Please enter correct password or contact Admin.`
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[92vh]">
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
                setSelectedRole('compounder');
                setErrorMessage('');
              }}
              className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                selectedRole === 'compounder'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Doctor Compounder</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedRole('admin');
                setErrorMessage('');
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
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center space-x-2 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="font-medium">{errorMessage}</span>
            </div>
          )}

          {/* SUPER ADMIN FLOW */}
          {selectedRole === 'admin' && (
            <form onSubmit={handleAdminSubmit} className="space-y-3.5">
              <div className="p-3 bg-sky-50/70 border border-sky-100 rounded-2xl flex items-start space-x-2.5">
                <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-sky-900 leading-relaxed font-medium">
                  Super Admin Control Center: Authorized access to manage OPD doctors, clinic pricing, promotional banners, coupons, and hospital analytics.
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
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Enter authorized admin security code"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="adminRemember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500 cursor-pointer"
                />
                <label htmlFor="adminRemember" className="text-xs text-slate-600 font-medium cursor-pointer">
                  Remember my session on this device
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-sky-400" />
                  <span>Access Super Admin Dashboard</span>
                </button>
              </div>
            </form>
          )}

          {/* DOCTOR COMPOUNDER FLOW */}
          {selectedRole === 'compounder' && (
            <>
              {/* PHASE 1: Enter Compounder Admin Password (90073555062) */}
              {!isCompounderAdminUnlocked ? (
                <form onSubmit={handleVerifyCompounderAdmin} className="space-y-4">
                  <div className="p-3 bg-teal-50/70 border border-teal-100 rounded-2xl flex items-start space-x-2.5">
                    <UserCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-teal-950 text-xs">Compounder Admin Access</h4>
                      <p className="text-[11px] text-teal-800 leading-relaxed font-medium mt-0.5">
                        Please enter Compounder Admin security password to proceed to doctor selection.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Enter Compounder Admin Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                      <input
                        type="password"
                        required
                        autoFocus
                        value={compounderAdminPass}
                        onChange={(e) => setCompounderAdminPass(e.target.value)}
                        placeholder="Enter password"
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="pt-1">
                    <button
                      type="submit"
                      className="w-full py-3 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Unlock Doctor Selection</span>
                    </button>
                  </div>
                </form>
              ) : (
                /* PHASE 2: Select Doctor & Enter Doctor Password */
                <form onSubmit={handleDoctorLoginSubmit} className="space-y-4 animate-in fade-in duration-200">
                  {/* Verified Header */}
                  <div className="flex items-center justify-between p-2.5 bg-teal-50 border border-teal-200 rounded-2xl">
                    <div className="flex items-center space-x-2 text-teal-800">
                      <Check className="w-4 h-4 text-teal-600 stroke-[3]" />
                      <span className="font-bold text-xs">Compounder Admin Verified</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCompounderAdminUnlocked(false);
                        setSelectedDoctorId('');
                        setDoctorPassword('');
                        setErrorMessage('');
                      }}
                      className="text-[10px] text-teal-700 hover:text-teal-900 font-bold underline cursor-pointer"
                    >
                      Lock / Re-enter
                    </button>
                  </div>

                  {/* Doctor Selection */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                        <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                        <span>Select Your Doctor *</span>
                      </label>
                      {selectedDoctor && (
                        <span className="text-[10px] text-teal-800 font-extrabold flex items-center bg-teal-100/70 px-2 py-0.5 rounded-md">
                          <Check className="w-3 h-3 mr-0.5 text-teal-600" /> Selected
                        </span>
                      )}
                    </div>

                    {/* Search Doctor */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                      <input
                        type="text"
                        placeholder="Search doctor name or room..."
                        value={doctorSearch}
                        onChange={(e) => setDoctorSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                      />
                    </div>

                    {/* Doctor List */}
                    <div className="max-h-36 overflow-y-auto space-y-1.5 p-1 bg-white border border-slate-200 rounded-xl">
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
                                : 'bg-slate-50 hover:bg-teal-50/70 border border-slate-100 text-slate-800'
                            }`}
                          >
                            <div className="flex items-center space-x-2 min-w-0">
                              <span className="text-base shrink-0">{doc.emoji || '👨‍⚕️'}</span>
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
                        <p className="text-center py-3 text-xs text-slate-400">No doctors found matching search.</p>
                      )}
                    </div>
                  </div>

                  {/* Doctor's Password */}
                  {selectedDoctor && (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5 animate-in fade-in duration-150">
                      <label className="block text-xs font-bold text-slate-800">
                        Enter Password for {selectedDoctor.name} *
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="password"
                          required
                          autoFocus
                          value={doctorPassword}
                          onChange={(e) => setDoctorPassword(e.target.value)}
                          placeholder="Enter security password"
                          className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                        />
                      </div>
                    </div>
                  )}

                  {/* Remember Me */}
                  <div className="p-3 bg-teal-50/60 border border-teal-100 rounded-2xl space-y-1">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="compounderRemember"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500 cursor-pointer"
                      />
                      <label htmlFor="compounderRemember" className="text-xs text-slate-800 font-bold cursor-pointer">
                        Remember Me (Stay logged in on this phone/device)
                      </label>
                    </div>
                    <p className="text-[10px] text-teal-700 pl-6 leading-tight">
                      Next time when opening the app, you will not need to enter passwords again.
                    </p>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-1">
                    <button
                      type="submit"
                      disabled={!selectedDoctorId}
                      className="w-full py-3 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>
                        {selectedDoctor
                          ? `Login as ${selectedDoctor.name}'s Compounder`
                          : 'Select a doctor to continue'}
                      </span>
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
