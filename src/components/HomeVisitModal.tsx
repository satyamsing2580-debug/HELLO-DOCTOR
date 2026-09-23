import React, { useState } from 'react';
import { X, Home, Calendar, Clock, AlertCircle, CheckCircle2, UserCheck, Stethoscope, Banknote } from 'lucide-react';
import { GeoLocationData, PaymentDetails } from '../types';
import { realtimeDb } from '../services/realtimeDb';
import { userAuth } from '../services/userAuth';
import { GpsLocationVerifier } from './GpsLocationVerifier';
import { PaymentCheckoutModal } from './PaymentCheckoutModal';
import { locationService } from '../services/locationService';

interface HomeVisitModalProps {
  onClose: () => void;
  onSuccess: () => void;
  visitFee: number;
}

const SPECIALTY_OPTIONS = [
  'General Physician & Diabetologist',
  'Pediatrician (Child Specialist)',
  'Gynecologist & Obstetrician',
  'Orthopedic Surgeon (Bone & Joint)',
  'Cardiologist (Heart Specialist)',
  'General Surgeon',
  'ENT Specialist (Ear, Nose, Throat)',
  'Dermatologist (Skin Specialist)'
];

const TIME_SLOTS = [
  '08:00 AM - 10:00 AM (Morning)',
  '10:00 AM - 12:00 PM (Mid-day)',
  '02:00 PM - 04:00 PM (Afternoon)',
  '04:00 PM - 06:00 PM (Evening)',
  '06:00 PM - 08:00 PM (Night)'
];

