import React from 'react';
import { 
  CheckCircle2, Building2, User, Clock, MapPin, 
  Banknote, Phone, Share2, Download, Printer, ArrowRight, X, ShieldCheck
} from 'lucide-react';
import { Appointment } from '../types';

interface Props {
  appointment: Appointment;
  onClose: () => void;
  onViewMyBookings: () => void;
}

export const BookingReceiptModal: React.FC<Props> = ({
  appointment,
  onClose,
  onViewMyBookings,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const paymentStatus = appointment.paymentStatus || 'Confirmed - Pay Cash at Counter';
  const paymentBadgeLabel = appointment.payment?.statusLabel || 'Pay Cash at Clinic';
  const amount = appointment.payment?.amount || appointment.consultationFee;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[94vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
        
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm tracking-tight">Booking Confirmed</h3>
              <p className="text-[11px] text-emerald-100">Official Hospital OPD Token Receipt</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Receipt Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1 text-slate-800">
          
          {/* Main High-Impact Token Banner */}
          <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-sky-50 border-2 border-emerald-200 rounded-2xl p-4 text-center relative overflow-hidden shadow-xs">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full inline-block mb-1">
              Assigned Token Number
            </span>
            <div className="text-4xl sm:text-5xl font-black text-emerald-800 my-1 tracking-tight">
              #{appointment.tokenNumber}
            </div>
            <p className="text-xs font-bold text-slate-700">
              OPD Room: <span className="text-emerald-700 font-extrabold">{appointment.roomNumber}</span>
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Ref ID: <span className="font-mono text-slate-600">{appointment.id}</span>
            </p>
          </div>

          {/* Doctor & Clinic Card */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-2.5">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-xl shrink-0">
                👨‍⚕️
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Doctor</span>
                <h4 className="font-extrabold text-slate-900 text-sm truncate">
                  {appointment.doctorName}
                </h4>
                <p className="text-xs font-semibold text-emerald-700 truncate">
                  {appointment.doctorSpecialty}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/80 text-xs">
              <div className="flex items-center space-x-1.5 text-slate-600">
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{appointment.bookingDate}</span>
              </div>
              <div className="flex items-center space-x-1.5 text-slate-600">
                <span className="font-bold text-slate-800 truncate">{appointment.timeSlot}</span>
              </div>
            </div>
          </div>

          {/* Patient Details */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/90 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <span className="font-bold text-slate-800 block">{appointment.patientName}</span>
                  <span className="text-[11px] text-slate-500">
                    {appointment.patientAge} yrs • {appointment.patientGender}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-semibold text-slate-600 block">+91 {appointment.patientPhone}</span>
                <span className="text-[10px] text-emerald-600 font-bold">GPS Verified</span>
              </div>
            </div>
            {appointment.location?.address && (
              <div className="flex items-center space-x-1.5 text-[11px] text-slate-600 pt-1 border-t border-slate-200/60">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="font-medium text-slate-700 truncate">{appointment.location.address}</span>
              </div>
            )}
          </div>

          {/* Payment Status Box */}
          <div className="p-3.5 bg-emerald-50/90 rounded-2xl border-2 border-emerald-300 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-900">
                Payment Status
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-600 text-white shadow-2xs">
                {paymentBadgeLabel}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center space-x-1.5 text-emerald-950 font-bold">
                <Banknote className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Pay Cash at Hospital Counter</span>
              </div>
              <span className="text-base font-black text-emerald-800">
                ₹{amount}
              </span>
            </div>

            <div className="text-[11px] text-emerald-900/90 font-medium">
              Status Summary: <strong className="font-extrabold">{paymentStatus}</strong>
            </div>
          </div>

          {/* Crucial Hospital Arrival Instructions */}
          <div className="p-3.5 bg-amber-50/90 rounded-2xl border border-amber-300/80 text-xs text-amber-950 space-y-2">
            <div className="flex items-center space-x-2 font-black text-amber-900">
              <Building2 className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Hospital Counter Arrival Instructions</span>
            </div>
            <p className="text-[11px] text-amber-900 font-medium leading-relaxed">
              👉 <strong>Show this Token (#{appointment.tokenNumber})</strong> and doctor reference at the Hospital Reception / OPD Counter upon arrival.
            </p>
            <p className="text-[11px] text-amber-900 font-medium leading-relaxed">
              👉 Please pay <strong className="font-bold">₹{amount} in cash</strong> directly at the counter to obtain your physical entry stamp before the consultation.
            </p>
          </div>

          {/* Reception Assistance Numbers */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center">
            <p className="text-[11px] font-bold text-slate-600">
              Hospital Reception & Token Helpline:
            </p>
            <div className="flex items-center justify-center space-x-3 mt-1.5">
              <a
                href="tel:9771264784"
                className="text-xs font-bold text-emerald-700 bg-white border border-slate-200 px-2.5 py-1 rounded-lg hover:bg-emerald-50 transition-colors flex items-center space-x-1"
              >
                <Phone className="w-3 h-3 text-emerald-600" />
                <span>9771264784</span>
              </a>
              <span className="text-slate-300">|</span>
              <a
                href="tel:7091472879"
                className="text-xs font-bold text-emerald-700 bg-white border border-slate-200 px-2.5 py-1 rounded-lg hover:bg-emerald-50 transition-colors flex items-center space-x-1"
              >
                <Phone className="w-3 h-3 text-emerald-600" />
                <span>7091472879</span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-2">
          <button
            type="button"
            onClick={onViewMyBookings}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md shadow-emerald-600/25 flex items-center justify-center space-x-2 cursor-pointer transition-all"
          >
            <span>View Token in My Bookings & Track Live Queue</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="py-2.5 px-3 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 cursor-pointer transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print Slip</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-3 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center cursor-pointer transition-colors"
            >
              <span>Done</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
