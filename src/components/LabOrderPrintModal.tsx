import React from 'react';
import { X, Printer, Building2, User, Phone, MapPin, Calendar, Clock, CheckCircle, FileText, ArrowRight } from 'lucide-react';
import { LabBooking } from '../types';

interface Props {
  booking: LabBooking;
  onClose: () => void;
}

export const LabOrderPrintModal: React.FC<Props> = ({ booking, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-indigo-700 to-teal-700 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <Printer className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm">Lab Sample Order &amp; Invoice Slip</h3>
              <p className="text-[11px] text-teal-100">Order #{booking.id.slice(-8).toUpperCase()}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs text-slate-800 flex-1">
          {/* Header Banner */}
          <div className="text-center border-b-2 border-slate-200 pb-3 space-y-1">
            <div className="flex items-center justify-center space-x-1.5 text-indigo-700">
              <Building2 className="w-4 h-4" />
              <h2 className="font-black text-sm tracking-wider uppercase">
                Hello Doctor Diagnostic &amp; Pathology
              </h2>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">
              Gopalganj Diagnostic Wing • Ph: 9771264784, 7091472879
            </p>
            <div className="inline-block bg-slate-100 px-3 py-0.5 rounded-full text-[10px] font-bold text-slate-700 uppercase tracking-widest mt-1">
              Sample Collection Voucher &amp; Bill
            </div>
          </div>

          {/* Barcode & Order Info */}
          <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Order ID</span>
              <span className="font-mono font-extrabold text-indigo-900 text-sm">{booking.id}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Order Date</span>
              <span className="font-bold text-slate-700">{booking.date} ({booking.timeSlot})</span>
            </div>
          </div>

          {/* Complete Patient Details */}
          <div className="p-3 bg-white rounded-2xl border border-slate-200 space-y-2">
            <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              Patient Identification Details
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">Full Name:</span>
                <span className="font-black text-slate-900">{booking.patientName}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Age &amp; Gender:</span>
                <span className="font-bold text-slate-800">
                  {booking.patientAge ? `${booking.patientAge} Years` : '28 Years'} • {booking.patientGender || 'Adult'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Mobile Phone:</span>
                <span className="font-bold text-slate-800 font-mono">{booking.patientPhone}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Service Mode:</span>
                <span className="font-bold text-teal-700">{booking.bookingType}</span>
              </div>
            </div>

            {booking.address && (
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[10px] text-slate-400 block">Sample Collection Address:</span>
                <span className="font-semibold text-slate-800 block text-xs">{booking.address}</span>
              </div>
            )}
          </div>

          {/* Booked Tests Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <div className="bg-slate-100 p-2.5 font-bold text-xs text-slate-700 flex justify-between">
              <span>Test Investigation</span>
              <span>Amount</span>
            </div>
            <div className="p-3 divide-y divide-slate-100">
              <div className="py-2 flex justify-between items-center text-xs">
                <div>
                  <h5 className="font-bold text-slate-900">{booking.testName}</h5>
                  <p className="text-[10px] text-slate-500">Category: {booking.category}</p>
                </div>
                <span className="font-black text-sm text-slate-900">₹{booking.price}</span>
              </div>
            </div>
            <div className="bg-slate-50 p-2.5 border-t border-slate-200 flex justify-between items-center text-xs font-black">
              <span>Total Bill Amount (Paid/Cash):</span>
              <span className="text-sm text-indigo-900">₹{booking.price}</span>
            </div>
          </div>

          {/* Status & Barcode simulation */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Current Fulfillment Status</span>
              <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full inline-block mt-0.5">
                {booking.status}
              </span>
            </div>

            <div className="text-right">
              <div className="font-mono text-base tracking-widest text-slate-700 font-bold">
                ||| | |||| | ||| |
              </div>
              <span className="text-[9px] text-slate-400 font-mono block">SPECIMEN #{booking.id.slice(-6)}</span>
            </div>
          </div>

          {/* Signatures */}
          <div className="pt-4 flex justify-between text-[10px] text-slate-400">
            <div>
              <div className="border-b border-slate-300 w-28 h-6 mb-1"></div>
              <span>Phlebotomist Signature</span>
            </div>
            <div className="text-right">
              <div className="border-b border-slate-300 w-28 h-6 mb-1"></div>
              <span>Lab Incharge / Stamp</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
          >
            Close
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center space-x-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Slip Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};
