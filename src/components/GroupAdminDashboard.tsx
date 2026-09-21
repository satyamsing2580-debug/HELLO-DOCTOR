import React, { useState, useEffect } from 'react';
import { Doctor, Appointment, LabBooking, MedicineOrder, HomeVisitBooking, AppSettings, LabTest, PatientFeedback } from '../types';
import { realtimeDb } from '../services/realtimeDb';
import { sirenManager } from '../services/audioSiren';
import { DoctorEditModal } from './DoctorEditModal';
import { LabTestEditModal } from './LabTestEditModal';
import { 
  TrendingUp, Users, CalendarCheck, Clock, CheckCircle2, XCircle, 
  PlusCircle, Edit3, Trash2, BellRing, VolumeX, ShieldAlert,
  ArrowUpRight, Stethoscope, Search, RefreshCw, Truck, Home,
  DollarSign, Sliders, Eye, Save, Phone, MapPin, Check,
  FlaskConical, ClipboardList, Sparkles, Tag, CheckCircle, Star, MessageSquare
} from 'lucide-react';

interface Props {
  doctors: Doctor[];
  appointments: Appointment[];
  labBookings: LabBooking[];
  medicineOrders?: MedicineOrder[];
  homeVisits?: HomeVisitBooking[];
  appSettings: AppSettings;
  labTests: LabTest[];
  hasActiveAlarm: boolean;
  onAcknowledgeAlarm: () => void;
  onExit: () => void;
}

