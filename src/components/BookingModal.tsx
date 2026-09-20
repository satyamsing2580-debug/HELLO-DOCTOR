import React, { useState } from 'react';
import { X, Calendar, Clock, User, Phone, ShieldAlert, CheckCircle2, Stethoscope, AlertCircle } from 'lucide-react';
import { Doctor } from '../types';
import { realtimeDb } from '../services/realtimeDb';
import { userAuth } from '../services/userAuth';

interface Props {
  doctor: Doctor;
  onClose: () => void;
  onSuccess: (appointmentId: string) => void;
}

export const BookingModal: React.FC<Props> = ({ doctor, onClose, onSuccess }) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [patientName, setPatientName] = useState(() => userAuth.getUserName());
  const [patientPhone, setPatientPhone] = useState(() => userAuth.getUserPhone());
  const [patientAge, setPatientAge] = useState('28');
  const [patientGender, setPatientGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [bookingDate, setBookingDate] = useState(todayStr);
  const [timeSlot, setTimeSlot] = useState('10:00 AM');
  const [symptoms, setSymptoms] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const availableSlots = [
    '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM',
    '11:30 AM', '12:00 PM', '12:30 PM', '01:00 PM'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) {
      setErrorMsg('Please enter patient full name');
      return;
    }
    if (!patientPhone.trim() || patientPhone.trim().length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const apt = await realtimeDb.bookAppointment({
        patientName,
        patientPhone,
        patientAge: parseInt(patientAge, 10) || 25,
        patientGender,
        doctorId: doctor.id,
        bookingDate,
        timeSlot,
        symptomBrief: symptoms
      });

      onSuccess(apt.id);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Booking failed. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-2xl shrink-0">
              {doctor.emoji || '👨‍⚕️'}
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">{doctor.name}</h3>
              <p className="text-xs text-slate-500">{doctor.specialty} • Room {doctor.roomNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Doctor Quick Badge */}
        <div className="px-5 py-3 bg-sky-50/70 border-b border-sky-100/80 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-600 font-medium">OPD Room: </span>
            <span className="font-bold text-slate-900">{doctor.roomNumber}</span>
            <span className="mx-2 text-slate-300">|</span>
            <span className="text-slate-600 font-medium">Fee: </span>
            <span className="font-bold text-sky-700">₹{doctor.consultationFee}</span>
          </div>
          <div className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full text-[11px]">
            Live Token: #{doctor.currentToken}
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-slate-800">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Notice about Pending Confirmation */}
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs flex items-start space-x-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Hospital OPD Protocol</p>
              <p className="text-amber-800 text-[11px] mt-0.5 leading-relaxed">
                Your appointment will register in <strong>Pending</strong> status until Hospital Admin verifies slot capacity. You will immediately be able to track live token progress once confirmed.
              </p>
            </div>
          </div>

          {/* Patient Details */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Patient Full Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Kumar"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Mobile Contact Number *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="tel"
                required
                maxLength={10}
                placeholder="10-digit mobile number"
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value.replace(/\D/g, ''))}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Age
              </label>
              <input
                type="number"
                min="1"
                max="120"
                value={patientAge}
                onChange={(e) => setPatientAge(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Gender
              </label>
              <select
                value={patientGender}
                onChange={(e) => setPatientGender(e.target.value as 'Male' | 'Female' | 'Other')}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Booking Date
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="date"
                  value={bookingDate}
                  min={todayStr}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full pl-9 pr-2 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Time Slot
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full pl-9 pr-2 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                >
                  {availableSlots.map(slot => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Reason / Symptoms (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Chest tightness, fever, follow-up..."
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 resize-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white font-bold rounded-xl shadow-md shadow-sky-600/25 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>{isSubmitting ? 'Registering Token...' : 'Confirm & Generate OPD Token'}</span>
            </button>
            <p className="text-center text-[11px] text-slate-500 mt-2">
              Pay consultation fee ₹{doctor.consultationFee} directly at OPD reception counter
            </p>

            <div className="mt-3 pt-3 border-t border-slate-100 text-center">
              <p className="text-[11px] font-semibold text-slate-600">
                Call se appointment book karne ke liye:
              </p>
              <div className="flex items-center justify-center space-x-2 mt-1">
                <a
                  href="tel:9771264784"
                  className="text-xs font-bold text-sky-600 hover:text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md flex items-center space-x-1"
                >
                  <span>📞 9771264784</span>
                </a>
                <span className="text-slate-300 text-xs">|</span>
                <a
                  href="tel:7091472879"
                  className="text-xs font-bold text-sky-600 hover:text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md flex items-center space-x-1"
                >
                  <span>📞 7091472879</span>
                </a>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
