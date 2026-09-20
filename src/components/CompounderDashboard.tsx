import React, { useState } from 'react';
import { Doctor, Appointment } from '../types';
import { realtimeDb } from '../services/realtimeDb';
import { 
  UserCheck, Stethoscope, ChevronRight, AlertCircle, Phone, 
  Clock, CheckCircle, SkipForward, Play, RefreshCw, LogOut, Search
} from 'lucide-react';

interface Props {
  doctors: Doctor[];
  appointments: Appointment[];
  onExit: () => void;
  onDoctorSelected: (doctorName: string) => void;
}

export const CompounderDashboard: React.FC<Props> = ({
  doctors,
  appointments,
  onExit,
  onDoctorSelected
}) => {
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [validationError, setValidationError] = useState('');

  const assignedDoctor = doctors.find(d => d.id === selectedDoctorId);

  // Validate doctor from database
  const handleValidateDoctor = (doctor: Doctor) => {
    setSelectedDoctorId(doctor.id);
    setValidationError('');
    onDoctorSelected(doctor.name);
  };

  const handleSearchValidate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) {
      setValidationError('Please enter doctor name');
      return;
    }

    const matched = realtimeDb.validateDoctorName(searchInput);
    if (matched) {
      setSelectedDoctorId(matched.id);
      setValidationError('');
      onDoctorSelected(matched.name);
    } else {
      setValidationError(`Doctor "${searchInput}" not found in database. Please choose from registered specialists.`);
    }
  };

  // Live Token controls
  const handleCallNext = () => {
    if (!assignedDoctor) return;
    realtimeDb.callNextToken(assignedDoctor.id);
  };

  const handleSkip = () => {
    if (!assignedDoctor) return;
    realtimeDb.skipToken(assignedDoctor.id);
  };

  const handleReset = () => {
    if (!assignedDoctor) return;
    if (window.confirm('Reset OPD token counter to 1 for this doctor?')) {
      realtimeDb.resetDoctorToken(assignedDoctor.id, 1);
    }
  };

  // Patients booked for this specific doctor
  const doctorAppointments = appointments.filter(a => a.doctorId === selectedDoctorId);
  const confirmedQueue = doctorAppointments
    .filter(a => a.status === 'Confirmed' || a.status === 'Completed')
    .sort((a, b) => a.tokenNumber - b.tokenNumber);

  return (
    <div className="pb-28 pt-2 px-4 max-w-md mx-auto space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold tracking-wider text-teal-700 uppercase bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
            Compounder / Receptionist Portal
          </span>
          <h2 className="text-xl font-black text-slate-900 mt-1">Live OPD Queue Manager</h2>
          <p className="text-xs text-slate-500">Real-time Patient Token Advancement</p>
        </div>

        <button
          onClick={onExit}
          className="text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
        >
          Exit
        </button>
      </div>

      {/* PHASE 1: DOCTOR VALIDATION & SELECTION */}
      {!assignedDoctor ? (
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Step 1: Select Your Doctor</h3>
              <p className="text-xs text-slate-500">System will validate the doctor from database</p>
            </div>
          </div>

          {validationError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Quick Search */}
          <form onSubmit={handleSearchValidate} className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="text"
              placeholder="Search doctor by name or specialty..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-20 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 px-3 py-1.5 bg-teal-700 text-white font-bold text-xs rounded-lg shadow-xs hover:bg-teal-800 cursor-pointer"
            >
              Validate
            </button>
          </form>

          {/* List of Registered Doctors */}
          <div className="space-y-2 pt-1 max-h-[50vh] overflow-y-auto">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Or Click Registered Doctor
            </label>
            {doctors.map((doc) => (
              <button
                key={doc.id}
                onClick={() => handleValidateDoctor(doc)}
                className="w-full p-3 rounded-2xl border border-slate-200/90 hover:border-teal-400 hover:bg-teal-50/50 flex items-center justify-between text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform">
                    {doc.emoji || '👨‍⚕️'}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900 group-hover:text-teal-900">
                      {doc.name}
                    </h4>
                    <p className="text-[11px] text-teal-700 font-semibold">{doc.specialty}</p>
                    <p className="text-[10px] text-slate-500">{doc.roomNumber} • Live Token: #{doc.currentToken}</p>
                  </div>
                </div>
                <div className="px-2.5 py-1 bg-slate-100 group-hover:bg-teal-700 group-hover:text-white rounded-lg text-xs font-bold transition-colors">
                  Select
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* PHASE 2: ACTIVE DOCTOR LIVE TOKEN QUEUE MANAGER */
        <div className="space-y-4">
          {/* Active Doctor Info Card */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-3xl shrink-0">
                {assignedDoctor.emoji || '👨‍⚕️'}
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-900">{assignedDoctor.name}</h4>
                <p className="text-xs text-teal-700 font-bold">{assignedDoctor.specialty}</p>
                <p className="text-[11px] text-slate-500">{assignedDoctor.roomNumber} • {assignedDoctor.timing}</p>
              </div>
            </div>

            <button
              onClick={() => setSelectedDoctorId(null)}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-100 px-2.5 py-1.5 rounded-lg cursor-pointer"
              title="Change Doctor"
            >
              Change
            </button>
          </div>

          {/* MAIN LIVE TOKEN DISPLAY CARD */}
          <div className="bg-gradient-to-br from-teal-800 via-teal-900 to-slate-900 rounded-3xl p-6 text-white text-center shadow-lg relative overflow-hidden space-y-4">
            <div className="flex items-center justify-center space-x-2 text-xs font-bold text-teal-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="uppercase tracking-widest text-[11px]">Live Inside Doctor OPD Room</span>
            </div>

            <div>
              <span className="text-xs text-teal-200 font-semibold block">CURRENT TOKEN NUMBER</span>
              <div className="text-6xl font-black tracking-tight text-white mt-1">
                #{assignedDoctor.currentToken}
              </div>
              <p className="text-xs text-teal-200/80 mt-1">
                Patients with this token are currently in consultation
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-teal-700/60">
              <div className="bg-white/10 p-2.5 rounded-2xl">
                <span className="text-[10px] text-teal-200 uppercase font-bold block">Next Up</span>
                <span className="text-xl font-extrabold text-white">#{assignedDoctor.currentToken + 1}</span>
              </div>
              <div className="bg-white/10 p-2.5 rounded-2xl">
                <span className="text-[10px] text-teal-200 uppercase font-bold block">Total Booked Today</span>
                <span className="text-xl font-extrabold text-white">#{assignedDoctor.totalTokensToday}</span>
              </div>
            </div>
          </div>

          {/* STRICT MANDATED CONTROLS: "Call Next Patient (+1)" and "Skip" */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleCallNext}
              className="py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm rounded-2xl shadow-md flex items-center justify-center space-x-2 transition-transform active:scale-98 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>Call Next Patient (+1)</span>
            </button>

            <button
              onClick={handleSkip}
              className="py-4 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-sm rounded-2xl shadow-xs flex items-center justify-center space-x-2 transition-transform active:scale-98 cursor-pointer"
            >
              <SkipForward className="w-5 h-5" />
              <span>Skip Token</span>
            </button>
          </div>

          <div className="text-right">
            <button
              onClick={handleReset}
              className="text-[11px] font-bold text-slate-500 hover:text-slate-800 underline cursor-pointer"
            >
              Reset queue to Token #1
            </button>
          </div>

          {/* Doctor-Specific Patients Queue */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-sm text-slate-900">
                Today&apos;s OPD Patient Queue ({confirmedQueue.length})
              </h4>
              <span className="text-xs text-slate-400 font-medium">Auto-synced</span>
            </div>

            <div className="divide-y divide-slate-100">
              {confirmedQueue.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">
                  No confirmed patients for {assignedDoctor.name} yet.
                </p>
              ) : (
                confirmedQueue.map((apt) => {
                  const isCurrent = apt.tokenNumber === assignedDoctor.currentToken;
                  const isDone = apt.tokenNumber < assignedDoctor.currentToken;

                  return (
                    <div
                      key={apt.id}
                      className={`py-3 flex items-center justify-between ${
                        isCurrent ? 'bg-emerald-50/80 -mx-4 px-4 rounded-xl border border-emerald-200' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center ${
                          isCurrent
                            ? 'bg-emerald-600 text-white animate-pulse'
                            : isDone
                            ? 'bg-slate-100 text-slate-400'
                            : 'bg-sky-100 text-sky-800'
                        }`}>
                          #{apt.tokenNumber}
                        </div>
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <h5 className="font-bold text-xs text-slate-900">{apt.patientName}</h5>
                            {isCurrent && (
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-200 text-emerald-800">
                                Current
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500">
                            {apt.patientPhone} • {apt.timeSlot}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isDone
                            ? 'bg-slate-100 text-slate-500'
                            : isCurrent
                            ? 'bg-emerald-100 text-emerald-800 font-bold'
                            : 'bg-amber-50 text-amber-800'
                        }`}>
                          {isDone ? 'Completed' : isCurrent ? 'Inside OPD' : 'Waiting'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
