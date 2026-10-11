import React, { useState } from 'react';
import { X, ShieldCheck, Lock, AlertCircle, KeyRound, UserCheck, Stethoscope, Search, Check, Phone, CheckCircle2 } from 'lucide-react';
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
  
  // Admin credentials
  const [adminPassword, setAdminPassword] = useState('');
  
  // Compounder 3-step credentials
  const [compounderPhone, setCompounderPhone] = useState('90073555062');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [compounderDoctorPassword, setCompounderDoctorPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  
  const [doctorSearch, setDoctorSearch] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const cleanPhone = compounderPhone.trim().replace(/\D/g, '');
  const isStep1Valid = cleanPhone.length >= 10;
  const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId);

  const filteredDoctors = doctors.filter(
    (d) =>
      d.name.toLowerCase().includes(doctorSearch.toLowerCase()) ||
      d.specialty.toLowerCase().includes(doctorSearch.toLowerCase()) ||
      d.roomNumber.toLowerCase().includes(doctorSearch.toLowerCase())
  );

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

  const handleCompounderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Step 1: Validate mobile number
    if (!isStep1Valid) {
      setErrorMessage('Step 1 Required: Please enter authorized Compounder Admin mobile number (e.g. 90073555062).');
      return;
    }

    // Step 2: Validate doctor selection
    if (!selectedDoctorId) {
      setErrorMessage('Step 2 Required: Please select your assigned doctor from the list.');
      return;
    }

    // Step 3: Validate password/PIN
    if (!compounderDoctorPassword.trim()) {
      setErrorMessage(`Step 3 Required: Please enter the compounder password for ${selectedDoctor?.name || 'this doctor'}.`);
      return;
    }

    const isValid =
      verifyDoctorCompounderCredential(selectedDoctorId, compounderDoctorPassword) ||
      verifyCompounderCredential(compounderDoctorPassword);

    if (isValid && selectedDoctor) {
      const sessionPayload = JSON.stringify({
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        phone: cleanPhone,
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
        `Authentication Failed: Incorrect compounder password for ${selectedDoctor?.name || 'doctor'}. Contact Super Admin to view or change doctor password.`
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

          {/* ADMIN FLOW */}
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

          {/* COMPOUNDER 3-STEP FLOW */}
          {selectedRole === 'compounder' && (
            <form onSubmit={handleCompounderSubmit} className="space-y-4">
              {/* Step 1: Mobile Number */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                    <span className="w-4 h-4 rounded-full bg-teal-600 text-white text-[10px] flex items-center justify-center font-bold">1</span>
                    <span>Compounder Admin Mobile *</span>
                  </label>
                  {isStep1Valid ? (
                    <span className="text-[10px] text-teal-700 font-bold flex items-center bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                      <CheckCircle2 className="w-3 h-3 mr-1 text-teal-600" /> Step 1 Ready
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setCompounderPhone('90073555062');
                        setErrorMessage('');
                      }}
                      className="text-[10px] font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-2 py-0.5 rounded-lg cursor-pointer"
                    >
                      Use 90073555062
                    </button>
                  )}
                </div>

                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    value={compounderPhone}
                    onChange={(e) => setCompounderPhone(e.target.value)}
                    placeholder="Enter 10-digit mobile number (e.g. 90073555062)"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>Compounder Admin Phone: <strong className="text-slate-700 font-mono">90073555062</strong></span>
                  {compounderPhone !== '90073555062' && (
                    <button
                      type="button"
                      onClick={() => setCompounderPhone('90073555062')}
                      className="text-teal-600 font-bold hover:underline cursor-pointer"
                    >
                      Reset to 90073555062
                    </button>
                  )}
                </div>
              </div>

              {/* Step 2: Select Assigned Doctor */}
              {!isStep1Valid ? (
                <div className="p-3.5 bg-slate-100/80 border border-dashed border-slate-300 rounded-2xl flex items-center space-x-2.5 text-slate-500">
                  <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                  <p className="text-[11px] leading-tight">
                    <strong>Step 2 Locked:</strong> Enter Compounder Admin Mobile (90073555062) in Step 1 above to unlock Doctor selection.
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                      <span className="w-4 h-4 rounded-full bg-teal-600 text-white text-[10px] flex items-center justify-center font-bold">2</span>
                      <span>Select Assigned Doctor *</span>
                    </label>
                    {selectedDoctor && (
                      <span className="text-[10px] text-teal-800 font-extrabold flex items-center bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                        <Check className="w-3 h-3 mr-0.5 text-teal-600" /> Selected
                      </span>
                    )}
                  </div>

                  {/* Search Box */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search doctor name or room..."
                      value={doctorSearch}
                      onChange={(e) => setDoctorSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  {/* Doctor Selection List */}
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
              )}

              {/* Step 3: Enter Password for Selected Doctor */}
              {!selectedDoctorId || !selectedDoctor ? (
                <div className="p-3.5 bg-slate-100/80 border border-dashed border-slate-300 rounded-2xl flex items-center space-x-2.5 text-slate-500">
                  <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                  <p className="text-[11px] leading-tight">
                    <strong>Step 3 Locked:</strong> Select your assigned doctor in Step 2 above to enter compounder password.
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5 animate-in fade-in duration-150">
                  <label className="block text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                    <span className="w-4 h-4 rounded-full bg-teal-600 text-white text-[10px] flex items-center justify-center font-bold">3</span>
                    <span>Enter Compounder Password for {selectedDoctor.name} *</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      autoFocus
                      value={compounderDoctorPassword}
                      onChange={(e) => setCompounderDoctorPassword(e.target.value)}
                      placeholder={`Enter password for ${selectedDoctor.name}`}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Set by Super Admin in Doctor Manager (default: 1234 or compounder mobile: 90073555062).
                  </p>
                </div>
              )}

              {/* Step 4: Remember Me Persistent Session */}
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
                  Once logged in, the app remembers your session so you do not need to log in repeatedly when reopening the app.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!isStep1Valid || !selectedDoctorId}
                  className="w-full py-3 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>
                    {selectedDoctor
                      ? `Authenticate as ${selectedDoctor.name}'s Compounder`
                      : 'Complete Steps 1-3 to Login'}
                  </span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