export const GroupAdminDashboard: React.FC<Props> = ({
  doctors,
  appointments,
  labBookings,
  medicineOrders = [],
  homeVisits = [],
  appSettings,
  labTests,
  hasActiveAlarm,
  onAcknowledgeAlarm,
  onExit
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'verification' | 'medicines' | 'home_visits' | 'lab_orders' | 'lab_tests' | 'feedbacks' | 'pricing' | 'doctors' | 'financial'>('verification');
  const [appointmentFilter, setAppointmentFilter] = useState<'pending' | 'all' | 'confirmed' | 'cancelled'>('pending');
  const [doctorToEdit, setDoctorToEdit] = useState<Doctor | null>(null);
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const [searchDoctor, setSearchDoctor] = useState('');
  
  // Patient Feedbacks State
  const [feedbacks, setFeedbacks] = useState<PatientFeedback[]>(() => realtimeDb.getFeedbacks());
  const [feedbackStatusFilter, setFeedbackStatusFilter] = useState<'all' | 'New' | 'Reviewed' | 'Action Taken'>('all');
  const [feedbackServiceFilter, setFeedbackServiceFilter] = useState<string>('all');
  const [searchFeedback, setSearchFeedback] = useState<string>('');
  const [adminNoteInput, setAdminNoteInput] = useState<Record<string, string>>({});
  const [savingFeedbackId, setSavingFeedbackId] = useState<string | null>(null);
  
  // Lab Orders & Lab Tests State
  const [labOrderFilter, setLabOrderFilter] = useState<'all' | 'pending' | 'confirmed' | 'sample_collected' | 'report_generated' | 'completed' | 'cancelled'>('all');
  const [searchLabOrder, setSearchLabOrder] = useState('');
  const [searchLabTest, setSearchLabTest] = useState('');
  const [labCategoryFilter, setLabCategoryFilter] = useState('All');
  const [testToEdit, setTestToEdit] = useState<LabTest | null>(null);
  const [isLabTestModalOpen, setIsLabTestModalOpen] = useState(false);

  // Dynamic token assignment temporary state per appointment { [aptId]: tokenNumber }
  const [customTokens, setCustomTokens] = useState<Record<string, number>>({});
  
  // Dynamic Pricing State
  const [editingSettings, setEditingSettings] = useState<AppSettings>({ ...appSettings });
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsSaveSuccess, setSettingsSaveSuccess] = useState(false);

  // Selected prescription preview
  const [previewPrescription, setPreviewPrescription] = useState<string | null>(null);

  // Home visit doctor assignment state { [visitId]: doctorName }
  const [assignedDoctors, setAssignedDoctors] = useState<Record<string, string>>({});

  // Sync settings if props change
  useEffect(() => {
    setEditingSettings(appSettings);
  }, [appSettings]);

  // Audio alarm strictly sounds INSIDE Group Admin dashboard only
  useEffect(() => {
    if (hasActiveAlarm) {
      sirenManager.startSiren();
    } else {
      sirenManager.stopSiren();
    }

    return () => {
      sirenManager.stopSiren();
    };
  }, [hasActiveAlarm]);

  // Real-time synchronization of patient feedbacks
  useEffect(() => {
    return realtimeDb.subscribeFeedbacks((list) => {
      setFeedbacks(list);
    });
  }, []);

  // Dynamic Financial Analytics
  const financials = realtimeDb.getFinancialSummary();

  // Feedback Metrics Calculation
  const totalFeedbacksCount = feedbacks.length;
  const newFeedbacksCount = feedbacks.filter(f => f.adminStatus === 'New').length;
  const avgOverallRating = totalFeedbacksCount > 0 
    ? (feedbacks.reduce((acc, f) => acc + f.rating, 0) / totalFeedbacksCount).toFixed(1)
    : '5.0';
  const avgDoctorRating = totalFeedbacksCount > 0 && feedbacks.some(f => f.doctorRating)
    ? (feedbacks.filter(f => f.doctorRating).reduce((acc, f) => acc + (f.doctorRating || 0), 0) / feedbacks.filter(f => f.doctorRating).length).toFixed(1)
    : '5.0';
  const avgWaitRating = totalFeedbacksCount > 0 && feedbacks.some(f => f.waitingTimeRating)
    ? (feedbacks.filter(f => f.waitingTimeRating).reduce((acc, f) => acc + (f.waitingTimeRating || 0), 0) / feedbacks.filter(f => f.waitingTimeRating).length).toFixed(1)
    : '5.0';
  const avgStaffRating = totalFeedbacksCount > 0 && feedbacks.some(f => f.staffRating)
    ? (feedbacks.filter(f => f.staffRating).reduce((acc, f) => acc + (f.staffRating || 0), 0) / feedbacks.filter(f => f.staffRating).length).toFixed(1)
    : '5.0';
  const avgCleanRating = totalFeedbacksCount > 0 && feedbacks.some(f => f.cleanlinessRating)
    ? (feedbacks.filter(f => f.cleanlinessRating).reduce((acc, f) => acc + (f.cleanlinessRating || 0), 0) / feedbacks.filter(f => f.cleanlinessRating).length).toFixed(1)
    : '5.0';

  // Filtered Patient Feedbacks
  const filteredFeedbacks = feedbacks.filter(f => {
    if (feedbackStatusFilter !== 'all' && f.adminStatus !== feedbackStatusFilter) {
      return false;
    }
    if (feedbackServiceFilter !== 'all' && f.serviceType !== feedbackServiceFilter) {
      return false;
    }
    if (searchFeedback.trim()) {
      const q = searchFeedback.toLowerCase();
      const matchName = f.patientName.toLowerCase().includes(q);
      const matchPhone = f.patientPhone.includes(q);
      const matchDoc = f.doctorName?.toLowerCase().includes(q) || false;
      const matchComments = f.comments.toLowerCase().includes(q);
      const matchToken = f.tokenNumber ? f.tokenNumber.toString().includes(q) : false;
      if (!matchName && !matchPhone && !matchDoc && !matchComments && !matchToken) return false;
    }
    return true;
  });

  const pendingAppointments = appointments.filter(a => a.status === 'Pending');
  const pendingMedicines = medicineOrders.filter(m => m.status === 'Pending');
  const pendingVisits = homeVisits.filter(v => v.status === 'Pending');
  const pendingLabBookings = labBookings.filter(l => l.status === 'Pending' || l.status === 'Confirmed');

  const filteredAppointments = appointments.filter(a => {
    if (appointmentFilter === 'pending') return a.status === 'Pending';
    if (appointmentFilter === 'confirmed') return a.status === 'Confirmed' || a.status === 'Completed';
    if (appointmentFilter === 'cancelled') return a.status === 'Cancelled';
    return true;
  });

  const filteredDoctors = doctors.filter(d => 
    d.name.toLowerCase().includes(searchDoctor.toLowerCase()) ||
    d.specialty.toLowerCase().includes(searchDoctor.toLowerCase()) ||
    d.hospital.toLowerCase().includes(searchDoctor.toLowerCase())
  );

  // Lab Orders Filtering (Global for Hospital Admin)
  const filteredLabBookings = labBookings.filter(b => {
    if (labOrderFilter === 'pending' && b.status !== 'Pending') return false;
    if (labOrderFilter === 'confirmed' && b.status !== 'Confirmed') return false;
    if (labOrderFilter === 'sample_collected' && b.status !== 'Sample Collected') return false;
    if (labOrderFilter === 'report_generated' && b.status !== 'Report Generated') return false;
    if (labOrderFilter === 'completed' && b.status !== 'Completed') return false;
    if (labOrderFilter === 'cancelled' && b.status !== 'Cancelled') return false;

    if (searchLabOrder.trim()) {
      const q = searchLabOrder.toLowerCase();
      const matchName = b.patientName.toLowerCase().includes(q);
      const matchPhone = b.patientPhone.includes(q);
      const matchTest = b.testName.toLowerCase().includes(q);
      const matchAddress = b.address?.toLowerCase().includes(q) || false;
      if (!matchName && !matchPhone && !matchTest && !matchAddress) return false;
    }
    return true;
  });

  // Lab Tests Filtering
  const labCategories = ['All', ...Array.from(new Set(labTests.map(t => t.category)))];
  const filteredLabTestsList = labTests.filter(t => {
    if (labCategoryFilter !== 'All' && t.category.toLowerCase() !== labCategoryFilter.toLowerCase()) {
      return false;
    }
    if (searchLabTest.trim()) {
      const q = searchLabTest.toLowerCase();
      const matchName = t.name.toLowerCase().includes(q);
      const matchCat = t.category.toLowerCase().includes(q);
      const matchDesc = t.description.toLowerCase().includes(q);
      if (!matchName && !matchCat && !matchDesc) return false;
    }
    return true;
  });

  // Doctor map
  const doctorMap = new Map<string, Doctor>();
  doctors.forEach(d => doctorMap.set(d.id, d));

  // Dynamic token adjustment
  const handleTokenChange = (aptId: string, delta: number, currentVal: number) => {
    const existing = customTokens[aptId] !== undefined ? customTokens[aptId] : currentVal;
    const nextVal = Math.max(1, existing + delta);
    setCustomTokens(prev => ({ ...prev, [aptId]: nextVal }));
  };

  const handleCustomTokenInput = (aptId: string, val: string) => {
    const num = parseInt(val, 10);
    if (!isNaN(num) && num > 0) {
      setCustomTokens(prev => ({ ...prev, [aptId]: num }));
    }
  };

  // Manual token confirmation
  const handleConfirmWithToken = async (apt: Appointment) => {
    const tokenToAssign = customTokens[apt.id] !== undefined ? customTokens[apt.id] : apt.tokenNumber;
    await realtimeDb.confirmAppointment(apt.id, tokenToAssign);
  };

  const handleCancel = async (id: string) => {
    await realtimeDb.cancelAppointment(id);
  };

  // Medicine Order Status
  const handleUpdateMedicineStatus = async (id: string, status: MedicineOrder['status']) => {
    await realtimeDb.updateMedicineOrderStatus(id, status);
  };

  // Home Visit Status & Doctor Assignment
  const handleAssignDoctorToVisit = async (visitId: string, doctorName: string) => {
    setAssignedDoctors(prev => ({ ...prev, [visitId]: doctorName }));
    await realtimeDb.updateHomeVisitStatus(visitId, 'Assigned', doctorName);
  };

  const handleUpdateVisitStatus = async (visitId: string, status: HomeVisitBooking['status']) => {
    await realtimeDb.updateHomeVisitStatus(visitId, status);
  };

  // Doctor Management
  const handleDeleteDoctor = async (doctorId: string, doctorName: string) => {
    if (window.confirm(`Are you sure you want to remove ${doctorName} from the hospital registry?`)) {
      await realtimeDb.deleteDoctor(doctorId);
    }
  };

  const handleSaveDoctor = async (data: Omit<Doctor, 'id' | 'currentToken' | 'totalTokensToday'>) => {
    if (doctorToEdit) {
      await realtimeDb.updateDoctor(doctorToEdit.id, data);
    } else {
      await realtimeDb.addDoctor(data);
    }
    setIsDoctorModalOpen(false);
    setDoctorToEdit(null);
  };

  // Lab Test Catalog Handlers
  const handleSaveLabTest = async (data: Omit<LabTest, 'id'>) => {
    if (testToEdit) {
      await realtimeDb.updateLabTest(testToEdit.id, data);
    } else {
      await realtimeDb.addLabTest(data);
    }
    setIsLabTestModalOpen(false);
    setTestToEdit(null);
  };

  const handleDeleteLabTest = async (testId: string, testName: string) => {
    if (window.confirm(`Are you sure you want to remove lab test "${testName}" from the hospital catalog?`)) {
      await realtimeDb.deleteLabTest(testId);
    }
  };

  // Lab Booking Fulfillment Handler
  const handleUpdateLabBookingStatus = async (bookingId: string, status: LabBooking['status']) => {
    await realtimeDb.updateLabBookingStatus(bookingId, status);
  };

  // Pricing Save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      await realtimeDb.updateAppSettings(editingSettings);
      setSettingsSaveSuccess(true);
      setTimeout(() => setSettingsSaveSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to save settings', err);
    } finally {
      setIsSavingSettings(false);
    }
  };

  return (
    <div className="pb-32 pt-2 px-4 max-w-md mx-auto space-y-4">
      {/* Top Admin Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold tracking-wider text-sky-700 uppercase bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
            Hospital Command Center
          </span>
          <h2 className="text-xl font-black text-slate-900 mt-1">Super Admin Dashboard</h2>
          <p className="text-xs text-slate-500">Live Firebase OPD, Deliveries & Pricing</p>
        </div>
        <button
          onClick={onExit}
          className="text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
        >
          Exit Admin
        </button>
      </div>

      {/* SIREN / ALARM NOTIFICATION BANNER */}
      {hasActiveAlarm && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg border-2 border-red-400 animate-pulse space-y-3">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <BellRing className="w-6 h-6 animate-bounce" />
            </div>
            <div className="flex-1">
              <h3 className="font-black text-sm uppercase tracking-wide">
                🚨 Emergency Booking Siren Active!
              </h3>
              <p className="text-xs text-red-100 mt-0.5 leading-relaxed">
                {pendingAppointments.length} patient appointment{pendingAppointments.length > 1 ? 's are' : ' is'} awaiting manual confirmation. Audio siren is looping.
              </p>
            </div>
          </div>

          <button
            onClick={onAcknowledgeAlarm}
            className="w-full py-2.5 bg-white text-red-700 font-extrabold text-xs rounded-xl shadow-md hover:bg-red-50 flex items-center justify-center space-x-2 transition-transform active:scale-98 cursor-pointer"
          >
            <VolumeX className="w-4 h-4" />
            <span>I Acknowledge / Stop Alarm</span>
          </button>
        </div>
      )}

      {/* Admin Module Switcher Tabs (Scrollable) */}
      <div className="flex space-x-1.5 overflow-x-auto no-scrollbar pb-1 text-xs font-bold">
        <button
          onClick={() => setActiveSubTab('verification')}
          className={`px-3 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
            activeSubTab === 'verification'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <CalendarCheck className="w-3.5 h-3.5" />
          <span>Confirm OPD</span>
          {pendingAppointments.length > 0 && (
            <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black ml-1">
              {pendingAppointments.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('medicines')}
          className={`px-3 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
            activeSubTab === 'medicines'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Truck className="w-3.5 h-3.5" />
          <span>Medicines</span>
          {pendingMedicines.length > 0 && (
            <span className="bg-emerald-800 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black ml-1">
              {pendingMedicines.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('home_visits')}
          className={`px-3 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
            activeSubTab === 'home_visits'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Home className="w-3.5 h-3.5" />
          <span>Home Visits</span>
          {pendingVisits.length > 0 && (
            <span className="bg-indigo-800 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black ml-1">
              {pendingVisits.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('lab_orders')}
          className={`px-3 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
            activeSubTab === 'lab_orders'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <ClipboardList className="w-3.5 h-3.5" />
          <span>Lab Orders</span>
          {pendingLabBookings.length > 0 && (
            <span className="bg-teal-900 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black ml-1">
              {pendingLabBookings.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('lab_tests')}
          className={`px-3 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
            activeSubTab === 'lab_tests'
              ? 'bg-cyan-700 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <FlaskConical className="w-3.5 h-3.5" />
          <span>Lab Tests</span>
          <span className="bg-cyan-900 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black ml-1">
            {labTests.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('feedbacks')}
          className={`px-3 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
            activeSubTab === 'feedbacks'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Star className="w-3.5 h-3.5 fill-current" />
          <span>Patient Feedbacks</span>
          {newFeedbacksCount > 0 && (
            <span className="bg-amber-800 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black ml-1">
              {newFeedbacksCount} New
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('pricing')}
          className={`px-3 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
            activeSubTab === 'pricing'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>Pricing</span>
        </button>

        <button
          onClick={() => setActiveSubTab('doctors')}
          className={`px-3 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
            activeSubTab === 'doctors'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Stethoscope className="w-3.5 h-3.5" />
          <span>Doctors</span>
        </button>

        <button
          onClick={() => setActiveSubTab('financial')}
          className={`px-3 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
            activeSubTab === 'financial'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Finance</span>
        </button>
      </div>

      {/* SUBTAB 1: MANUAL OPD VERIFICATION & DYNAMIC TOKEN ASSIGNMENT */}
      {activeSubTab === 'verification' && (
        <div className="space-y-4">
          {/* Status Filter Tabs */}
          <div className="flex space-x-1 bg-slate-200/60 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setAppointmentFilter('pending')}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                appointmentFilter === 'pending'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pending ({pendingAppointments.length})
            </button>
            <button
              onClick={() => setAppointmentFilter('confirmed')}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                appointmentFilter === 'confirmed'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Confirmed
            </button>
            <button
              onClick={() => setAppointmentFilter('cancelled')}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                appointmentFilter === 'cancelled'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cancelled
            </button>
            <button
              onClick={() => setAppointmentFilter('all')}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                appointmentFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({appointments.length})
            </button>
          </div>

          {/* Info Card */}
          <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl text-xs text-sky-900 flex items-start space-x-2">
            <ShieldAlert className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Dynamic Token Assignment Mandate: </span>
              <span className="text-[11px] text-sky-800">
                You can manually adjust the token number before confirming. When you click &quot;Confirm & Issue Token&quot;, the patient receives that exact token instantly.
              </span>
            </div>
          </div>

          {/* List of Appointments */}
          <div className="space-y-3">
            {filteredAppointments.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
                <CalendarCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="font-bold text-slate-700 text-sm">No appointments in this category</p>
              </div>
            ) : (
              filteredAppointments.map((apt) => {
                const assignedDoctor = doctorMap.get(apt.doctorId);
                const currentDocLiveToken = assignedDoctor ? assignedDoctor.currentToken : 1;
                const tokenToDisplay = customTokens[apt.id] !== undefined ? customTokens[apt.id] : apt.tokenNumber;

                return (
                  <div
                    key={apt.id}
                    className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            apt.status === 'Confirmed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : apt.status === 'Pending'
                              ? 'bg-amber-100 text-amber-800 animate-pulse'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {apt.status}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            ID: {apt.id.slice(-6)}
                          </span>
                        </div>
                        <h4 className="font-extrabold text-sm text-slate-900 mt-1">
                          {apt.patientName} ({apt.patientAge}y, {apt.patientGender})
                        </h4>
                        <p className="text-xs text-slate-500 font-medium">
                          Mobile: {apt.patientPhone}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-black text-slate-900">
                          ₹{apt.consultationFee}
                        </span>
                        <span className="text-[10px] text-slate-400 block">OPD Fee</span>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-xl text-xs text-slate-600 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Doctor & Room:</span>
                        <span className="font-bold text-slate-800">{apt.doctorName} (Room {apt.roomNumber})</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Doctor Current Live Token:</span>
                        <span className="font-extrabold text-emerald-700">#{currentDocLiveToken}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Slot / Date:</span>
                        <span className="font-medium text-slate-700">{apt.bookingDate} ({apt.timeSlot})</span>
                      </div>
                      {apt.symptomBrief && (
                        <div className="pt-1 border-t border-slate-200/60 text-[11px]">
                          <span className="text-slate-500 font-semibold">Symptoms: </span>
                          <span>{apt.symptomBrief}</span>
                        </div>
                      )}
                    </div>

                    {/* DYNAMIC TOKEN ASSIGNMENT CONTROLLER (For Pending Bookings) */}
                    {apt.status === 'Pending' && (
                      <div className="p-3 bg-sky-50/70 border border-sky-200 rounded-xl space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-sky-900">Assign Token Number:</span>
                          <span className="text-[11px] text-sky-700">Doctor at #{currentDocLiveToken}</span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => handleTokenChange(apt.id, -1, apt.tokenNumber)}
                            className="w-9 h-9 bg-white border border-sky-300 rounded-lg text-base font-black text-sky-800 hover:bg-sky-100 flex items-center justify-center cursor-pointer shadow-2xs"
                          >
                            -
                          </button>

                          <input
                            type="number"
                            min="1"
                            value={tokenToDisplay}
                            onChange={(e) => handleCustomTokenInput(apt.id, e.target.value)}
                            className="flex-1 text-center font-black text-lg py-1.5 bg-white border border-sky-300 rounded-lg text-sky-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                          />

                          <button
                            type="button"
                            onClick={() => handleTokenChange(apt.id, 1, apt.tokenNumber)}
                            className="w-9 h-9 bg-white border border-sky-300 rounded-lg text-base font-black text-sky-800 hover:bg-sky-100 flex items-center justify-center cursor-pointer shadow-2xs"
                          >
                            +
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <button
                            onClick={() => handleConfirmWithToken(apt)}
                            className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Confirm Token #{tokenToDisplay}</span>
                          </button>

                          <button
                            onClick={() => handleCancel(apt.id)}
                            className="py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Cancel</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* For already confirmed: Display assigned token with option to cancel or mark completed */}
                    {apt.status === 'Confirmed' && (
                      <div className="flex items-center justify-between pt-1 text-xs">
                        <span className="font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                          Active Token: #{apt.tokenNumber}
                        </span>
                        <div className="space-x-1.5">
                          <button
                            onClick={() => handleCancel(apt.id)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-50 rounded-lg border border-rose-200 cursor-pointer"
                          >
                            Cancel Slot
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 2: MEDICINE ORDERS MANAGEMENT */}
      {activeSubTab === 'medicines' && (
        <div className="space-y-4">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start space-x-2">
            <Truck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Medicine Home Delivery Orders: </span>
              <span className="text-[11px] text-emerald-800">
                Verify prescription images and dispatch medicines to patient addresses. Updates sync in real-time.
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {medicineOrders.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
                <Truck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="font-bold text-slate-700 text-sm">No medicine orders yet</p>
              </div>
            ) : (
              medicineOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                        order.status === 'Delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.status === 'Out for Delivery'
                          ? 'bg-blue-100 text-blue-800 animate-pulse'
                          : order.status === 'Processing'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-200 text-slate-800'
                      }`}>
                        {order.status}
                      </span>
                      <h4 className="font-extrabold text-sm text-slate-900 mt-1">
                        {order.patientName}
                      </h4>
                      <p className="text-xs text-slate-500">Phone: {order.patientPhone}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-black text-emerald-700">₹{order.deliveryFee}</span>
                      <span className="text-[10px] text-slate-400 block">Delivery Fee</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl text-xs space-y-1">
                    <p className="text-slate-700"><span className="font-bold">Address:</span> {order.address}</p>
                    <p className="text-slate-800"><span className="font-bold">Medicines:</span> {order.medicinesList}</p>
                  </div>

                  {order.prescriptionImage && (
                    <div className="flex items-center justify-between p-2 bg-emerald-50 rounded-xl border border-emerald-100 text-xs">
                      <div className="flex items-center space-x-2">
                        <img
                          src={order.prescriptionImage}
                          alt="Prescription"
                          className="w-10 h-10 object-cover rounded-lg border border-emerald-200"
                        />
                        <span className="font-bold text-emerald-900">Doctor Prescription Attached</span>
                      </div>
                      <button
                        onClick={() => setPreviewPrescription(order.prescriptionImage || null)}
                        className="px-2.5 py-1 bg-white border border-emerald-200 text-emerald-800 font-bold rounded-lg text-xs hover:bg-emerald-100 cursor-pointer"
                      >
                        Zoom View
                      </button>
                    </div>
                  )}

                  {/* Status update buttons */}
                  <div className="pt-1 flex flex-wrap gap-1.5 text-xs">
                    {(['Pending', 'Processing', 'Out for Delivery', 'Delivered', 'Cancelled'] as MedicineOrder['status'][]).map(st => (
                      <button
                        key={st}
                        onClick={() => handleUpdateMedicineStatus(order.id, st)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${
                          order.status === st
                            ? 'bg-slate-900 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 3: DOCTOR HOME VISITS MANAGEMENT */}
      {activeSubTab === 'home_visits' && (
        <div className="space-y-4">
          <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-900 flex items-start space-x-2">
            <Home className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Home Doctor Consultation Visits: </span>
              <span className="text-[11px] text-indigo-800">
                Review home visit requests, assign verified doctors, and schedule doorstep care.
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {homeVisits.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
                <Home className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="font-bold text-slate-700 text-sm">No home visit requests yet</p>
              </div>
            ) : (
              homeVisits.map((visit) => (
                <div
                  key={visit.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                        visit.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : visit.status === 'Assigned'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {visit.status}
                      </span>
                      <h4 className="font-extrabold text-sm text-slate-900 mt-1">
                        {visit.patientName}
                      </h4>
                      <p className="text-xs text-slate-500">Phone: {visit.patientPhone}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-black text-indigo-700">₹{visit.visitFee}</span>
                      <span className="text-[10px] text-slate-400 block">Visit Fee</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl text-xs space-y-1">
                    <p className="text-slate-700"><span className="font-bold">Address:</span> {visit.address}</p>
                    <p className="text-slate-700"><span className="font-bold">Specialty Requested:</span> {visit.specialtyRequired}</p>
                    <p className="text-slate-700"><span className="font-bold">Preferred Slot:</span> {visit.preferredDate} ({visit.preferredTime})</p>
                    {visit.symptomBrief && (
                      <p className="text-slate-700"><span className="font-bold">Symptoms:</span> {visit.symptomBrief}</p>
                    )}
                  </div>

                  {/* Doctor Assignment Dropdown */}
                  <div className="p-2.5 bg-indigo-50/70 border border-indigo-100 rounded-xl space-y-1.5 text-xs">
                    <label className="font-bold text-indigo-950 block">Assign Specialist Doctor:</label>
                    <div className="flex space-x-2">
                      <select
                        value={assignedDoctors[visit.id] || visit.assignedDoctorName || ''}
                        onChange={(e) => handleAssignDoctorToVisit(visit.id, e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-white border border-indigo-200 rounded-lg text-xs font-semibold focus:outline-none"
                      >
                        <option value="">Select Doctor...</option>
                        {doctors.map(d => (
                          <option key={d.id} value={d.name}>{d.name} ({d.specialty})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Status Buttons */}
                  <div className="flex flex-wrap gap-1.5 text-xs">
                    {(['Pending', 'Assigned', 'Completed', 'Cancelled'] as HomeVisitBooking['status'][]).map(st => (
                      <button
                        key={st}
                        onClick={() => handleUpdateVisitStatus(visit.id, st)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${
                          visit.status === st
                            ? 'bg-indigo-900 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SUBTAB: LAB TEST ORDERS FULFILLMENT (Prompt 2) */}
      {activeSubTab === 'lab_orders' && (
        <div className="space-y-4">
          {/* Header Banner */}
          <div className="p-3 bg-teal-800 text-white rounded-2xl flex items-start justify-between shadow-md">
            <div className="flex items-start space-x-2.5">
              <ClipboardList className="w-5 h-5 text-teal-300 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-black text-xs uppercase tracking-wider">Hospital Lab Test Orders</h4>
                <p className="text-[11px] text-teal-100 mt-0.5">
                  Live patient diagnostic bookings across the hospital. Manage sample collections and report status.
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] uppercase font-bold text-teal-200 block">Total Revenue</span>
              <span className="text-sm font-black text-white">
                ₹{labBookings.filter(b => b.status !== 'Cancelled').reduce((sum, b) => sum + (b.price || 0), 0).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search by patient name, phone, or test name..."
                value={searchLabOrder}
                onChange={(e) => setSearchLabOrder(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
              {searchLabOrder && (
                <button
                  onClick={() => setSearchLabOrder('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Status Filter Tabs (Scrollable) */}
            <div className="flex space-x-1.5 overflow-x-auto no-scrollbar pb-1 text-[11px] font-bold">
              {[
                { key: 'all', label: 'All', count: labBookings.length },
                { key: 'pending', label: 'Pending', count: labBookings.filter(b => b.status === 'Pending').length },
                { key: 'confirmed', label: 'Confirmed', count: labBookings.filter(b => b.status === 'Confirmed').length },
                { key: 'sample_collected', label: 'Sample Collected', count: labBookings.filter(b => b.status === 'Sample Collected').length },
                { key: 'report_generated', label: 'Report Generated', count: labBookings.filter(b => b.status === 'Report Generated').length },
                { key: 'completed', label: 'Completed', count: labBookings.filter(b => b.status === 'Completed').length },
                { key: 'cancelled', label: 'Cancelled', count: labBookings.filter(b => b.status === 'Cancelled').length }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setLabOrderFilter(tab.key as any)}
                  className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                    labOrderFilter === tab.key
                      ? 'bg-teal-700 text-white shadow-2xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
          </div>

          {/* Orders List */}
          <div className="space-y-3">
            {filteredLabBookings.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
                <ClipboardList className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="font-bold text-slate-700 text-sm">No lab test orders found</p>
                <p className="text-xs text-slate-400 mt-1">
                  {searchLabOrder ? 'Try changing your search query' : 'When patients book lab tests, they will appear here'}
                </p>
              </div>
            ) : (
              filteredLabBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs space-y-3"
                >
                  {/* Order Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${
                          booking.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : booking.status === 'Report Generated'
                            ? 'bg-teal-100 text-teal-800 border-teal-300'
                            : booking.status === 'Sample Collected'
                            ? 'bg-indigo-100 text-indigo-800 border-indigo-300'
                            : booking.status === 'Confirmed'
                            ? 'bg-sky-100 text-sky-800 border-sky-300'
                            : booking.status === 'Pending'
                            ? 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse'
                            : 'bg-slate-100 text-slate-700 border-slate-300'
                        }`}>
                          {booking.status}
                        </span>

                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 border border-teal-200">
                          {booking.category}
                        </span>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center space-x-1 ${
                          booking.bookingType === 'Home Sample Collection'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          {booking.bookingType === 'Home Sample Collection' ? (
                            <>
                              <Home className="w-3 h-3" />
                              <span>Home Sample</span>
                            </>
                          ) : (
                            <>
                              <FlaskConical className="w-3 h-3" />
                              <span>Lab Visit</span>
                            </>
                          )}
                        </span>
                      </div>

                      <h4 className="font-extrabold text-sm text-slate-900 mt-1.5">
                        {booking.testName}
                      </h4>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-sm font-black text-teal-700">₹{booking.price}</span>
                      <span className="text-[10px] text-slate-400 block">Total Fee</span>
                    </div>
                  </div>

                  {/* Patient & Booking Details */}
                  <div className="bg-slate-50 p-2.5 rounded-xl text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 text-xs">{booking.patientName}</span>
                      <a
                        href={`tel:${booking.patientPhone}`}
                        className="inline-flex items-center space-x-1 text-teal-700 font-bold bg-teal-50 hover:bg-teal-100 px-2 py-0.5 rounded-md border border-teal-200 transition-colors"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{booking.patientPhone}</span>
                      </a>
                    </div>

                    <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-600">
                      <div>
                        <span className="font-bold text-slate-700">Scheduled Date:</span> {booking.date}
                      </div>
                      <div>
                        <span className="font-bold text-slate-700">Time Slot:</span> {booking.timeSlot}
                      </div>
                    </div>

                    {booking.address && (
                      <p className="text-[11px] text-slate-700 flex items-start space-x-1 pt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span><span className="font-bold">Collection Address:</span> {booking.address}</span>
                      </p>
                    )}

                    {booking.bookedAt && (
                      <p className="text-[10px] text-slate-400">
                        Booked: {new Date(booking.bookedAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>

                  {/* Order Fulfillment Status Controls (Prompt 2) */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-700 block">
                      Update Order Fulfillment Status:
                    </label>
                    <div className="flex flex-wrap gap-1 text-xs">
                      {(['Pending', 'Confirmed', 'Sample Collected', 'Report Generated', 'Completed', 'Cancelled'] as LabBooking['status'][]).map((st) => (
                        <button
                          key={st}
                          onClick={() => handleUpdateLabBookingStatus(booking.id, st)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${
                            booking.status === st
                              ? 'bg-teal-800 text-white shadow-2xs ring-1 ring-teal-900'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SUBTAB: LAB TESTS CATALOG MANAGEMENT (Prompt 1) */}
      {activeSubTab === 'lab_tests' && (
        <div className="space-y-4">
          {/* Header Banner & Add Button */}
          <div className="p-3 bg-cyan-900 text-white rounded-2xl flex items-center justify-between shadow-md">
            <div className="flex items-start space-x-2.5">
              <FlaskConical className="w-5 h-5 text-cyan-300 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-black text-xs uppercase tracking-wider">Diagnostic Lab Tests Catalog</h4>
                <p className="text-[11px] text-cyan-100 mt-0.5">
                  Full control over prices, preparation guidelines, and sample requirements.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setTestToEdit(null);
                setIsLabTestModalOpen(true);
              }}
              className="px-3 py-2 bg-white text-cyan-950 font-black rounded-xl text-xs hover:bg-cyan-50 transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer shrink-0 ml-2"
            >
              <PlusCircle className="w-4 h-4 text-cyan-700" />
              <span>Add New Test</span>
            </button>
          </div>

          {/* Search and Category Filter */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search lab test name, parameters, or category..."
                value={searchLabTest}
                onChange={(e) => setSearchLabTest(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
              />
              {searchLabTest && (
                <button
                  onClick={() => setSearchLabTest('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category Chips */}
            <div className="flex space-x-1.5 overflow-x-auto no-scrollbar pb-1 text-[11px] font-bold">
              {labCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setLabCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                    labCategoryFilter === cat
                      ? 'bg-cyan-800 text-white shadow-2xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Catalog Count */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-1 font-semibold">
            <span>Showing {filteredLabTestsList.length} of {labTests.length} tests</span>
            <span className="text-teal-700">Syncs live to patient booking view</span>
          </div>

          {/* Catalog List */}
          <div className="space-y-3">
            {filteredLabTestsList.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
                <FlaskConical className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="font-bold text-slate-700 text-sm">No lab tests match your filter</p>
                <p className="text-xs text-slate-400 mt-1">Click &quot;Add New Test&quot; above to create a test.</p>
              </div>
            ) : (
              filteredLabTestsList.map((test) => (
                <div
                  key={test.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs space-y-3"
                >
                  {/* Test Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-cyan-50 text-cyan-800 border border-cyan-200">
                          {test.category}
                        </span>
                        {test.popular && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 flex items-center space-x-1">
                            <Sparkles className="w-2.5 h-2.5" />
                            <span>Popular Test</span>
                          </span>
                        )}
                      </div>

                      <h4 className="font-extrabold text-sm text-slate-900 mt-1.5">
                        {test.name}
                      </h4>
                    </div>

                    {/* Actions: Edit & Delete */}
                    <div className="flex items-center space-x-1.5 shrink-0 ml-2">
                      <button
                        onClick={() => {
                          setTestToEdit(test);
                          setIsLabTestModalOpen(true);
                        }}
                        className="p-1.5 bg-slate-100 hover:bg-cyan-50 text-slate-700 hover:text-cyan-800 rounded-lg transition-colors cursor-pointer"
                        title="Edit lab test details"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteLabTest(test.id, test.name)}
                        className="p-1.5 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                        title="Delete lab test"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Pricing Display */}
                  <div className="flex items-baseline space-x-2 pt-0.5">
                    <span className="text-base font-black text-cyan-800">₹{test.price}</span>
                    {test.originalPrice && test.originalPrice > test.price && (
                      <>
                        <span className="text-xs text-slate-400 line-through">₹{test.originalPrice}</span>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded">
                          {Math.round(((test.originalPrice - test.price) / test.originalPrice) * 100)}% OFF
                        </span>
                      </>
                    )}
                  </div>

                  {/* Preparation Details & Specs (Prompt 1) */}
                  <div className="bg-slate-50 p-2.5 rounded-xl text-[11px] space-y-1.5 border border-slate-100">
                    <div className="flex flex-wrap gap-1.5">
                      <span className={`px-2 py-0.5 rounded-md font-bold ${
                        test.fastingRequired
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}>
                        {test.fastingRequired ? '10-12 hrs Fasting Required' : 'No Fasting Needed'}
                      </span>

                      {test.sampleType && (
                        <span className="px-2 py-0.5 rounded-md font-bold bg-slate-200/80 text-slate-700">
                          Sample: {test.sampleType}
                        </span>
                      )}

                      {test.reportTime && (
                        <span className="px-2 py-0.5 rounded-md font-bold bg-blue-100 text-blue-800 border border-blue-200">
                          Report: {test.reportTime}
                        </span>
                      )}
                    </div>

                    {test.description && (
                      <p className="text-slate-600 text-xs leading-relaxed pt-1">
                        {test.description}
                      </p>
                    )}
                  </div>

                  {/* Quick Edit Button */}
                  <button
                    onClick={() => {
                      setTestToEdit(test);
                      setIsLabTestModalOpen(true);
                    }}
                    className="w-full py-1.5 text-xs font-bold text-cyan-800 bg-cyan-50 hover:bg-cyan-100 rounded-xl transition-colors cursor-pointer flex items-center justify-center space-x-1"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit Test Name, Price & Preparation</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SUBTAB: PATIENT CARE FEEDBACKS & REVIEWS */}
      {activeSubTab === 'feedbacks' && (
        <div className="space-y-4">
          {/* Header Card with Ratings Overview */}
          <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-white rounded-3xl p-5 shadow-lg relative overflow-hidden space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-amber-200 fill-current" />
                <h3 className="font-black text-sm uppercase tracking-wide">Patient Satisfaction & Ratings</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-white/20 text-white border border-white/30">
                {totalFeedbacksCount} Reviews
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-white/15 backdrop-blur-xs p-3 rounded-2xl border border-white/20">
                <span className="text-[10px] text-amber-100 font-bold uppercase block">Overall Patient Score</span>
                <div className="flex items-baseline space-x-1.5 mt-0.5">
                  <span className="text-2xl font-black text-white">{avgOverallRating}</span>
                  <span className="text-xs text-amber-200 font-bold">/ 5.0</span>
                </div>
                <div className="flex items-center space-x-0.5 mt-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3.5 h-3.5 ${
                        s <= Math.round(Number(avgOverallRating))
                          ? 'text-amber-200 fill-current'
                          : 'text-amber-300/40'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="bg-white/15 backdrop-blur-xs p-3 rounded-2xl border border-white/20 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-amber-100">Doctor Care:</span>
                  <span className="font-extrabold text-white">{avgDoctorRating} ★</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-100">Wait Time:</span>
                  <span className="font-extrabold text-white">{avgWaitRating} ★</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-100">Staff Behavior:</span>
                  <span className="font-extrabold text-white">{avgStaffRating} ★</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-100">Cleanliness:</span>
                  <span className="font-extrabold text-white">{avgCleanRating} ★</span>
                </div>
              </div>
            </div>

            {newFeedbacksCount > 0 && (
              <div className="p-2.5 bg-amber-900/40 rounded-xl border border-amber-300/30 flex items-center justify-between text-xs">
                <span className="font-bold text-amber-100">
                  🔔 {newFeedbacksCount} feedback review{newFeedbacksCount > 1 ? 's require' : ' requires'} administrator review
                </span>
                <button
                  onClick={() => setFeedbackStatusFilter('New')}
                  className="px-2 py-0.5 bg-white text-amber-900 font-extrabold text-[10px] rounded-lg shadow-xs hover:bg-amber-50 cursor-pointer"
                >
                  View New
                </button>
              </div>
            )}
          </div>

          {/* Status Filters */}
          <div className="flex space-x-1 bg-slate-200/60 p-1 rounded-xl text-xs font-bold">
            {(['all', 'New', 'Reviewed', 'Action Taken'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFeedbackStatusFilter(st)}
                className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer capitalize text-center ${
                  feedbackStatusFilter === st
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st === 'all' ? 'All Reviews' : st}
                {st === 'New' && newFeedbacksCount > 0 && (
                  <span className="ml-1 px-1 py-0.2 bg-rose-500 text-white text-[9px] rounded-full">
                    {newFeedbacksCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search and Service Filter */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchFeedback}
                onChange={(e) => setSearchFeedback(e.target.value)}
                placeholder="Search by patient, phone, doctor or comments..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div className="flex items-center space-x-1 overflow-x-auto pb-1 text-[11px] font-bold">
              {[
                { id: 'all', label: 'All Services' },
                { id: 'OPD Consultation', label: 'OPD' },
                { id: 'Doctor Home Visit', label: 'Home Visit' },
                { id: 'Diagnostic Lab Test', label: 'Lab Test' },
                { id: 'Medicine Delivery', label: 'Medicines' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setFeedbackServiceFilter(s.id)}
                  className={`px-2.5 py-1 rounded-lg shrink-0 transition-colors cursor-pointer ${
                    feedbackServiceFilter === s.id
                      ? 'bg-amber-600 text-white font-black'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Feedbacks List */}
          <div className="space-y-3">
            {filteredFeedbacks.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 shadow-xs">
                <Star className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <h3 className="font-extrabold text-slate-800 text-sm">No Patient Feedbacks Found</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  {searchFeedback || feedbackStatusFilter !== 'all' || feedbackServiceFilter !== 'all'
                    ? 'No reviews match your current filters. Try resetting the filters.'
                    : 'Patient reviews submitted after hospital visits will appear here in real-time.'}
                </p>
              </div>
            ) : (
              filteredFeedbacks.map((fb) => (
                <div
                  key={fb.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 space-y-3"
                >
                  {/* Card Header: Patient info + Service Badge */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                          {fb.serviceType}
                        </span>
                        {fb.tokenNumber && (
                          <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
                            Token #{fb.tokenNumber}
                          </span>
                        )}
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                          fb.adminStatus === 'New'
                            ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                            : fb.adminStatus === 'Reviewed'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {fb.adminStatus}
                        </span>
                      </div>

                      <h4 className="font-black text-sm text-slate-900 mt-1">
                        {fb.patientName}
                      </h4>
                      <a
                        href={`tel:${fb.patientPhone}`}
                        className="text-xs font-bold text-sky-600 hover:underline flex items-center space-x-1 mt-0.5"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{fb.patientPhone}</span>
                      </a>
                    </div>

                    {/* Overall Rating Badge */}
                    <div className="text-right">
                      <div className="inline-flex items-center space-x-1 px-2.5 py-1 bg-amber-500 text-white rounded-xl shadow-xs font-black text-sm">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{fb.rating}.0</span>
                      </div>
                      <span className="block text-[10px] text-slate-400 mt-0.5 font-medium">
                        {new Date(fb.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Doctor Name if available */}
                  {fb.doctorName && (
                    <div className="p-2 bg-slate-50 rounded-xl flex items-center space-x-2 text-xs">
                      <Stethoscope className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="text-slate-600">Doctor Consulted:</span>
                      <strong className="text-slate-900 font-extrabold">{fb.doctorName}</strong>
                    </div>
                  )}

                  {/* Detailed Star Ratings */}
                  <div className="grid grid-cols-2 gap-1.5 p-2.5 bg-slate-50 rounded-xl text-[11px]">
                    {fb.doctorRating && (
                      <div className="flex justify-between items-center text-slate-600">
                        <span>Doctor Treatment:</span>
                        <span className="font-extrabold text-amber-700">{fb.doctorRating} ★</span>
                      </div>
                    )}
                    {fb.waitingTimeRating && (
                      <div className="flex justify-between items-center text-slate-600">
                        <span>OPD Wait Time:</span>
                        <span className="font-extrabold text-amber-700">{fb.waitingTimeRating} ★</span>
                      </div>
                    )}
                    {fb.staffRating && (
                      <div className="flex justify-between items-center text-slate-600">
                        <span>Staff Behavior:</span>
                        <span className="font-extrabold text-amber-700">{fb.staffRating} ★</span>
                      </div>
                    )}
                    {fb.cleanlinessRating && (
                      <div className="flex justify-between items-center text-slate-600">
                        <span>Hospital Hygiene:</span>
                        <span className="font-extrabold text-amber-700">{fb.cleanlinessRating} ★</span>
                      </div>
                    )}
                  </div>

                  {/* Patient Comments */}
                  <div className="p-3 bg-amber-50/70 border border-amber-200/70 rounded-xl space-y-1">
                    <div className="flex items-center space-x-1 text-amber-800 text-[10px] font-bold uppercase tracking-wider">
                      <MessageSquare className="w-3 h-3" />
                      <span>Patient Comments</span>
                    </div>
                    <p className="text-xs text-slate-800 font-medium leading-relaxed italic">
                      "{fb.comments}"
                    </p>
                  </div>

                  {/* Admin Notes if present */}
                  {fb.adminNotes && (
                    <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-xs space-y-0.5">
                      <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">
                        Clinic Admin Notes:
                      </span>
                      <p className="text-blue-950 font-medium">{fb.adminNotes}</p>
                    </div>
                  )}

                  {/* Admin Action Controls */}
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        disabled={savingFeedbackId === fb.id}
                        onClick={async () => {
                          const note = adminNoteInput[fb.id] || fb.adminNotes;
                          await realtimeDb.updateFeedbackAdminStatus(fb.id, 'Reviewed', note);
                        }}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                          fb.adminStatus === 'Reviewed'
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-blue-700 border-blue-300 hover:bg-blue-50'
                        }`}
                      >
                        ✓ Mark Reviewed
                      </button>

                      <button
                        type="button"
                        disabled={savingFeedbackId === fb.id}
                        onClick={async () => {
                          const note = adminNoteInput[fb.id] || fb.adminNotes;
                          await realtimeDb.updateFeedbackAdminStatus(fb.id, 'Action Taken', note);
                        }}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                          fb.adminStatus === 'Action Taken'
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-50'
                        }`}
                      >
                        ✓ Action Taken
                      </button>
                    </div>

                    {/* Admin Note Input */}
                    <div className="flex items-center space-x-1.5">
                      <input
                        type="text"
                        value={adminNoteInput[fb.id] !== undefined ? adminNoteInput[fb.id] : (fb.adminNotes || '')}
                        onChange={(e) => setAdminNoteInput({ ...adminNoteInput, [fb.id]: e.target.value })}
                        placeholder="Add admin resolution / counselling note..."
                        className="flex-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-amber-500"
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          const note = adminNoteInput[fb.id] !== undefined ? adminNoteInput[fb.id] : (fb.adminNotes || '');
                          await realtimeDb.updateFeedbackAdminStatus(fb.id, fb.adminStatus, note);
                        }}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
                      >
                        Save Note
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      {activeSubTab === 'pricing' && (
        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div className="p-3 bg-slate-900 text-white rounded-2xl flex items-start space-x-2.5 shadow-md">
            <DollarSign className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-black text-xs uppercase tracking-wider">Dynamic Healthcare Pricing</h4>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Update fees and service charges. Changes immediately sync to patient bookings and Firestore in real-time.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs space-y-4 text-xs">
            <h4 className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-2">
              Service Delivery Fees
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Medicine Delivery Fee (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={editingSettings.medicineDeliveryFee}
                    onChange={(e) => setEditingSettings({
                      ...editingSettings,
                      medicineDeliveryFee: parseInt(e.target.value, 10) || 0
                    })}
                    className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Doctor Home Visit Fee (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={editingSettings.homeVisitFee}
                    onChange={(e) => setEditingSettings({
                      ...editingSettings,
                      homeVisitFee: parseInt(e.target.value, 10) || 0
                    })}
                    className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <label className="block font-bold text-slate-700 mb-1">
                Emergency Helpline Contact
              </label>
              <input
                type="text"
                value={editingSettings.emergencyHelpline}
                onChange={(e) => setEditingSettings({
                  ...editingSettings,
                  emergencyHelpline: e.target.value
                })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
          </div>

          {/* Quick Doctor Consultation Fee Editor */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="font-extrabold text-sm text-slate-900">
                Doctor Consultation Fees
              </h4>
              <span className="text-[11px] text-slate-500">Live Doctor OPD rates</span>
            </div>

            <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto pr-1">
              {doctors.map(doc => (
                <div key={doc.id} className="py-2 flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <span className="font-bold text-slate-800 block truncate">{doc.name}</span>
                    <span className="text-[10px] text-slate-500">{doc.specialty}</span>
                  </div>
                  <div className="flex items-center space-x-1 shrink-0">
                    <span className="text-xs font-bold text-slate-400">₹</span>
                    <input
                      type="number"
                      step="50"
                      min="0"
                      value={doc.consultationFee}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10) || 0;
                        realtimeDb.updateDoctor(doc.id, { consultationFee: val });
                      }}
                      className="w-20 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-right font-black text-xs focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            disabled={isSavingSettings}
            className="w-full py-3 bg-gradient-to-r from-slate-900 to-sky-900 text-white font-extrabold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            {settingsSaveSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Pricing Updated & Synced!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{isSavingSettings ? 'Saving...' : 'Save & Sync Pricing Changes'}</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* SUBTAB 5: DOCTORS DIRECTORY MANAGEMENT */}
      {activeSubTab === 'doctors' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Hospital Doctor Registry</h3>
              <p className="text-xs text-slate-500">{doctors.length} Registered OPD Specialists</p>
            </div>

            <button
              onClick={() => {
                setDoctorToEdit(null);
                setIsDoctorModalOpen(true);
              }}
              className="px-3.5 py-2 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Doctor</span>
            </button>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search doctor to edit or delete..."
              value={searchDoctor}
              onChange={(e) => setSearchDoctor(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            />
          </div>

          <div className="space-y-2.5">
            {filteredDoctors.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-2xs flex items-center justify-between"
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-xl shrink-0">
                    {doc.emoji || '👨‍⚕️'}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-xs text-slate-900 truncate">{doc.name}</h4>
                    <p className="text-[11px] text-sky-700 font-semibold truncate">{doc.specialty}</p>
                    <p className="text-[10px] text-slate-400">Room {doc.roomNumber} • Fee: ₹{doc.consultationFee}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-1 shrink-0">
                  <button
                    onClick={() => {
                      setDoctorToEdit(doc);
                      setIsDoctorModalOpen(true);
                    }}
                    className="p-1.5 text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
                    title="Edit Doctor Details"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteDoctor(doc.id, doc.name)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Remove Doctor"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 6: FINANCIAL ANALYTICS */}
      {activeSubTab === 'financial' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-5 text-white shadow-md relative overflow-hidden">
            <span className="text-[11px] font-bold tracking-wider text-emerald-400 uppercase block">
              Total Realized OPD & Service Revenue
            </span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-3xl font-black tracking-tight">
                ₹{financials.totalRevenue.toLocaleString()}
              </span>
              <span className="text-xs font-semibold text-emerald-300">
                ({financials.confirmedCount} Completed / Confirmed)
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-2">
              Dynamic hospital revenue synchronized in real-time across all OPD consultations and doorstep services.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs text-center">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Pending Verification</span>
              <span className="text-2xl font-black text-amber-600 block mt-0.5">
                {financials.pendingCount}
              </span>
              <span className="text-[10px] text-amber-600 font-semibold">Awaiting Tokens</span>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs text-center">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Cancelled Slots</span>
              <span className="text-2xl font-black text-rose-600 block mt-0.5">
                {financials.cancelledCount}
              </span>
              <span className="text-[10px] text-rose-600 font-semibold">Freed Capacity</span>
            </div>
          </div>

          {/* Revenue Breakdown by Doctor */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-sm text-slate-900">Revenue by Specialist</h4>
              <span className="text-xs text-slate-400 font-medium">Real-time breakdown</span>
            </div>

            <div className="divide-y divide-slate-100">
              {financials.doctorEarnings.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center">No confirmed consultations yet.</p>
              ) : (
                financials.doctorEarnings.map((docStat, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-800 block">{docStat.name}</span>
                      <span className="text-[11px] text-slate-400">{docStat.specialty} • {docStat.count} Patient{docStat.count > 1 ? 's' : ''}</span>
                    </div>
                    <div className="text-right font-extrabold text-slate-900">
                      ₹{docStat.revenue.toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Doctor Add / Edit Modal */}
      {isDoctorModalOpen && (
        <DoctorEditModal
          doctorToEdit={doctorToEdit}
          onClose={() => {
            setIsDoctorModalOpen(false);
            setDoctorToEdit(null);
          }}
          onSave={handleSaveDoctor}
        />
      )}

      {/* Lab Test Add / Edit Modal (Prompt 1) */}
      {isLabTestModalOpen && (
        <LabTestEditModal
          testToEdit={testToEdit}
          onClose={() => {
            setIsLabTestModalOpen(false);
            setTestToEdit(null);
          }}
          onSave={handleSaveLabTest}
        />
      )}

      {/* Prescription Zoom Modal */}
      {previewPrescription && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-4 max-w-sm w-full space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-sm text-slate-900">Patient Prescription Photo</h4>
              <button
                onClick={() => setPreviewPrescription(null)}
                className="p-1 text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <img
              src={previewPrescription}
              alt="Prescription"
              className="w-full max-h-[70vh] object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};
