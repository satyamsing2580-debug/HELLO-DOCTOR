import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle, AlertCircle, Sparkles, Image as ImageIcon, Eye } from 'lucide-react';
import { LabBooking } from '../types';
import { realtimeDb } from '../services/realtimeDb';

interface Props {
  booking: LabBooking;
  onClose: () => void;
  onSuccess: () => void;
}

export const UploadLabReportModal: React.FC<Props> = ({ booking, onClose, onSuccess }) => {
  const [reportType, setReportType] = useState<'upload' | 'digital'>('upload');
  const [fileDataUrl, setFileDataUrl] = useState<string>(booking.reportUrl || '');
  const [fileName, setFileName] = useState<string>(booking.reportFileName || '');
  const [reportNotes, setReportNotes] = useState<string>(booking.reportNotes || '');
  const [findingsText, setFindingsText] = useState<string>('');
  const [pathologistName, setPathologistName] = useState<string>('Dr. R. K. Sharma (MD, Consultant Pathologist)');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setErrorMessage('File size exceeds 8MB limit. Please upload a smaller PDF or image.');
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setFileDataUrl(reader.result as string);
      setErrorMessage('');
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read file. Please try another image or document.');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    let finalReportUrl = fileDataUrl;
    let finalFileName = fileName;

    if (reportType === 'digital') {
      if (!findingsText.trim()) {
        setErrorMessage('Please enter diagnostic findings or test summary notes.');
        return;
      }
      finalFileName = `${booking.testName.replace(/\s+/g, '_')}_Official_Report.pdf`;
      // Create a formatted data URI or document summary
      finalReportUrl = fileDataUrl || `data:text/plain;charset=utf-8,${encodeURIComponent(
        `HELLO DOCTOR DIAGNOSTIC PATHOLOGY LABORATORY\n` +
        `PATIENT REPORT: ${booking.patientName}\n` +
        `TEST: ${booking.testName}\n` +
        `DATE: ${booking.date}\n\n` +
        `CLINICAL FINDINGS & VALUES:\n${findingsText}\n\n` +
        `PATHOLOGIST: ${pathologistName}`
      )}`;
    } else {
      if (!finalReportUrl) {
        setErrorMessage('Please select a report PDF file or test result photo to upload.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const combinedNotes = reportNotes.trim() + (findingsText.trim() ? `\n\n[Findings]: ${findingsText.trim()}` : '');
      await realtimeDb.uploadLabReport(booking.id, {
        reportUrl: finalReportUrl,
        reportFileName: finalFileName || `${booking.testName}_Report.pdf`,
        reportNotes: combinedNotes
      });
      setIsSubmitting(false);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setIsSubmitting(false);
      setErrorMessage(err instanceof Error ? err.message : 'Failed to upload report');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-800 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <Upload className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm">Upload & Send Patient Report</h3>
              <p className="text-[11px] text-indigo-200">Patient: {booking.patientName} • {booking.testName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="p-3 bg-slate-50 border-b border-slate-200">
          <div className="grid grid-cols-2 gap-1.5 bg-slate-200/80 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setReportType('upload')}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                reportType === 'upload' ? 'bg-white text-indigo-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              <span>Upload PDF / Photo</span>
            </button>
            <button
              type="button"
              onClick={() => setReportType('digital')}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                reportType === 'digital' ? 'bg-white text-indigo-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>Digital Test Findings</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs flex-1">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Patient & Test Overview Box */}
          <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">Test Ordered</span>
              <span className="text-[10px] font-bold text-slate-500">Order ID: #{booking.id.slice(-6)}</span>
            </div>
            <h4 className="font-extrabold text-sm text-slate-900">{booking.testName}</h4>
            <p className="text-[11px] text-slate-600">
              Patient: <strong className="text-slate-800">{booking.patientName}</strong> • {booking.patientPhone}
            </p>
          </div>

          {reportType === 'upload' ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Select Diagnostic Report (PDF or Scan Photo) *
                </label>
                <div className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/30 rounded-2xl p-4 text-center cursor-pointer transition-colors relative">
                  <input
                    type="file"
                    accept="application/pdf,image/*"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="space-y-1.5 flex flex-col items-center">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                      <Upload className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-indigo-900">
                      {fileName ? fileName : 'Click or Drag Report File Here'}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Supports PDF documents, JPG, PNG scanned report slips (Up to 8MB)
                    </p>
                  </div>
                </div>
              </div>

              {fileDataUrl && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800">
                  <div className="flex items-center space-x-2 truncate">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-bold truncate">{fileName || 'Report document attached'}</span>
                  </div>
                  <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full shrink-0">
                    Ready
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Enter Diagnostic Test Parameters &amp; Values *
                </label>
                <textarea
                  rows={4}
                  required
                  value={findingsText}
                  onChange={(e) => setFindingsText(e.target.value)}
                  placeholder="e.g.&#10;• Fasting Blood Sugar: 94 mg/dL (Normal: 70 - 100)&#10;• Hemoglobin: 14.2 g/dL (Normal: 13.0 - 17.0)&#10;• Impression: All tested parameters are within normal physiological range."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reporting Pathologist / Incharge
                </label>
                <input
                  type="text"
                  value={pathologistName}
                  onChange={(e) => setPathologistName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {/* Remarks & Clinical Advice */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Remarks / Instructions for Patient (Optional)
            </label>
            <input
              type="text"
              value={reportNotes}
              onChange={(e) => setReportNotes(e.target.value)}
              placeholder="e.g. Consult your physician Dr. Verma with this report"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="p-3 bg-purple-50/70 border border-purple-100 rounded-xl flex items-start space-x-2 text-[11px] text-purple-900">
            <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
            <p>
              Once uploaded, the status will automatically update to <strong>Report Generated</strong>. The patient will instantly see the <strong>&quot;See Your Report&quot;</strong> button in their &quot;My Bookings&quot; section to view and download.
            </p>
          </div>

          {/* Footer Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              <span>{isSubmitting ? 'Uploading & Syncing...' : 'Upload & Send Report to Patient'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
