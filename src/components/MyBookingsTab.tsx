import React, { useState, useEffect, useMemo } from 'react';
import { Appointment, Doctor, LabBooking, HomeVisitBooking, FamilyDependant } from '../types';
import { 
  CalendarCheck, Clock, CheckCircle, AlertTriangle, XCircle, Stethoscope, 
  MapPin, User, Activity, FlaskConical, Search, Sparkles, Home,
  FileText, Phone, Eye, ShieldCheck, RefreshCw, Banknote, Receipt, Star,
  Lock, Users, Plus, Shield
} from 'lucide-react';
import { userAuth } from '../services/userAuth';
import { BookingReceiptModal } from './BookingReceiptModal';
import { PostVisitFeedbackModal } from './PostVisitFeedbackModal';

interface Props {
  appointments: Appointment[];
  doctors: Doctor[];
  labBookings: LabBooking[];
  homeVisits?: HomeVisitBooking[];
  onNavigateToHome: () => void;
  currentUserPhone?: string;
  onUpdateUserPhone?: (phone: string) => void;
}

export const MyBookingsTab: React.FC<Props> = ({
  appointments,
  doctors,
  labBookings,
  homeVisits = [],
  onNavigateToHome,
  currentUserPhone,
  onUpdateUserPhone
}) => {
  // Session phone: strictly locked to the verified patient session
  const [userPhone, setUserPhone] = useState<string>(() => currentUserPhone || userAuth.getUserPhone());
  const [userName, setUserName] = useState<string>(() => userAuth.getUserName());
  const [phoneInput, setPhoneInput] = useState<string>(currentUserPhone || userAuth.getUserPhone());
  const [activeTab, setActiveTab] = useState<'opd' | 'home_visits' | 'labs'>('opd');

  // Family Dependants strictly under this verified phone account
  const [dependants, setDependants] = useState<FamilyDependant[]>(() => userAuth.getFamilyDependants());
  const [selectedFamilyMember, setSelectedFamilyMember] = useState<string>('all');
  const [showAddDependantModal, setShowAddDependantModal] = useState<boolean>(false);
  const [newDepName, setNewDepName] = useState('');
  const [newDepRelation, setNewDepRelation] = useState<'Self' | 'Spouse' | 'Child' | 'Parent' | 'Sibling' | 'Other'>('Child');
  const [newDepAge, setNewDepAge] = useState('');
  const [newDepGender, setNewDepGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [addDepError, setAddDepError] = useState<string | null>(null);

  const [selectedPrescriptionPreview, setSelectedPrescriptionPreview] = useState<string | null>(null);
  const [selectedReceiptAppointment, setSelectedReceiptAppointment] = useState<Appointment | null>(null);
  const [selectedFeedbackBooking, setSelectedFeedbackBooking] = useState<{
    booking?: any;
    serviceType: 'OPD Consultation' | 'Doctor Home Visit' | 'Diagnostic Lab Test' | 'General Clinic Care';
    doctorName?: string;
  } | null>(null);

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
        setDependants(userAuth.getFamilyDependants());
      }
    });
  }, []);

  // One-time session verification for first-time visitors
  const handleApplyPhone = (newPhone: string) => {
    const clean = userAuth.normalizePhone(newPhone);
    if (clean.length === 10) {
      userAuth.setUserIdentity(clean);
      setUserPhone(clean);
      setPhoneInput(clean);
      setDependants(userAuth.getFamilyDependants());
      onUpdateUserPhone?.(clean);
    }
  };

  const handleAddDependantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAddDepError(null);
    if (!newDepName.trim()) {
      setAddDepError('Please enter family member name');
      return;
    }
    const added = userAuth.addFamilyDependant({
      name: newDepName.trim(),
      relationship: newDepRelation,
      age: newDepAge.trim() ? Number(newDepAge) : undefined,
      gender: newDepGender
    });
    if (added) {
      setDependants(userAuth.getFamilyDependants());
      setSelectedFamilyMember(added.name.toLowerCase());
      setNewDepName('');
      setNewDepAge('');
      setShowAddDependantModal(false);
    }
  };

  // Strictly validated active phone from verified session
  const activePhone = userAuth.normalizePhone(userPhone || currentUserPhone || '');

  // Strict separation: User only sees their own appointments, orders, visits & labs
  const isUserBooking = (item: { userId?: string; patientPhone?: string; patientName?: string }) => {
    if (!activePhone) return false;
    return userAuth.isUserBooking(item, activePhone);
  };

  // Base bookings for this verified phone number
  const allUserAppointments = useMemo(() => appointments.filter(isUserBooking), [appointments, activePhone]);
  const allUserVisits = useMemo(() => homeVisits.filter(isUserBooking), [homeVisits, activePhone]);
  const allUserLabs = useMemo(() => labBookings.filter(isUserBooking), [labBookings, activePhone]);

  const totalUserBookings = 
    allUserAppointments.length + 
    allUserVisits.length + 
    allUserLabs.length;

  // Aggregate all known family profiles under this verified phone account
  const familyProfiles = useMemo(() => {
    const profilesMap = new Map<string, { id: string; name: string; relation: string }>();

    // 1. Primary account user
    const primary = (userName || 'Primary (Self)').trim();
    profilesMap.set(primary.toLowerCase(), {
      id: 'primary',
      name: primary,
      relation: 'Self'
    });

    // 2. Saved dependants in userAuth
    dependants.forEach(d => {
      profilesMap.set(d.name.trim().toLowerCase(), {
        id: d.id,
        name: d.name.trim(),
        relation: d.relationship
      });
    });

    // 3. Any previous bookings under this verified phone with distinct patient names
    const allRecords = [...allUserAppointments, ...allUserVisits, ...allUserLabs];
    allRecords.forEach(b => {
      if (b.patientName && b.patientName.trim()) {
        const key = b.patientName.trim().toLowerCase();
        if (!profilesMap.has(key)) {
          profilesMap.set(key, {
            id: `auto_${key}`,
            name: b.patientName.trim(),
            relation: 'Family'
          });
        }
      }
    });

    return Array.from(profilesMap.values());
  }, [dependants, userName, allUserAppointments, allUserVisits, allUserLabs]);

  const getFamilyMemberBookingCount = (memberName: string) => {
    const target = memberName.trim().toLowerCase();
    const countApts = allUserAppointments.filter(a => a.patientName?.trim().toLowerCase() === target).length;
    const countVisits = allUserVisits.filter(v => v.patientName?.trim().toLowerCase() === target).length;
    const countLabs = allUserLabs.filter(l => l.patientName?.trim().toLowerCase() === target).length;
    return countApts + countVisits + countLabs;
  };

  // Filter bookings by selected family member (all strictly within this verified phone!)
  const matchesFamily = (bookingPatientName?: string) => {
    if (selectedFamilyMember === 'all') return true;
    if (!bookingPatientName) return false;
    return bookingPatientName.trim().toLowerCase() === selectedFamilyMember.trim().toLowerCase();
  };

  const filteredAppointments = allUserAppointments.filter(a => matchesFamily(a.patientName));
  const filteredVisits = allUserVisits.filter(v => matchesFamily(v.patientName));
  const filteredLabs = allUserLabs.filter(l => matchesFamily(l.patientName));

  // Doctor lookup map for live token resolution
  const doctorMap = new Map<string, Doctor>();
  doctors.forEach(d => doctorMap.set(d.id, d));

  return (
    <div className="pb-28 pt-2 px-4 max-w-md mx-auto space-y-4">
      {/* Patient Account & Privacy Header */}
      {!activePhone ? (
        <div className="bg-gradient-to-br from-sky-600 via-sky-700 to-indigo-800 rounded-3xl p-5 text-white shadow-lg space-y-3.5 border border-sky-400/40">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <Lock className="w-4 h-4 text-sky-100" />
            </div>
            <div>
              <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded uppercase tracking-wider text-sky-200">
                Secure Patient Session
              </span>
              <h3 className="font-black text-sm text-white mt-0.5">
                Private Health Records Access
              </h3>
            </div>
          </div>

          <p className="text-xs text-sky-100/90 leading-relaxed">
            Please enter your 10-digit mobile number once. Your device session will be securely linked to your phone number to show only your verified OPD tokens, doctor home visits, and diagnostic lab reports.
          </p>

          <div className="flex gap-2 pt-1">
            <div className="relative flex-1">
              <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-bold">+91</span>
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
              className="px-3.5 py-2 bg-white text-sky-800 text-xs font-black rounded-xl hover:bg-sky-50 transition-colors disabled:opacity-50 cursor-pointer shadow-xs whitespace-nowrap"
            >
              Verify & Lock
            </button>
          </div>

          <div className="text-[10px] text-sky-200/90 flex items-center space-x-1.5 pt-0.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
            <span>Encrypted patient confidentiality • No cross-user access allowed</span>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs space-y-3">
          {/* Verified Session Info - Notice: No arbitrary switch button exists */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 border border-sky-100 flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-sky-600" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs font-black text-slate-900 truncate">
                    {userName || 'Verified Account'}
                  </span>
                  <span className="inline-flex items-center space-x-1 text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                    <Lock className="w-2.5 h-2.5 text-emerald-600" />
                    <span>+91 {activePhone}</span>
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 truncate flex items-center space-x-1 mt-0.5">
                  <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>Access locked to verified account • {totalUserBookings} record{totalUserBookings === 1 ? '' : 's'}</span>
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg">
                Active Session
              </span>
            </div>
          </div>

          {/* Family Profiles / Dependants (Restricted strictly to the SAME verified phone) */}
          <div className="pt-2.5 border-t border-slate-100 space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center space-x-1 text-slate-700 font-bold">
                <Users className="w-3.5 h-3.5 text-sky-600" />
                <span>Family Members (Under +91 {activePhone})</span>
              </div>
              <button
                type="button"
                onClick={() => setShowAddDependantModal(true)}
                className="text-[10px] font-bold text-sky-600 hover:text-sky-800 flex items-center space-x-0.5 cursor-pointer bg-sky-50 px-2 py-0.5 rounded-lg border border-sky-200/80 transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>Add Dependant</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
              <button
                type="button"
                onClick={() => setSelectedFamilyMember('all')}
                className={`px-2.5 py-1 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer text-xs flex items-center space-x-1 ${
                  selectedFamilyMember === 'all'
                    ? 'bg-sky-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>All Family</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedFamilyMember === 'all' ? 'bg-sky-700 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {totalUserBookings}
                </span>
              </button>

              {familyProfiles.map((profile) => {
                const isSelected = selectedFamilyMember === profile.name.toLowerCase();
                const count = getFamilyMemberBookingCount(profile.name);
                return (
                  <button
                    key={profile.id}
                    type="button"
                    onClick={() => setSelectedFamilyMember(profile.name.toLowerCase())}
                    className={`px-2.5 py-1 rounded-xl whitespace-nowrap transition-colors cursor-pointer text-xs flex items-center space-x-1.5 ${
                      isSelected
                        ? 'bg-sky-600 text-white shadow-2xs font-bold'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 font-medium'
                    }`}
                  >
                    <span>{profile.name}</span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                      isSelected ? 'bg-sky-700 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {profile.relation !== 'Self' && profile.relation !== 'Family' ? `${profile.relation} • ` : ''}{count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Active Family Member Filter Indicator */}
      {selectedFamilyMember !== 'all' && (
        <div className="bg-sky-50 border border-sky-200/80 rounded-xl px-3 py-2 text-xs flex items-center justify-between text-sky-900 animate-in fade-in">
          <div className="flex items-center space-x-1.5 truncate">
            <User className="w-3.5 h-3.5 text-sky-600 shrink-0" />
            <span className="truncate">
              Showing records for <strong className="font-extrabold capitalize">{selectedFamilyMember}</strong> (Phone: +91 {activePhone})
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSelectedFamilyMember('all')}
            className="text-[11px] font-bold text-sky-700 hover:text-sky-900 underline shrink-0 cursor-pointer ml-2"
          >
            Show All
          </button>
        </div>
      )}

      {/* Tab Switcher: 3 Healthcare Service Modules (Strictly shows count for this user!) */}
      <div className="grid grid-cols-3 bg-slate-200/80 p-1 rounded-2xl gap-0.5 text-xs font-bold">
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
              <h3 className="font-extrabold text-slate-800 text-sm">
                {selectedFamilyMember !== 'all' 
                  ? `No OPD Bookings for ${selectedFamilyMember}` 
                  : 'No OPD Bookings Found'}
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                {selectedFamilyMember !== 'all'
                  ? `There are no OPD doctor appointments registered under ${selectedFamilyMember} for your verified account (+91 ${activePhone}).`
                  : 'No active appointments booked yet. Browse our verified doctor list and book an appointment with live token tracking.'}
              </p>
              <div className="mt-4 flex items-center justify-center gap-2">
                {selectedFamilyMember !== 'all' && (
                  <button
                    onClick={() => setSelectedFamilyMember('all')}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                  >
                    View All Family
                  </button>
                )}
                <button
                  onClick={onNavigateToHome}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Find & Book Doctor
                </button>
              </div>
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

                    {apt.location?.address && (
                      <div className="flex items-center space-x-1.5 text-[11px] text-slate-500 bg-slate-50/60 px-2.5 py-1.5 rounded-xl border border-slate-100">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">Patient Location: <strong className="text-slate-700 font-semibold">{apt.location.address}</strong></span>
                      </div>
                    )}

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

                    {/* Payment Status & Token Receipt Slip */}
                    <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2 min-w-0">
                        <Banknote className="w-4 h-4 text-emerald-700 shrink-0" />
                        <div className="min-w-0">
                          <span className="font-extrabold text-emerald-950 block truncate">
                            {apt.payment?.statusLabel || 'Pay Cash at Clinic'}
                          </span>
                          <span className="text-[10px] text-emerald-800/90 block truncate">
                            Pay ₹{apt.consultationFee} at OPD reception counter upon arrival
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1.5 shrink-0 ml-2">
                        <button
                          type="button"
                          onClick={() => setSelectedFeedbackBooking({
                            booking: apt,
                            serviceType: 'OPD Consultation',
                            doctorName: apt.doctorName
                          })}
                          className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[11px] font-bold shadow-xs flex items-center space-x-1 cursor-pointer transition-colors"
                          title="Rate your doctor visit and leave comments for the clinic admin"
                        >
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>Feedback</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedReceiptAppointment(apt)}
                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold shadow-xs flex items-center space-x-1 cursor-pointer transition-colors"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          <span>Token Slip</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* MODULE 2: DOCTOR HOME VISITS */}
      {activeTab === 'home_visits' && (
        <div className="space-y-4">
          {filteredVisits.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 shadow-xs">
              <Home className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <h3 className="font-extrabold text-slate-800 text-sm">
                {selectedFamilyMember !== 'all'
                  ? `No Home Visits for ${selectedFamilyMember}`
                  : 'No Home Visits Booked'}
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                {selectedFamilyMember !== 'all'
                  ? `There are no home visits scheduled under ${selectedFamilyMember} for your verified account (+91 ${activePhone}).`
                  : 'Need a certified MBBS specialist doctor to examine a patient at home? Book a home consultation.'}
              </p>
              <div className="mt-4 flex items-center justify-center gap-2">
                {selectedFamilyMember !== 'all' && (
                  <button
                    onClick={() => setSelectedFamilyMember('all')}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                  >
                    View All Family
                  </button>
                )}
                <button
                  onClick={onNavigateToHome}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Book Home Visit
                </button>
              </div>
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

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => setSelectedFeedbackBooking({
                        booking: visit,
                        serviceType: 'Doctor Home Visit',
                        doctorName: visit.assignedDoctorName
                      })}
                      className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold flex items-center space-x-1.5 cursor-pointer transition-colors"
                    >
                      <Star className="w-3.5 h-3.5 fill-current text-amber-500" />
                      <span>Rate Home Visit Experience</span>
                    </button>
                  </div>
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
              <h3 className="font-extrabold text-slate-800 text-sm">
                {selectedFamilyMember !== 'all'
                  ? `No Lab Test Bookings for ${selectedFamilyMember}`
                  : 'No Lab Test Bookings'}
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                {selectedFamilyMember !== 'all'
                  ? `There are no diagnostic lab test orders registered under ${selectedFamilyMember} for your verified account (+91 ${activePhone}).`
                  : 'Book blood tests, full body health packages, and diabetes tests with home sample collection.'}
              </p>
              <div className="mt-4 flex items-center justify-center gap-2">
                {selectedFamilyMember !== 'all' && (
                  <button
                    onClick={() => setSelectedFamilyMember('all')}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                  >
                    View All Family
                  </button>
                )}
                <button
                  onClick={onNavigateToHome}
                  className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Browse Lab Tests
                </button>
              </div>
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
                    <span className={`text-[10px] font-bold block px-2 py-0.5 rounded-full border mt-1 ${
                      booking.status === 'Completed'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : booking.status === 'Report Generated'
                        ? 'bg-teal-50 text-teal-700 border-teal-200'
                        : booking.status === 'Sample Collected'
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        : booking.status === 'Confirmed'
                        ? 'bg-sky-50 text-sky-700 border-sky-200'
                        : booking.status === 'Cancelled'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
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

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => setSelectedFeedbackBooking({
                        booking: booking,
                        serviceType: 'Diagnostic Lab Test'
                      })}
                      className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-xl text-xs font-bold flex items-center space-x-1.5 cursor-pointer transition-colors"
                    >
                      <Star className="w-3.5 h-3.5 fill-current text-amber-500" />
                      <span>Rate Diagnostic Experience</span>
                    </button>
                  </div>
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

      {/* Official OPD Token Slip & Cash-at-Counter Receipt Modal */}
      {selectedReceiptAppointment && (
        <BookingReceiptModal
          appointment={selectedReceiptAppointment}
          onClose={() => setSelectedReceiptAppointment(null)}
          onViewMyBookings={() => setSelectedReceiptAppointment(null)}
        />
      )}

      {/* Post-Visit Patient Feedback Modal */}
      {selectedFeedbackBooking && (
        <PostVisitFeedbackModal
          booking={selectedFeedbackBooking.booking}
          defaultServiceType={selectedFeedbackBooking.serviceType}
          defaultDoctorName={selectedFeedbackBooking.doctorName}
          onClose={() => setSelectedFeedbackBooking(null)}
          onSuccess={() => setSelectedFeedbackBooking(null)}
        />
      )}

      {/* Add Family Dependant Modal (strictly locked to the user's verified phone account) */}
      {showAddDependantModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-3.5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center">
                  <Users className="w-4 h-4 text-sky-600" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900">Add Family Member</h3>
                  <span className="text-[10px] text-slate-500">Same Account Dependant</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAddDependantModal(false);
                  setAddDepError(null);
                }}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-sky-50/80 border border-sky-200/70 rounded-xl p-2.5 text-[11px] text-sky-950 space-y-1">
              <div className="flex items-center space-x-1.5 font-bold text-sky-900">
                <Lock className="w-3.5 h-3.5 text-sky-700 shrink-0" />
                <span>Account Protection Guarantee</span>
              </div>
              <p className="text-slate-600 text-[10px] leading-relaxed">
                This dependant is strictly registered under your verified number (<strong className="text-slate-800 font-bold">+91 {activePhone}</strong>). All appointments, tokens, and records will be securely linked to this account.
              </p>
            </div>

            {addDepError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium flex items-center space-x-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>{addDepError}</span>
              </div>
            )}

            <form onSubmit={handleAddDependantSubmit} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Full Name of Patient *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aarav Singh"
                  value={newDepName}
                  onChange={(e) => setNewDepName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Relationship
                  </label>
                  <select
                    value={newDepRelation}
                    onChange={(e) => setNewDepRelation(e.target.value as any)}
                    className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/20 cursor-pointer"
                  >
                    <option value="Child">Child (Son/Daughter)</option>
                    <option value="Spouse">Spouse (Wife/Husband)</option>
                    <option value="Parent">Parent (Father/Mother)</option>
                    <option value="Sibling">Sibling (Brother/Sister)</option>
                    <option value="Other">Other Family Member</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Age (Years)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="120"
                    placeholder="e.g. 8"
                    value={newDepAge}
                    onChange={(e) => setNewDepAge(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Gender
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Male', 'Female', 'Other'] as const).map((g) => (
                    <button
                      type="button"
                      key={g}
                      onClick={() => setNewDepGender(g)}
                      className={`py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                        newDepGender === g
                          ? 'bg-sky-50 border-sky-300 text-sky-800'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddDependantModal(false);
                    setAddDepError(null);
                  }}
                  className="px-3 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-black rounded-xl shadow-xs cursor-pointer"
                >
                  Save Member Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
