import React, { useState, useEffect, useRef } from 'react';
import { 
  FlaskConical, Search, Printer, Upload, CheckCircle, Clock, 
  AlertCircle, Phone, MapPin, User, LogOut, Volume2, VolumeX, 
  FileText, Calendar, Filter, Sparkles, RefreshCw, Eye
} from 'lucide-react';
import { LabBooking, LabTest } from '../types';
import { realtimeDb } from '../services/realtimeDb';
import { sirenManager } from '../services/audioSiren';
import { UploadLabReportModal } from './UploadLabReportModal';
import { LabOrderPrintModal } from './LabOrderPrintModal';
import { LabReportViewerModal } from './LabReportViewerModal';

interface Props {
  labTests: LabTest[];
  onExit: () => void;
}

export const LabAdminDashboard: React.FC<Props> = ({ labTests, onExit }) => {
  const [labBookings, setLabBookings] = useState<LabBooking[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedBookingForUpload, setSelectedBookingForUpload] = useState<LabBooking | null>(null);
  const [selectedBookingForPrint, setSelectedBookingForPrint] = useState<LabBooking | null>(null);
  const [selectedBookingForView, setSelectedBookingForView] = useState<LabBooking | null>(null);
  
  // Real-time Audio Alert System
  const [newOrderAlert, setNewOrderAlert] = useState<LabBooking | null>(null);
  const prevBookingsCountRef = useRef<number | null>(null);
  const knownIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const unsubscribe = realtimeDb.subscribeLabBookings((bookings) => {
      setLabBookings(bookings);

      // Detect newly arrived bookings
      if (prevBookingsCountRef.current !== null) {
        const newlyAdded = bookings.filter(b => !knownIdsRef.current.has(b.id));
        if (newlyAdded.length > 0) {
          // Play hospital lab order notification sound (Beep)
          sirenManager.playLabBeep();
          setNewOrderAlert(newlyAdded[0]);
        }
      }

      // Update known IDs
      prevBookingsCountRef.current = bookings.length;
      knownIdsRef.current = new Set(bookings.map(b => b.id));
    });

    return () => unsubscribe();
  }, []);

  const handleUpdateStatus = async (bookingId: string, status: LabBooking['status']) => {
    await realtimeDb.updateLabBookingStatus(bookingId, status);
  };

  const filteredBookings = labBookings.filter((b) => {
    const matchesSearch =
      b.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.patientPhone.includes(searchQuery) ||
      b.testName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.address && b.address.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterStatus === 'all') return true;
    if (filterStatus === 'pending') return b.status === 'Pending' || b.status === 'Confirmed';
    if (filterStatus === 'sample_collected') return b.status === 'Sample Collected';
    if (filterStatus === 'report_generated') return b.status === 'Report Generated';
    if (filterStatus === 'completed') return b.status === 'Completed';
    return true;
  });

  const pendingCount = labBookings.filter(b => b.status === 'Pending' || b.status === 'Confirmed').length;
  const sampleCollectedCount = labBookings.filter(b => b.status === 'Sample Collected').length;
  const reportsReadyCount = labBookings.filter(b => b.status === 'Report Generated').length;
  const completedCount = labBookings.filter(b => b.status === 'Completed').length;

  return (
    <div className="pb-28 pt-2 px-3 sm:px-4 max-w-xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-[10px] font-bold tracking-wider text-indigo-700 uppercase bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                Diagnostic Wing
              </span>
              <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Live Beep Sync
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900 mt-0.5">Lab Admin Portal</h2>
          </div>
        </div>

        <button
          onClick={onExit}
          className="text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center space-x-1"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Exit</span>
        </button>
      </div>

      {/* Real-time Order Audio Alert Banner */}
      {newOrderAlert && (
        <div className="p-3.5 bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 text-white rounded-2xl shadow-lg border border-indigo-500/50 flex items-center justify-between animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center space-x-3 min-w-0">
            <span className="relative flex h-3 w-3 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
            </span>
            <div className="min-w-0">
              <h4 className="text-xs font-black text-indigo-200 truncate flex items-center space-x-1">
                <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>New Lab Order Received (Beep Sounded)!</span>
              </h4>
              <p className="text-[11px] text-white truncate">
                {newOrderAlert.patientName} • {newOrderAlert.testName} (₹{newOrderAlert.price})
              </p>
            </div>
          </div>
          <button
            onClick={() => setNewOrderAlert(null)}
            className="text-[10px] font-bold bg-white/20 hover:bg-white/30 text-white px-2.5 py-1 rounded-lg shrink-0 ml-2 cursor-pointer transition-colors"
          >
            Acknowledge
          </button>
        </div>
      )}

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-4 gap-2 text-center">
        <button
          onClick={() => setFilterStatus('pending')}
          className={`p-2 rounded-2xl border transition-all cursor-pointer ${
            filterStatus === 'pending'
              ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-amber-50/50'
          }`}
        >
          <span className="text-[10px] font-bold block uppercase opacity-80">Pending</span>
          <span className="text-lg font-black">{pendingCount}</span>
        </button>

        <button
          onClick={() => setFilterStatus('sample_collected')}
          className={`p-2 rounded-2xl border transition-all cursor-pointer ${
            filterStatus === 'sample_collected'
              ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-indigo-50/50'
          }`}
        >
          <span className="text-[10px] font-bold block uppercase opacity-80">Sample In</span>
          <span className="text-lg font-black">{sampleCollectedCount}</span>
        </button>

        <button
          onClick={() => setFilterStatus('report_generated')}
          className={`p-2 rounded-2xl border transition-all cursor-pointer ${
            filterStatus === 'report_generated'
              ? 'bg-purple-600 text-white border-purple-700 shadow-xs'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-purple-50/50'
          }`}
        >
          <span className="text-[10px] font-bold block uppercase opacity-80">Reports</span>
          <span className="text-lg font-black">{reportsReadyCount}</span>
        </button>

        <button
          onClick={() => setFilterStatus('completed')}
          className={`p-2 rounded-2xl border transition-all cursor-pointer ${
            filterStatus === 'completed'
              ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-emerald-50/50'
          }`}
        >
          <span className="text-[10px] font-bold block uppercase opacity-80">Completed</span>
          <span className="text-lg font-black">{completedCount}</span>
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search patient name, phone, order ID, test..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto text-[11px] pb-0.5">
          {[
            { id: 'all', label: 'All Orders' },
            { id: 'pending', label: 'Pending/Confirmed' },
            { id: 'sample_collected', label: 'Sample Collected' },
            { id: 'report_generated', label: 'Report Ready' },
            { id: 'completed', label: 'Completed' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1 rounded-lg font-bold shrink-0 transition-colors cursor-pointer ${
                filterStatus === tab.id
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lab Orders List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-extrabold text-xs text-slate-700 uppercase tracking-wider">
            Patient Lab Orders ({filteredBookings.length})
          </h3>
          <span className="text-[10px] text-slate-400 font-semibold">Realtime Auto-Sync</span>
        </div>

        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-2">
            <FlaskConical className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="font-bold text-sm text-slate-700">No lab orders found</h4>
            <p className="text-xs text-slate-400">
              {searchQuery ? 'Try matching another patient phone or test name' : 'New test bookings will appear here instantly with an audio beep alert.'}
            </p>
          </div>
        ) : (
          filteredBookings.map((booking) => {
            const isCompleted = booking.status === 'Completed';
            const isReportReady = booking.status === 'Report Generated';
            const isSampleIn = booking.status === 'Sample Collected';

            return (
              <div
                key={booking.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3 transition-shadow hover:shadow-md"
              >
                {/* Header: Test Name & Status Badge */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">
                        {booking.category}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        Order #{booking.id.slice(-6)}
                      </span>
                    </div>
                    <h4 className="font-extrabold text-sm text-slate-900 mt-1">{booking.testName}</h4>
                  </div>

                  <div className="text-right">
                    <span className="font-black text-sm text-slate-900 block">₹{booking.price}</span>
                    {/* Status Badge: GREEN for Completed */}
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full inline-block mt-0.5 border ${
                      isCompleted
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        : isReportReady
                        ? 'bg-purple-100 text-purple-800 border-purple-200'
                        : isSampleIn
                        ? 'bg-indigo-100 text-indigo-800 border-indigo-200'
                        : 'bg-amber-100 text-amber-800 border-amber-200'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                </div>

                {/* Complete Patient Details */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">Patient:</span>
                      <span className="font-black text-slate-900">{booking.patientName}</span>
                      <span className="text-[11px] text-slate-500 block">
                        {booking.patientAge ? `${booking.patientAge}y` : '28y'} • {booking.patientGender || 'Adult'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">Phone:</span>
                      <a
                        href={`tel:${booking.patientPhone}`}
                        className="font-bold text-indigo-700 hover:underline flex items-center space-x-1"
                      >
                        <Phone className="w-3 h-3 text-indigo-600" />
                        <span>{booking.patientPhone}</span>
                      </a>
                      <span className="text-[10px] text-slate-500 block mt-0.5 font-medium">
                        Mode: <strong className="text-slate-800">{booking.bookingType}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-600">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{booking.date} • {booking.timeSlot}</span>
                    </div>
                    <span className="font-bold text-emerald-700">Cash / Paid</span>
                  </div>

                  {booking.address && (
                    <div className="pt-1.5 border-t border-slate-200/60 text-[11px] text-slate-600 flex items-start space-x-1.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                      <span className="leading-tight">
                        Address: <strong className="text-slate-800 font-semibold">{booking.address}</strong>
                      </span>
                    </div>
                  )}
                </div>

                {/* Report Info if uploaded */}
                {booking.reportUrl && (
                  <div className="p-2.5 bg-purple-50/80 border border-purple-200 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2 truncate">
                      <FileText className="w-4 h-4 text-purple-700 shrink-0" />
                      <span className="font-bold text-purple-900 truncate">
                        {booking.reportFileName || 'Diagnostic Report Uploaded'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedBookingForView(booking)}
                      className="text-[11px] font-bold text-purple-700 hover:text-purple-900 bg-white border border-purple-200 px-2 py-0.5 rounded-lg flex items-center space-x-1 cursor-pointer shrink-0 ml-2"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Preview</span>
                    </button>
                  </div>
                )}

                {/* Actions Grid */}
                <div className="pt-1 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100">
                  {/* Left: Workflow Status Stepper */}
                  <div className="flex items-center space-x-1">
                    {booking.status !== 'Sample Collected' && booking.status !== 'Report Generated' && booking.status !== 'Completed' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(booking.id, 'Sample Collected')}
                        className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] rounded-xl border border-indigo-200 transition-colors cursor-pointer"
                      >
                        Sample In
                      </button>
                    )}

                    {booking.status !== 'Completed' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(booking.id, 'Completed')}
                        className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[11px] rounded-xl border border-emerald-200 transition-colors cursor-pointer"
                      >
                        Mark Completed
                      </button>
                    )}
                  </div>

                  {/* Right: Print & Upload Actions */}
                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedBookingForPrint(booking)}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-bold text-[11px] rounded-xl border border-slate-200 flex items-center space-x-1 shadow-2xs transition-colors cursor-pointer"
                      title="Print Patient Order Slip"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-500" />
                      <span>Print</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedBookingForUpload(booking)}
                      className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-[11px] rounded-xl shadow-xs flex items-center space-x-1 transition-all cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{booking.reportUrl ? 'Re-upload / Send' : 'Upload / Send Report'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Upload Lab Report Modal */}
      {selectedBookingForUpload && (
        <UploadLabReportModal
          booking={selectedBookingForUpload}
          onClose={() => setSelectedBookingForUpload(null)}
          onSuccess={() => {
            // refreshed via realtimeDb
          }}
        />
      )}

      {/* Print Lab Order Slip Modal */}
      {selectedBookingForPrint && (
        <LabOrderPrintModal
          booking={selectedBookingForPrint}
          onClose={() => setSelectedBookingForPrint(null)}
        />
      )}

      {/* Preview Lab Report Modal */}
      {selectedBookingForView && (
        <LabReportViewerModal
          booking={selectedBookingForView}
          onClose={() => setSelectedBookingForView(null)}
        />
      )}
    </div>
  );
};
