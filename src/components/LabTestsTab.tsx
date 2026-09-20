import React, { useState } from 'react';
import { LabTest } from '../types';
import { realtimeDb } from '../services/realtimeDb';
import { Search, FlaskConical, Home, Clock, ShieldCheck, CheckCircle2, X, AlertCircle, Sparkles } from 'lucide-react';

interface Props {
  labTests: LabTest[];
  onBookingSuccess: () => void;
}

export const LabTestsTab: React.FC<Props> = ({ labTests, onBookingSuccess }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTestForBooking, setSelectedTestForBooking] = useState<LabTest | null>(null);

  // Booking form states
  const [bookingType, setBookingType] = useState<'Home Sample Collection' | 'Visit Lab'>('Home Sample Collection');
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [address, setAddress] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeSlot, setTimeSlot] = useState('08:00 AM - 09:00 AM');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const categories = [
    'All',
    'Blood Tests',
    'Heart Health',
    'Thyroid',
    'Diabetes',
    'Liver Care',
    'Kidney Care',
    'Vitamins & Immunity',
    'Full Body Checkup'
  ];

  const timeSlots = [
    '07:00 AM - 08:00 AM',
    '08:00 AM - 09:00 AM',
    '09:00 AM - 10:00 AM',
    '10:00 AM - 11:00 AM',
    '11:00 AM - 12:00 PM',
    '04:00 PM - 05:00 PM'
  ];

  const filteredTests = labTests.filter(test => {
    const matchesSearch = 
      test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCat = selectedCategory === 'All' || test.category.toLowerCase().includes(selectedCategory.toLowerCase());
    return matchesSearch && matchesCat;
  });

  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) {
      setErrorMsg('Please enter patient name');
      return;
    }
    if (!patientPhone.trim() || patientPhone.trim().length < 10) {
      setErrorMsg('Please enter a valid 10-digit phone number');
      return;
    }
    if (bookingType === 'Home Sample Collection' && !address.trim()) {
      setErrorMsg('Please enter delivery address for sample collection');
      return;
    }

    if (!selectedTestForBooking) return;

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await realtimeDb.bookLabTest({
        testId: selectedTestForBooking.id,
        bookingType,
        patientName,
        patientPhone,
        address: bookingType === 'Home Sample Collection' ? address : undefined,
        date,
        timeSlot
      });

      setSelectedTestForBooking(null);
      setIsSubmitting(false);
      onBookingSuccess();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Booking failed');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pb-24 pt-2 px-4 max-w-md mx-auto space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        <input
          type="text"
          placeholder="Search test (e.g. CBC, Lipid, Thyroid, HbA1c)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200/90 rounded-2xl text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-3.5 text-xs text-slate-400 hover:text-slate-600 font-semibold"
          >
            Clear
          </button>
        )}
      </div>

      {/* Hero Promo for Home Sample Collection */}
      <div className="bg-gradient-to-r from-teal-700 via-emerald-800 to-teal-900 rounded-2xl p-4 text-white shadow-md relative overflow-hidden">
        <div className="flex items-center space-x-2 text-teal-200 text-xs font-semibold mb-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>NABL & ICMR Certified Diagnostics</span>
        </div>
        <h3 className="text-base font-black tracking-tight leading-snug">
          100% Sterile Home Sample Collection
        </h3>
        <p className="text-xs text-teal-100 mt-1 max-w-[270px]">
          Trained phlebotomists collect blood & urine samples from your home. Digital reports delivered within hours.
        </p>
      </div>

      {/* Category Horizontal Filter */}
      <div className="flex space-x-1.5 overflow-x-auto no-scrollbar pb-1">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'bg-teal-700 text-white font-bold shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 font-medium'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Lab Tests Grid / List */}
      <div className="space-y-3">
        {filteredTests.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
            <FlaskConical className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="font-bold text-slate-700 text-sm">No lab test found</p>
            <p className="text-xs text-slate-500 mt-1">Try another search keyword or category</p>
          </div>
        ) : (
          filteredTests.map((test) => (
            <div
              key={test.id}
              className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:border-teal-300 transition-all space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                      {test.category}
                    </span>
                    {test.popular && (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        Popular
                      </span>
                    )}
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900 mt-1">
                    {test.name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed line-clamp-2">
                    {test.description}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-base font-black text-slate-900">
                    ₹{test.price}
                  </div>
                  <div className="text-xs text-slate-400 line-through">
                    ₹{test.originalPrice}
                  </div>
                </div>
              </div>

              {/* Badges: Fasting & Report turnaround */}
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600 pt-2 border-t border-slate-100">
                <div className="flex items-center space-x-1 bg-slate-50 px-2 py-1 rounded-lg">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>Report: {test.reportTime}</span>
                </div>
                <div className="flex items-center space-x-1 bg-slate-50 px-2 py-1 rounded-lg">
                  <ShieldCheck className="w-3 h-3 text-teal-600" />
                  <span>{test.fastingRequired ? '10-12h Fasting' : 'No Fasting'}</span>
                </div>
                <div className="flex items-center space-x-1 bg-slate-50 px-2 py-1 rounded-lg">
                  <span>{test.sampleType}</span>
                </div>
              </div>

              {/* Action */}
              <div className="pt-1 flex items-center justify-between">
                <div className="flex items-center space-x-1 text-xs text-emerald-700 font-semibold">
                  <Home className="w-3.5 h-3.5" />
                  <span>Home Pickup Available</span>
                </div>

                <button
                  onClick={() => {
                    setSelectedTestForBooking(test);
                    setBookingType('Home Sample Collection');
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center space-x-1.5"
                >
                  <FlaskConical className="w-3.5 h-3.5" />
                  <span>Book Test</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Lab Booking Modal */}
      {selectedTestForBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                  <FlaskConical className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Book Lab Test</h3>
                  <p className="text-xs text-slate-500">{selectedTestForBooking.name}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTestForBooking(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Test Summary banner */}
            <div className="px-5 py-2.5 bg-teal-50/80 border-b border-teal-100 flex items-center justify-between text-xs font-bold text-teal-900">
              <span>Price: ₹{selectedTestForBooking.price}</span>
              <span>Report: {selectedTestForBooking.reportTime}</span>
            </div>

            <form onSubmit={handleBookSubmit} className="p-5 overflow-y-auto space-y-4 text-slate-800">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Service Type Switcher */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Choose Collection Preference *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setBookingType('Home Sample Collection')}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
                      bookingType === 'Home Sample Collection'
                        ? 'border-teal-600 bg-teal-50 text-teal-900 ring-1 ring-teal-600'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Home className="w-4 h-4 text-teal-600" />
                    <span>Home Sample Collection</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBookingType('Visit Lab')}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
                      bookingType === 'Visit Lab'
                        ? 'border-teal-600 bg-teal-50 text-teal-900 ring-1 ring-teal-600'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <FlaskConical className="w-4 h-4 text-teal-600" />
                    <span>Visit Lab Center</span>
                  </button>
                </div>
              </div>

              {/* Patient Details */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Patient Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sunita Devi"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Mobile Contact Number *
                </label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="10-digit mobile number"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              {/* Home Address (if Home sample collection) */}
              {bookingType === 'Home Sample Collection' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Complete Address for Home Collection *
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="House/Flat No, Landmark, City, Pincode"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Time Slot
                  </label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full px-2 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  >
                    {timeSlots.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold rounded-xl shadow-md flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{isSubmitting ? 'Confirming...' : `Confirm Booking • ₹${selectedTestForBooking.price}`}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
