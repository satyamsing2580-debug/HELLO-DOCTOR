import React, { useState } from 'react';
import { Doctor, Appointment } from '../types';
import { realtimeDb } from '../services/realtimeDb';
import { 
  UserCheck, Stethoscope, ChevronRight, AlertCircle, Phone, 
  Clock, CheckCircle, SkipForward, Play, RefreshCw, LogOut, Search,
  Printer
} from 'lucide-react';
import { BookingReceiptModal } from './BookingReceiptModal';

interface Props {
  doctors: Doctor[];
  appointments: Appointment[];
  initialDoctorName?: string;
  onExit: () => void;
  onDoctorSelected: (doctorName: string) => void;
}

export const CompounderDashboard: React.FC<Props> = ({
  doctors,
  appointments,
  initialDoctorName,
  onExit,
  onDoctorSelected
}) => {
  const [selectedAppointmentForPrint, setSelectedAppointmentForPrint] = useState<Appointment | null>(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(() => {
    if (initialDoctorName && doctors.length > 0) {
      const found = doctors.find(d => d.name.toLowerCase() === initialDoctorName.toLowerCase());
      if (found) return found.id;
    }
    return null;
  });
  const [searchInput, setSearchInput] = useState('');
  const [validationError, setValidationError] = useState('');

  // Auto-select doctor if initialDoctorName becomes available after async doctors load
  React.useEffect(() => {
    if (!selectedDoctorId && initialDoctorName && doctors.length > 0) {
      const found = doctors.find(d => d.name.toLowerCase() === initialDoctorName.toLowerCase());
      if (found) {
        setSelectedDoctorId(found.id);
      }
    }
  }, [initialDoctorName, doctors, selectedDoctorId]);

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

  const [showCompletedList, setShowCompletedList] = useState(false);

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

  // Complete an individual patient's consultation directly
  const handleCompletePatient = async (aptId: string) => {
    await realtimeDb.markAppointmentCompleted(aptId);
  };

  // Patients booked for this specific doctor
  const doctorAppointments = appointments.filter(a => a.doctorId === selectedDoctorId);

  // Active / pending tokens queue:
  // Strictly only confirmed appointments whose token has not passed
  const activeLiveQueue = doctorAppointments
    .filter(a => a.status === 'Confirmed' && (!assignedDoctor || a.tokenNumber >= assignedDoctor.currentToken))
    .sort((a, b) => a.tokenNumber - b.tokenNumber);

  // Completed consultations (automatically archived/hidden from the active live queue)
  const completedPatients = doctorAppointments
    .filter(a => a.status === 'Completed' || (assignedDoctor && a.tokenNumber < assignedDoctor.currentToken))
    .sort((a, b) => b.tokenNumber - a.tokenNumber);

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

          {/* Doctor-Specific Patients Queue: Active & Pending Tokens Only */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-sm text-slate-900">
                  Today&apos;s OPD Patient Queue ({activeLiveQueue.length})
                </h4>
                <p className="text-[11px] text-slate-500">Live active &amp; waiting patients</p>
              </div>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold border border-emerald-200">
                Live Queue
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {activeLiveQueue.length === 0 ? (
                <div className="py-6 text-center space-y-1">
                  <p className="text-xs font-bold text-slate-600">No pending patients in active queue</p>
                  <p className="text-[11px] text-slate-400">
                    All currently confirmed patient consultations have been completed or no new patients are waiting.
                  </p>
                </div>
              ) : (
                activeLiveQueue.map((apt) => {
                  const isCurrent = apt.tokenNumber === assignedDoctor.currentToken;
                  const isNext = apt.tokenNumber === assignedDoctor.currentToken + 1;

                  return (
                    <div
                      key={apt.id}
                      className={`py-3 flex items-center justify-between transition-colors ${
                        isCurrent
                          ? 'bg-emerald-50/90 -mx-4 px-4 rounded-xl border border-emerald-200 shadow-2xs'
                          : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-9 h-9 rounded-xl font-black text-xs flex items-center justify-center shrink-0 ${
                            isCurrent
                              ? 'bg-emerald-600 text-white animate-pulse shadow-xs'
                              : isNext
                              ? 'bg-sky-600 text-white'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          #{apt.tokenNumber}
                        </div>
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <h5 className="font-bold text-xs text-slate-900">{apt.patientName}</h5>
                            {isCurrent ? (
                              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-800">
                                Inside OPD
                              </span>
                            ) : isNext ? (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-100 text-sky-800">
                                Next Up
                              </span>
                            ) : null}
                          </div>
                          <p className="text-[11px] text-slate-500">
                            {apt.patientPhone} • {apt.timeSlot}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedAppointmentForPrint(apt)}
                          title="Print Patient Token Slip"
                          className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[10px] font-bold flex items-center space-x-1 shadow-2xs transition-colors cursor-pointer"
                        >
                          <Printer className="w-3 h-3 text-slate-500" />
                          <span className="hidden sm:inline">Print Slip</span>
                        </button>

                        {isCurrent && (
                          <button
                            type="button"
                            onClick={() => handleCompletePatient(apt.id)}
                            title="Mark Consultation Completed and remove from live queue"
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold flex items-center space-x-1 shadow-xs transition-colors cursor-pointer"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Done</span>
                          </button>
                        )}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isCurrent
                              ? 'bg-emerald-100 text-emerald-800 font-bold'
                              : isNext
                              ? 'bg-sky-100 text-sky-800'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {isCurrent ? 'Consulting' : isNext ? 'Ready' : 'Waiting'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Completed Consultations Today (Archived from active queue) */}
          {completedPatients.length > 0 && (
            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 space-y-2">
              <button
                type="button"
                onClick={() => setShowCompletedList(!showCompletedList)}
                className="w-full flex items-center justify-between text-left text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                <div className="flex items-center space-x-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Completed Consultations Today ({completedPatients.length})</span>
                </div>
                <span className="text-[10px] font-semibold text-teal-700 underline">
                  {showCompletedList ? 'Hide List' : 'View Completed'}
                </span>
              </button>

              {showCompletedList && (
                <div className="divide-y divide-slate-200/60 pt-2 border-t border-slate-200/60 max-h-48 overflow-y-auto space-y-1">
                  {completedPatients.map((apt) => (
                    <div key={apt.id} className="py-1.5 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="w-6 h-6 rounded-lg bg-teal-100 text-teal-800 text-[10px] font-bold flex items-center justify-center">
                          #{apt.tokenNumber}
                        </span>
                        <div>
                          <p className="font-semibold text-slate-800 text-xs">{apt.patientName}</p>
                          <p className="text-[10px] text-slate-500">{apt.patientPhone}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedAppointmentForPrint(apt)}
                          className="p-1 text-slate-400 hover:text-slate-700 bg-white border border-slate-200 rounded-md cursor-pointer"
                          title="Print Receipt"
                        >
                          <Printer className="w-3 h-3" />
                        </button>
                        <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center space-x-1">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          <span>Completed</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Direct Token Slip Print Modal */}
      {selectedAppointmentForPrint && (
        <BookingReceiptModal
          appointment={selectedAppointmentForPrint}
          onClose={() => setSelectedAppointmentForPrint(null)}
          onViewMyBookings={() => setSelectedAppointmentForPrint(null)}
        />
      )}
    </div>
  );
};