export const HomeVisitModal: React.FC<HomeVisitModalProps> = ({
  onClose,
  onSuccess,
  visitFee
}) => {
  const [patientName, setPatientName] = useState(() => userAuth.getUserName());
  const [patientPhone, setPatientPhone] = useState(() => userAuth.getUserPhone());
  const [address, setAddress] = useState('');
  const [verifiedLocation, setVerifiedLocation] = useState<GeoLocationData | null>(null);
  const [preferredDate, setPreferredDate] = useState(new Date().toISOString().split('T')[0]);
  const [preferredTime, setPreferredTime] = useState(TIME_SLOTS[0]);
  const [specialtyRequired, setSpecialtyRequired] = useState(SPECIALTY_OPTIONS[0]);
  const [symptomBrief, setSymptomBrief] = useState('');
  
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handlePreCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!patientName.trim() || !patientPhone.trim() || !address.trim()) {
      setErrorMessage('Please fill in Name, Phone, and Complete Address.');
      return;
    }

    // MANDATORY REAL-TIME GPS VERIFICATION: Play Store & Indus Appstore Compliance
    if (!verifiedLocation || !verifiedLocation.isVerified) {
      setErrorMessage('GPS Location Verification is mandatory. Please tap "Detect Current GPS Location" above to verify your real-time physical address before requesting a doctor visit.');
      return;
    }

    const check = locationService.validateAddress(address, true);
    if (!check.isValid) {
      setErrorMessage(check.error || 'Please enter a genuine, recognizable home address in Gopalganj or Siwan.');
      return;
    }

    setShowCheckoutModal(true);
  };

  const handlePaymentConfirmed = async (paymentDetails: PaymentDetails) => {
    setShowCheckoutModal(false);
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await realtimeDb.bookHomeVisit({
        patientName: patientName.trim(),
        patientPhone: patientPhone.trim(),
        address: address.trim(),
        preferredDate,
        preferredTime,
        specialtyRequired,
        symptomBrief: symptomBrief.trim(),
        visitFee,
        location: verifiedLocation
          ? { ...verifiedLocation, address: address.trim() || verifiedLocation.address || 'Bhitbherwa, Gopalganj, Bihar' }
          : {
              latitude: 26.4688,
              longitude: 84.4441,
              address: address.trim() || 'Bhitbherwa, Gopalganj, Bihar',
              isVerified: true,
              verifiedAt: Date.now()
            },
        payment: paymentDetails
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to book home visit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
          {/* Header */}
          <div className="px-4 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-800 text-white flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-xl">
                🏡
              </div>
              <div>
                <h3 className="font-extrabold text-base leading-tight">Doctor Ghar Par Bulao</h3>
                <p className="text-xs text-blue-100 font-medium">Verified Doctor Home Consultation</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable Form */}
          <form onSubmit={handlePreCheckout} className="p-4 overflow-y-auto space-y-3.5 text-sm flex-1">
            {errorMessage && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Pricing Info Banner */}
            <div className="bg-blue-50/80 border border-blue-100 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Stethoscope className="w-4 h-4 text-blue-700 shrink-0" />
                <span className="text-xs font-semibold text-blue-900">Doctor Visit & Consultation Fee</span>
              </div>
              <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-blue-600 text-white">
                ₹{visitFee} Only
              </span>
            </div>

            {/* Family Profile Quick Selector */}
            {userAuth.getFamilyDependants().length > 0 && (
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Select Family Member for Home Visit
                </label>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {userAuth.getFamilyDependants().map((dep) => (
                    <button
                      key={dep.id}
                      type="button"
                      onClick={() => setPatientName(dep.name)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-semibold whitespace-nowrap border transition-colors cursor-pointer ${
                        patientName.trim().toLowerCase() === dep.name.trim().toLowerCase()
                          ? 'bg-blue-50 border-blue-300 text-blue-800 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {dep.name} {dep.relationship && dep.relationship !== 'Other' ? `(${dep.relationship})` : ''}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Patient Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sitaram Prasad"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="10-digit mobile"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                />
              </div>
            </div>

            {/* Real-time GPS Location & Anti-Random Address Verifier */}
            <GpsLocationVerifier
              label="Patient Home Address & GPS Location *"
              placeholder="House/Ward No., Mohalla/Village, Landmark, Town/District (Gopalganj/Siwan)..."
              manualAddress={address}
              onAddressChange={setAddress}
              verifiedLocation={verifiedLocation}
              onLocationVerified={setVerifiedLocation}
            />

            {/* Specialty Needed */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Doctor Specialty Required *
              </label>
              <select
                value={specialtyRequired}
                onChange={(e) => setSpecialtyRequired(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
              >
                {SPECIALTY_OPTIONS.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>

            {/* Preferred Date & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Preferred Visit Date
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Time Slot
                </label>
                <select
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                >
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Symptoms / Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Patient Symptoms & Health Issues
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Bedridden senior citizen, high blood pressure, mobility issue, severe knee pain..."
                value={symptomBrief}
                onChange={(e) => setSymptomBrief(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 resize-none"
              />
            </div>

            {/* Notice Box */}
            <div className="p-3 bg-blue-50/60 rounded-xl text-xs space-y-1 text-slate-600">
              <div className="flex items-center space-x-1.5 text-blue-900 font-bold">
                <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Home Visit Protocol</span>
              </div>
              <p className="text-[11px] text-slate-600">
                A certified MBBS specialist doctor equipped with diagnostic kit (BP, sugar, pulse oximeter, stethoscope) will arrive at your home.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-extrabold rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              <Banknote className="w-4 h-4" />
              <span>{isSubmitting ? 'Requesting Home Visit...' : `Pay Cash to Doctor on Home Visit (₹${visitFee})`}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Payment Checkout Modal */}
      {showCheckoutModal && (
        <PaymentCheckoutModal
          amount={visitFee}
          serviceTitle={`Doctor Home Consultation (${specialtyRequired})`}
          serviceSubtitle={`Visit to: ${address.slice(0, 35)}... on ${preferredDate}`}
          patientName={patientName}
          patientPhone={patientPhone}
          allowCounterPayment={true}
          counterPaymentLabel={`Pay ₹${visitFee} in Cash to Doctor during Home Visit`}
          counterPaymentType="PAY_ON_VISIT"
          onClose={() => setShowCheckoutModal(false)}
          onPaymentSuccess={handlePaymentConfirmed}
        />
      )}
    </>
  );
};
