import React, { useState } from 'react';
import { Search, Stethoscope, Star, MapPin, Clock, ArrowRight, ShieldCheck, Zap, Sparkles, Activity, Home as HomeIcon, FlaskConical, ChevronRight } from 'lucide-react';
import { Doctor, AppSettings } from '../types';
import { BookingModal } from './BookingModal';
import { HomeVisitModal } from './HomeVisitModal';
import { DoctorAvatar } from './DoctorAvatar';

interface Props {
  doctors: Doctor[];
  appSettings: AppSettings;
  onNavigateToTab: (tab: 'bookings' | 'labtests') => void;
  onBookingCreated: () => void;
}

export const HomeTab: React.FC<Props> = ({
  doctors,
  appSettings,
  onNavigateToTab,
  onBookingCreated
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState<Doctor | null>(null);
  const [isHomeVisitModalOpen, setIsHomeVisitModalOpen] = useState(false);

  const specialties = [
    'All',
    'General Physician & Diabetologist',
    'Gynecologist & Obstetrician',
    'Pediatrician',
    'General & Laparoscopic Surgeon',
    'Orthopedic Surgeon',
    'Dentist',
    'Ophthalmologist',
    'Dermatologist',
    'ENT Specialist',
    'Homeopathic Physician',
    'Cardiologist'
  ];

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = 
      doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.hospital.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.qualification.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSpecialty = 
      selectedSpecialty === 'All' || 
      doctor.specialty.toLowerCase().includes(selectedSpecialty.toLowerCase());

    return matchesSearch && matchesSpecialty;
  });

  return (
    <div className="pb-28 pt-2 px-4 max-w-md mx-auto space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        <input
          type="text"
          placeholder="Search doctor, clinic, specialty..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200/90 rounded-2xl text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-3.5 text-xs text-slate-400 hover:text-slate-600 font-semibold cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {/* QUICK ACTIONS 4-GRID (High-Converting Mobile Healthcare Services) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
            Fast Healthcare Services
          </h3>
          <span className="text-[11px] font-bold text-sky-700">Sadar Hospital Gopalganj & Siwan</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {/* Card 1: OPD Token */}
          <button
            onClick={() => {
              const el = document.getElementById('doctors-list');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="p-3 bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl text-white text-left shadow-xs hover:shadow-md transition-all relative overflow-hidden group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-lg mb-2">
              🩺
            </div>
            <h4 className="font-extrabold text-[11px] leading-tight">OPD Token</h4>
            <p className="text-[9px] text-sky-100 mt-0.5">Live queue tracking</p>
            <div className="mt-2 flex items-center text-[9px] font-bold text-sky-100 group-hover:translate-x-0.5 transition-transform">
              <span>Book</span>
              <ChevronRight className="w-2.5 h-2.5 ml-0.5" />
            </div>
          </button>

          {/* Card 2: Doctor Home Visit */}
          <button
            onClick={() => setIsHomeVisitModalOpen(true)}
            className="p-3 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl text-white text-left shadow-xs hover:shadow-md transition-all relative overflow-hidden group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-lg mb-2">
              🏡
            </div>
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-[11px] leading-tight">Home Visit</h4>
            </div>
            <p className="text-[9px] text-indigo-100 mt-0.5">Doctor at doorstep</p>
            <div className="mt-2 flex items-center text-[9px] font-bold text-indigo-100 group-hover:translate-x-0.5 transition-transform">
              <span>₹{appSettings.homeVisitFee}</span>
              <ChevronRight className="w-2.5 h-2.5 ml-0.5" />
            </div>
          </button>

          {/* Card 3: Diagnostic Lab Tests */}
          <button
            onClick={() => onNavigateToTab('labtests')}
            className="p-3 bg-gradient-to-br from-teal-600 to-cyan-700 rounded-2xl text-white text-left shadow-xs hover:shadow-md transition-all relative overflow-hidden group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-lg mb-2">
              🧪
            </div>
            <h4 className="font-extrabold text-[11px] leading-tight">Lab Tests</h4>
            <p className="text-[9px] text-teal-100 mt-0.5">Home sample test</p>
            <div className="mt-2 flex items-center text-[9px] font-bold text-teal-100 group-hover:translate-x-0.5 transition-transform">
              <span>Explore</span>
              <ChevronRight className="w-2.5 h-2.5 ml-0.5" />
            </div>
          </button>
        </div>
      </div>

      {/* Feature Banner: Live Token Queue Alert */}
      <div className="bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 rounded-2xl p-4 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center space-x-1.5 mb-1 text-sky-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Real-time Live Token Tracking</span>
          </div>
          <h2 className="text-base font-black tracking-tight leading-snug">
            Zero Waiting in Hospital OPDs
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-[280px] leading-relaxed">
            Take your token from home and reach hospital when your turn is close. Real-time Firebase sync updates token changes live.
          </p>
        </div>
      </div>

      {/* Specialty Filter Horizontal Scroll */}
      <div id="doctors-list">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-extrabold text-sm text-slate-900 flex items-center space-x-1.5">
            <Stethoscope className="w-4 h-4 text-sky-600" />
            <span>Consult Specialists</span>
          </h3>
          <span className="text-[11px] text-slate-500 font-medium">
            {filteredDoctors.length} Doctors
          </span>
        </div>

        <div className="flex space-x-1.5 overflow-x-auto no-scrollbar pb-1">
          {specialties.map((spec) => {
            const isSelected = selectedSpecialty === spec;
            return (
              <button
                key={spec}
                onClick={() => setSelectedSpecialty(spec)}
                className={`px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-sky-600 text-white font-bold shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 font-medium'
                }`}
              >
                {spec}
              </button>
            );
          })}
        </div>
      </div>

      {/* Doctor Cards List */}
      <div className="space-y-3 pt-1">
        {filteredDoctors.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
            <Stethoscope className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="font-bold text-slate-700 text-sm">No doctors match your search</p>
            <p className="text-xs text-slate-500 mt-1">Try clearing filters or checking other specialties</p>
          </div>
        ) : (
          filteredDoctors.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:border-sky-300 transition-all relative overflow-hidden"
            >
              {/* Top Row: Avatar & Basic Info */}
              <div className="flex space-x-3">
                <DoctorAvatar emoji={doc.emoji} name={doc.name} size="md" />

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 truncate">
                        {doc.name}
                      </h4>
                      <p className="text-xs font-semibold text-sky-700 mt-0.5">
                        {doc.specialty}
                      </p>
                    </div>
                    <div className="flex items-center space-x-1 bg-amber-50 px-1.5 py-0.5 rounded text-[11px] font-bold text-amber-800 border border-amber-200/60">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                      <span>{doc.rating}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 mt-1 truncate">
                    {doc.qualification} • {doc.experience}
                  </p>

                  <div className="flex items-center space-x-1 text-[11px] text-slate-500 mt-1">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{doc.hospital} ({doc.roomNumber})</span>
                  </div>
                </div>
              </div>

              {/* Middle Row: OPD Timings & Live Token Real-time Status */}
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-1.5 text-slate-600">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[11px] font-medium">{doc.timing}</span>
                </div>

                {/* Live OPD Token Badge */}
                <div className="flex items-center space-x-1.5 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[11px] font-bold text-emerald-800">
                    Live Token: #{doc.currentToken}
                  </span>
                </div>
              </div>

              {/* Bottom Row: Price & Booking Action */}
              <div className="mt-3 pt-2 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
                    Consultation Fee
                  </span>
                  <span className="text-base font-extrabold text-slate-900">
                    ₹{doc.consultationFee}
                  </span>
                </div>

                <button
                  onClick={() => setSelectedDoctorForBooking(doc)}
                  className="px-4 py-2 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-xs hover:shadow-md transition-all flex items-center space-x-1.5 cursor-pointer"
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Book OPD Token</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Doctor Booking Modal */}
      {selectedDoctorForBooking && (
        <BookingModal
          doctor={selectedDoctorForBooking}
          onClose={() => setSelectedDoctorForBooking(null)}
          onSuccess={() => {
            setSelectedDoctorForBooking(null);
            onBookingCreated();
            onNavigateToTab('bookings');
          }}
        />
      )}

      {/* Doctor Home Visit Modal */}
      {isHomeVisitModalOpen && (
        <HomeVisitModal
          visitFee={appSettings.homeVisitFee}
          onClose={() => setIsHomeVisitModalOpen(false)}
          onSuccess={() => {
            onBookingCreated();
            onNavigateToTab('bookings');
          }}
        />
      )}
    </div>
  );
};
