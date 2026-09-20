import React, { useState, useEffect } from 'react';
import { Appointment, Doctor, LabBooking, MedicineOrder, HomeVisitBooking } from '../types';
import { 
  CalendarCheck, Clock, CheckCircle, AlertTriangle, XCircle, Stethoscope, 
  MapPin, User, Activity, FlaskConical, Search, Sparkles, Truck, Home,
  FileText, Phone, Eye, ShieldCheck, RefreshCw
} from 'lucide-react';
import { userAuth } from '../services/userAuth';

interface Props {
  appointments: Appointment[];
  doctors: Doctor[];
  labBookings: LabBooking[];
  medicineOrders?: MedicineOrder[];
  homeVisits?: HomeVisitBooking[];
  onNavigateToHome: () => void;
  currentUserPhone?: string;
  onUpdateUserPhone?: (phone: string) => void;
}

export const MyBookingsTab: React.FC<Props> = ({
  appointments,
  doctors,
  labBookings,
  medicineOrders = [],
  homeVisits = [],
  onNavigateToHome,
  currentUserPhone,
  onUpdateUserPhone
}) => {
  const [userPhone, setUserPhone] = useState<string>(() => currentUserPhone || userAuth.getUserPhone());
  const [userName, setUserName] = useState<string>(() => userAuth.getUserName());
  const [phoneInput, setPhoneInput] = useState<string>(currentUserPhone || userAuth.getUserPhone());
  const [isChangingPhone, setIsChangingPhone] = useState<boolean>(!currentUserPhone && !userAuth.getUserPhone());
  const [activeTab, setActiveTab] = useState<'opd' | 'medicines' | 'home_visits' | 'labs'>('opd');
  const [selectedPrescriptionPreview, setSelectedPrescriptionPreview] = useState<string | null>(null);

  // Sync with userAuth service or parent props
  useEffect(() => {
    if (currentUserPhone) {
      setUserPhone(currentUserPhone);
      setPhoneInput(currentUserPhone);
    }
  }, [currentUserPhone]);

  useEffect(() => {
    return userAuth.subscribeUser((state) => {
      setUserPhone(state.phone);
      setUserName(state.name);
      if (state.phone) {
        setPhoneInput(state.phone);
      }
    });
  }, []);

  const handleApplyPhone = (newPhone: string) => {
    const clean = newPhone.replace(/\D/g, '').slice(-10);
    if (clean.length === 10) {
      userAuth.setUserIdentity(clean);
      setUserPhone(clean);
      setPhoneInput(clean);
      setIsChangingPhone(false);
      onUpdateUserPhone?.(clean);
    }
  };

  const activePhone = userPhone || phoneInput.trim();

  // Strict separation: User only sees their own appointments, orders, visits & labs
  const isUserBooking = (item: { userId?: string; patientPhone?: string; patientName?: string }) => {
    return userAuth.isUserBooking(item, activePhone);
  };

  const filteredAppointments = appointments.filter(isUserBooking);
  const filteredMedicines = medicineOrders.filter(isUserBooking);
  const filteredVisits = homeVisits.filter(isUserBooking);
  const filteredLabs = labBookings.filter(isUserBooking);

  // Doctor lookup map for live token resolution
  const doctorMap = new Map<string, Doctor>();
  doctors.forEach(d => doctorMap.set(d.id, d));

  const totalUserBookings = 
    filteredAppointments.length + 
    filteredMedicines.length + 
    filteredVisits.length + 
    filteredLabs.length;

  return (
    <div className="pb-28 pt-2 px-4 max-w-md mx-auto space-y-4">
      {/* Patient Account & Privacy Header */}
      {(!userPhone || isChangingPhone) ? (
        <div className="bg-gradient-to-br from-sky-600 via-sky-700 to-indigo-800 rounded-2xl p-4 text-white shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-sky-200" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-sky-100">
                Private Patient Portal
              </h3>
            </div>
            {userPhone && (
              <button 
                onClick={() => setIsChangingPhone(false)}
                className="text-[11px] text-sky-200 hover:text-white font-medium cursor-pointer"
              >
                Cancel
              </button>
            )}
          </div>
          <p className="text-xs text-sky-100/90 leading-relaxed">
            Enter your 10-digit mobile number to access your personal OPD token status, medicine deliveries, and lab test reports.
          </p>
          <div className="flex gap-2 pt-1">
            <div className="relative flex-1">
              <span className="absolute left-3 top-2 text-xs text-slate-500 font-bold">+91</span>
              <input
                type="tel"
                maxLength={10}
                placeholder="10-digit mobile number"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="w-full pl-10 pr-3 py-2 bg-white text-slate-900 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-300"
              />
            </div>
            <button
              onClick={() => handleApplyPhone(phoneInput)}
              disabled={phoneInput.replace(/\D/g, '').length < 10}
              className="px-3 py-2 bg-white text-sky-800 text-xs font-bold rounded-xl hover:bg-sky-50 transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
            >
              Verify & View
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-3 shadow-2xs flex items-center justify-between">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-sky-600" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-bold text-slate-800 truncate">
                  {userName || 'My Bookings'}
                </span>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.2 rounded-full border border-emerald-200 shrink-0">
                  +91 {userPhone}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 truncate">
                {totalUserBookings} active record{totalUserBookings === 1 ? '' : 's'} linked to your device
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsChangingPhone(true)}
            className="text-[11px] text-sky-700 hover:text-sky-800 font-semibold px-2 py-1 bg-sky-50 hover:bg-sky-100 rounded-lg cursor-pointer transition-colors shrink-0 ml-2"
          >
            Switch
          </button>
        </div>
      )}

      {/* Tab Switcher: 4 Healthcare Service Modules (Strictly shows count for this user!) */}
      <div className="grid grid-cols-4 bg-slate-200/80 p-1 rounded-2xl gap-0.5 text-xs font-bold">
        <button
          onClick={() => setActiveTab('opd')}
          className={`py-2 px-1 rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center text-[11px] ${
            activeTab === 'opd'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CalendarCheck className="w-3.5 h-3.5 text-sky-600 mb-0.5" />
          <span className="truncate w-full text-center">OPD ({filteredAppointments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('medicines')}
          className={`py-2 px-1 rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center text-[11px] ${
            activeTab === 'medicines'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Truck className="w-3.5 h-3.5 text-emerald-600 mb-0.5" />
          <span className="truncate w-full text-center">Dawai ({filteredMedicines.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('home_visits')}
          className={`py-2 px-1 rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center text-[11px] ${
            activeTab === 'home_visits'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Home className="w-3.5 h-3.5 text-indigo-600 mb-0.5" />
          <span className="truncate w-full text-center">Visits ({filteredVisits.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('labs')}
          className={`py-2 px-1 rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center text-[11px] ${
            activeTab === 'labs'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FlaskConical className="w-3.5 h-3.5 text-teal-600 mb-0.5" />
          <span className="truncate w-full text-center">Labs ({filteredLabs.length})</span>
        </button>
      </div>

      {/* MODULE 1: DOCTOR OPD TOKENS */}
      {activeTab === 'opd' && (
        <div className="space-y-4">
          {filteredAppointments.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 shadow-xs">
              <CalendarCheck className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <h3 className="font-extrabold text-slate-800 text-sm">No OPD Bookings Found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                No active appointments booked yet. Browse our verified doctor list and book an appointment with live token tracking.
              </p>
              <button
                onClick={onNavigateToHome}
                className="mt-4 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
              >
                Find & Book Doctor
              </button>
            </div>
          ) : (
            filteredAppointments.map((apt) => {
              const doctor = doctorMap.get(apt.doctorId);
              const currentLiveToken = doctor ? doctor.currentToken : 1;
              const patientsAhead = apt.tokenNumber - currentLiveToken;
              const isTurnNow = apt.tokenNumber === currentLiveToken;
              const hasPassed = currentLiveToken > apt.tokenNumber;

              return (
                <div
                  key={apt.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden"
                >
                  {/* Status Ribbon Header */}
                  <div className={`px-4 py-2.5 flex items-center justify-between text-xs font-bold ${
                    apt.status === 'Confirmed'
                      ? 'bg-emerald-50 text-emerald-800 border-b border-emerald-100'
                      : apt.status === 'Pending'
                      ? 'bg-amber-50 text-amber-800 border-b border-amber-100'
                      : apt.status === 'Cancelled'
                      ? 'bg-rose-50 text-rose-800 border-b border-rose-100'
                      : 'bg-slate-100 text-slate-800 border-b border-slate-200'
                  }`}>
                    <div className="flex items-center space-x-1.5">
                      {apt.status === 'Confirmed' && <CheckCircle className="w-4 h-4 text-emerald-600" />}
                      {apt.status === 'Pending' && <Clock className="w-4 h-4 text-amber-600 animate-spin" />}
                      {apt.status === 'Cancelled' && <XCircle className="w-4 h-4 text-rose-600" />}
                      {apt.status === 'Completed' && <CheckCircle className="w-4 h-4 text-blue-600" />}
                      <span>
                        {apt.status === 'Pending' && 'Pending Verification (Admin Assigning Token)'}
                        {apt.status === 'Confirmed' && 'Confirmed - Token Active'}
                        {apt.status === 'Cancelled' && 'Booking Cancelled'}
                        {apt.status === 'Completed' && 'Consultation Completed'}
                      </span>
                    </div>

                    <span className="text-[11px] font-semibold opacity-80">
                      ID: {apt.id.slice(-6)}
                    </span>
                  </div>

                  {/* Doctor & Patient Details */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="w-11 h-11 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-2xl shrink-0">
                          {doctor?.emoji || '👨‍⚕️'}
                        </div>
                        <div>
                          <div className="flex items-center space-x-1.5 text-xs text-sky-700 font-bold">
                            <Stethoscope className="w-3.5 h-3.5" />
                            <span>{apt.doctorSpecialty}</span>
                          </div>
                          <h4 className="font-extrabold text-base text-slate-900 mt-0.5">
                            {apt.doctorName}
                          </h4>
                          <div className="flex items-center space-x-1 text-xs text-slate-500 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>Room {apt.roomNumber}</span>
                            <span className="mx-1">•</span>
                            <span>Fee: ₹{apt.consultationFee}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                          {apt.status === 'Confirmed' ? 'Assigned Token' : 'Suggested Token'}
                        </span>
                        <div className={`mt-0.5 px-3 py-1 rounded-xl inline-block border ${
                          apt.status === 'Confirmed'
                            ? 'bg-sky-50 border-sky-200'
                            : 'bg-amber-50 border-amber-200'
                        }`}>
                          <span className={`text-lg font-black ${
                            apt.status === 'Confirmed' ? 'text-sky-800' : 'text-amber-800'
                          }`}>
                            #{apt.tokenNumber}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Patient Name & Timing info */}
                    <div className="bg-slate-50 p-2.5 rounded-xl text-xs text-slate-600 flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-medium text-slate-800">{apt.patientName}</span>
                        <span className="text-slate-400">({apt.patientAge}y, {apt.patientGender})</span>
                      </div>
                      <div className="flex items-center space-x-1 text-[11px] font-semibold text-slate-700">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{apt.bookingDate} • {apt.timeSlot}</span>
                      </div>
                    </div>

                    {/* Pending Notice if not yet confirmed */}
                    {apt.status === 'Pending' && (
                      <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-center space-x-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Hospital Admin is reviewing current room capacity. Your verified token will appear here in moments.</span>
                      </div>
                    )}

                    {/* STRICT LIVE TOKEN TRACKING SECTION */}
                    {apt.status === 'Confirmed' && (
                      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50/60 to-sky-50 border border-emerald-200/80 shadow-2xs">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-900">
                            <span className="relative flex h-2.5 w-2.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                            </span>
                            <span>Live OPD Token Tracking</span>
                          </div>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            Realtime Sync
                          </span>
                        </div>

                        {/* Token Comparison Grid */}
                        <div className="grid grid-cols-2 gap-2 text-center py-2">
                          <div className="bg-white/90 p-2.5 rounded-xl border border-emerald-200/60 shadow-2xs">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                              Doctor Current Token
                            </span>
                            <span className="text-2xl font-black text-emerald-700 block mt-0.5">
                              #{currentLiveToken}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium">Inside OPD Room</span>
                          </div>

                          <div className="bg-white/90 p-2.5 rounded-xl border border-sky-200/60 shadow-2xs">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                              Your Assigned Token
                            </span>
                            <span className="text-2xl font-black text-sky-700 block mt-0.5">
                              #{apt.tokenNumber}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium">Your Turn</span>
                          </div>
                        </div>

                        {/* Live Guidance Status */}
                        <div className="mt-2 text-center">
                          {isTurnNow ? (
                            <div className="p-2 rounded-xl bg-emerald-500 text-white text-xs font-bold animate-pulse flex items-center justify-center space-x-1.5">
                              <Sparkles className="w-4 h-4" />
                              <span>It is YOUR TURN! Please proceed into Room {apt.roomNumber}</span>
                            </div>
                          ) : patientsAhead > 0 ? (
                            <div className="text-xs text-slate-700 font-medium">
                              <span className="font-extrabold text-emerald-800">{patientsAhead} patient{patientsAhead > 1 ? 's' : ''}</span> ahead of you. Estimated wait: <span className="font-bold text-slate-900">~{patientsAhead * 8} mins</span>.
                            </div>
                          ) : hasPassed ? (
                            <div className="text-xs text-amber-800 bg-amber-100/70 p-2 rounded-xl">
                              Your token #{apt.tokenNumber} was already called. If you just arrived, please speak to the compounder to be accommodated next.
                            </div>
                          ) : (
                            <div className="text-xs text-slate-600">
                              Please remain nearby OPD Room {apt.roomNumber}.
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* MODULE 2: MEDICINE HOME DELIVERY ORDERS */}
      {activeTab === 'medicines' && (
        <div className="space-y-4">
          {filteredMedicines.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 shadow-xs">
              <Truck className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <h3 className="font-extrabold text-slate-800 text-sm">No Medicine Orders Found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Need medicines delivered home? Order directly from the home tab with doctor prescription upload.
              </p>
              <button
                onClick={onNavigateToHome}
                className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
              >
                Order Medicines Now
              </button>
            </div>
          ) : (
            filteredMedicines.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden"
              >
                {/* Header with Status */}
                <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1.5 font-bold">
                    <Truck className="w-4 h-4 text-emerald-600" />
                    <span>Order #{order.id.slice(-6)}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
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
                </div>

                <div className="p-4 space-y-2.5 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">{order.patientName}</h4>
                      <p className="text-slate-500 flex items-center space-x-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{order.patientPhone}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Delivery Fee</span>
                      <p className="font-black text-emerald-700 text-sm">₹{order.deliveryFee}</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Delivery Address</span>
                    <p className="text-slate-700">{order.address}</p>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Medicines / Notes</span>
                    <p className="text-slate-800 whitespace-pre-line">{order.medicinesList}</p>
                  </div>

                  {order.prescriptionImage && (
                    <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-100 rounded-xl">
                      <div className="flex items-center space-x-2">
                        <img
                          src={order.prescriptionImage}
                          alt="Prescription"
                          className="w-10 h-10 object-cover rounded-lg border border-emerald-200 cursor-pointer"
                          onClick={() => setSelectedPrescriptionPreview(order.prescriptionImage || null)}
                        />
                        <div>
                          <span className="text-[11px] font-bold text-emerald-900 block">Uploaded Parchi</span>
                          <span className="text-[10px] text-emerald-700">Verified by pharmacy team</span>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedPrescriptionPreview(order.prescriptionImage || null)}
                        className="px-2.5 py-1 text-xs font-bold text-emerald-800 hover:bg-emerald-100 rounded-lg flex items-center space-x-1 cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* MODULE 3: DOCTOR HOME VISITS */}
      {activeTab === 'home_visits' && (
        <div className="space-y-4">
          {filteredVisits.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 shadow-xs">
              <Home className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <h3 className="font-extrabold text-slate-800 text-sm">No Home Visits Booked</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Need a certified MBBS specialist doctor to examine a patient at home? Book a home consultation.
              </p>
              <button
                onClick={onNavigateToHome}
                className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
              >
                Book Home Visit
              </button>
            </div>
          ) : (
            filteredVisits.map((visit) => (
              <div
                key={visit.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden"
              >
                <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1.5 font-bold text-indigo-900">
                    <Home className="w-4 h-4 text-indigo-600" />
                    <span>Visit #{visit.id.slice(-6)}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                    visit.status === 'Completed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : visit.status === 'Assigned'
                      ? 'bg-blue-100 text-blue-800 font-bold'
                      : 'bg-amber-100 text-amber-800 animate-pulse'
                  }`}>
                    {visit.status === 'Pending' ? 'Awaiting Doctor Assignment' : visit.status}
                  </span>
                </div>

                <div className="p-4 space-y-2.5 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">{visit.patientName}</h4>
                      <p className="text-slate-500 flex items-center space-x-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{visit.patientPhone}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Visit Fee</span>
                      <p className="font-black text-indigo-700 text-sm">₹{visit.visitFee}</p>
                    </div>
                  </div>

                  <div className="bg-indigo-50/60 p-2.5 rounded-xl text-indigo-900 space-y-1 border border-indigo-100/60">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Specialty Required:</span>
                      <span className="font-bold text-indigo-950">{visit.specialtyRequired}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Preferred Slot:</span>
                      <span className="font-semibold text-slate-800">{visit.preferredDate} ({visit.preferredTime})</span>
                    </div>
                    {visit.assignedDoctorName && (
                      <div className="flex justify-between pt-1 border-t border-indigo-200/60">
                        <span className="text-emerald-700 font-bold">Assigned Specialist:</span>
                        <span className="font-extrabold text-emerald-900">{visit.assignedDoctorName}</span>
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Home Address</span>
                    <p className="text-slate-700">{visit.address}</p>
                  </div>

                  {visit.symptomBrief && (
                    <div className="bg-slate-50 p-2.5 rounded-xl space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Condition / Symptoms</span>
                      <p className="text-slate-700">{visit.symptomBrief}</p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* MODULE 4: LAB TEST BOOKINGS */}
      {activeTab === 'labs' && (
        <div className="space-y-4">
          {filteredLabs.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 shadow-xs">
              <FlaskConical className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <h3 className="font-extrabold text-slate-800 text-sm">No Lab Test Bookings</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Book blood tests, full body health packages, and diabetes tests with home sample collection.
              </p>
              <button
                onClick={onNavigateToHome}
                className="mt-4 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
              >
                Browse Lab Tests
              </button>
            </div>
          ) : (
            filteredLabs.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md">
                      {booking.category}
                    </span>
                    <h4 className="font-extrabold text-sm text-slate-900 mt-1">{booking.testName}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Patient: {booking.patientName} ({booking.patientPhone})</p>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-slate-900">₹{booking.price}</span>
                    <span className="text-[10px] text-emerald-700 font-bold block bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 mt-1">
                      {booking.status}
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 text-xs text-slate-600 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Service Mode:</span>
                    <span className="font-bold text-teal-700">{booking.bookingType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Scheduled Date & Time:</span>
                    <span className="font-semibold text-slate-800">{booking.date} ({booking.timeSlot})</span>
                  </div>
                  {booking.address && (
                    <div className="pt-1 border-t border-slate-200/60">
                      <span className="text-slate-500 font-medium">Sample Collection Address: </span>
                      <span className="text-slate-800 font-semibold">{booking.address}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Prescription Zoom Modal */}
      {selectedPrescriptionPreview && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-4 max-w-sm w-full space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-sm text-slate-900">Prescription Photo</h4>
              <button
                onClick={() => setSelectedPrescriptionPreview(null)}
                className="p-1 text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <img
              src={selectedPrescriptionPreview}
              alt="Full prescription"
              className="w-full max-h-[70vh] object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};
