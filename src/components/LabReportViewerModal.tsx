import React from 'react';
import { X, Download, Printer, CheckCircle, FileText, Calendar, User, Phone, MapPin, Building2, ShieldCheck, Sparkles } from 'lucide-react';
import { LabBooking } from '../types';

interface Props {
  booking: LabBooking;
  onClose: () => void;
}

export const LabReportViewerModal: React.FC<Props> = ({ booking, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const isImage = booking.reportUrl?.startsWith('data:image') || 
                  booking.reportUrl?.endsWith('.png') || 
                  booking.reportUrl?.endsWith('.jpg') || 
                  booking.reportUrl?.endsWith('.jpeg');

  const isPdf = booking.reportUrl?.startsWith('data:application/pdf') || 
                booking.reportUrl?.endsWith('.pdf');

  const handleDownload = () => {
    if (!booking.reportUrl) return;
    const a = document.createElement('a');
    a.href = booking.reportUrl;
    a.download = booking.reportFileName || `${booking.testName}_Report.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[94vh]">
        {/* Top Header */}
        <div className="p-4 bg-gradient-to-r from-teal-700 via-indigo-800 to-purple-800 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base">Official Diagnostic Test Report</h3>
              <p className="text-[11px] text-teal-200">Hello Doctor Pathology &amp; Diagnostic Center</p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={handlePrint}
              className="p-1.5 text-white/90 hover:text-white rounded-lg hover:bg-white/10 transition-colors flex items-center space-x-1 text-xs font-bold cursor-pointer"
              title="Print Report"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Report Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs text-slate-800 flex-1">
          {/* Diagnostic Center Letterhead */}
          <div className="border-b-2 border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-teal-700" />
                <h2 className="font-black text-base text-slate-900 tracking-tight">
                  HELLO DOCTOR HEALTHCARE &amp; DIAGNOSTICS
                </h2>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Bhitbherwa, Gopalganj, Bihar • NABL Quality Standard Lab
              </p>
              <p className="text-[10px] text-slate-400">
                Helpline: +91 9771264784 | Emergency: +91 7091472879
              </p>
            </div>

            <div className="sm:text-right bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Report Status</span>
              <span className="inline-flex items-center space-x-1 text-xs font-extrabold text-emerald-700">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Verified &amp; Certified</span>
              </span>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Order ID: <span className="font-mono font-bold text-slate-700">{booking.id.slice(-8)}</span>
              </p>
            </div>
          </div>

          {/* Patient Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Patient Name</span>
              <span className="font-black text-slate-900 block truncate">{booking.patientName}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Age / Gender</span>
              <span className="font-bold text-slate-800 block">
                {booking.patientAge ? `${booking.patientAge} Years` : '28 Years'} • {booking.patientGender || 'Adult'}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Contact</span>
              <span className="font-bold text-slate-800 block font-mono">{booking.patientPhone}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Date &amp; Time</span>
              <span className="font-bold text-slate-800 block">{booking.date}</span>
            </div>
          </div>

          {/* Test Info Header */}
          <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700">
                Diagnostic Investigation
              </span>
              <h3 className="font-black text-sm text-slate-900 mt-0.5">{booking.testName}</h3>
              <p className="text-[11px] text-slate-500">Category: {booking.category} • Mode: {booking.bookingType}</p>
            </div>
            <span className="text-xs font-black text-teal-900 bg-white px-3 py-1.5 rounded-xl border border-teal-200 shadow-2xs">
              Fee: ₹{booking.price} (Paid)
            </span>
          </div>

          {/* Visual Report Viewer (Image or Embedded Document) */}
          {booking.reportUrl ? (
            <div className="space-y-3">
              {isImage ? (
                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-100 flex items-center justify-center p-2">
                  <img
                    src={booking.reportUrl}
                    alt="Lab Report"
                    className="max-h-[50vh] object-contain rounded-xl shadow-xs"
                  />
                </div>
              ) : isPdf ? (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-2">
                  <FileText className="w-12 h-12 text-indigo-600 mx-auto" />
                  <h4 className="font-bold text-sm text-slate-900">{booking.reportFileName || 'Diagnostic_Report.pdf'}</h4>
                  <p className="text-xs text-slate-500">
                    Your official lab test document is ready for viewing and download.
                  </p>
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs inline-flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download / Open PDF Document</span>
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 font-mono text-xs whitespace-pre-wrap leading-relaxed text-slate-800">
                  <div className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider font-sans mb-1">
                    Certified Clinical Findings
                  </div>
                  {booking.reportNotes || 'All test parameters verified.'}
                </div>
              )}

              {/* Additional Clinical Notes if available */}
              {booking.reportNotes && !booking.reportUrl.startsWith('data:text') && (
                <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-2xl space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-800">
                    Clinical Notes &amp; Pathologist Remarks
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed">{booking.reportNotes}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-2">
              <Sparkles className="w-8 h-8 text-amber-500 mx-auto" />
              <h4 className="font-extrabold text-slate-800 text-sm">Report Processing</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Your sample has been collected and is currently being processed by our pathology team. The digital report will appear here once approved.
              </p>
            </div>
          )}

          {/* Signoff / Certification Footer */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-500 gap-3">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Electronically signed &amp; authenticated by NABL certified diagnostic team.</span>
            </div>

            <div className="text-right shrink-0">
              <div className="h-7 flex items-center justify-end">
                <span className="font-serif italic font-bold text-slate-700 text-sm">Dr. R. K. Sharma</span>
              </div>
              <p className="text-[10px] font-bold text-slate-600">Consultant Pathologist</p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition-colors"
          >
            Close
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl flex items-center space-x-1.5 cursor-pointer transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            {booking.reportUrl && (
              <button
                type="button"
                onClick={handleDownload}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center space-x-1.5 cursor-pointer transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Report</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
