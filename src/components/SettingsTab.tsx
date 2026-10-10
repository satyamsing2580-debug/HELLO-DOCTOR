import React, { useState } from 'react';
import { 
  Phone, Shield, FileText, PhoneCall, MapPin, ShieldCheck, 
  ChevronRight, X, Siren, CalendarCheck, Sparkles, AlertCircle, Info, Heart, Mail, MessageSquare, Star
} from 'lucide-react';
import { AppSettings } from '../types';
import { PostVisitFeedbackModal } from './PostVisitFeedbackModal';

interface Props {
  appSettings?: AppSettings;
  onOpenStaffLogin: () => void;
}

export const SettingsTab: React.FC<Props> = ({ appSettings, onOpenStaffLogin }) => {
  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState<boolean>(false);

  const phone1 = appSettings?.supportPhone || '9771264784';
  const phone2 = appSettings?.emergencyPhone || '7091472879';

  return (
    <div className="pb-28 pt-2 px-4 max-w-md mx-auto space-y-4">
      {/* Title */}
      <div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight">App Settings & Support</h2>
        <p className="text-xs text-slate-500 font-medium">Hello Doctor Healthcare Suite • 24x7 Patient Care</p>
      </div>

      {/* 🌟 1. HIGHLIGHTED BANNER: CALL TO BOOK APPOINTMENT */}
      <div className="bg-gradient-to-br from-sky-600 via-blue-700 to-indigo-800 rounded-3xl p-5 text-white shadow-lg relative overflow-hidden space-y-3 border border-sky-400/40">
        <div className="flex items-center space-x-2 text-sky-200 text-xs font-bold">
          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          <span>Telephonic OPD Booking Service</span>
        </div>

        <div>
          <h3 className="text-base font-black leading-snug">
            By Calling Appointment Book Krne Ke Liye
          </h3>
          <p className="text-xs text-sky-100 mt-1 leading-relaxed">
            Agar online token lene me koi dikkat ho, toh turant niche diye gaye numbers par call karke apna OPD token book karein:
          </p>
        </div>

        {/* Quick Dial Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <a
            href={`tel:${phone1}`}
            className="p-3 bg-white text-sky-900 rounded-2xl shadow-sm hover:bg-sky-50 transition-all flex flex-col items-center justify-center text-center group cursor-pointer active:scale-95"
          >
            <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center mb-1 group-hover:bg-sky-200 text-sky-700">
              <PhoneCall className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase">Call Line 1</span>
            <span className="text-xs font-black tracking-tight mt-0.5">{phone1}</span>
            <span className="text-[9px] font-bold text-sky-600 mt-1 bg-sky-50 px-2 py-0.5 rounded-full">
              Tap To Call
            </span>
          </a>

          <a
            href={`tel:${phone2}`}
            className="p-3 bg-white text-sky-900 rounded-2xl shadow-sm hover:bg-sky-50 transition-all flex flex-col items-center justify-center text-center group cursor-pointer active:scale-95"
          >
            <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center mb-1 group-hover:bg-sky-200 text-sky-700">
              <PhoneCall className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase">Call Line 2</span>
            <span className="text-xs font-black tracking-tight mt-0.5">{phone2}</span>
            <span className="text-[9px] font-bold text-sky-600 mt-1 bg-sky-50 px-2 py-0.5 rounded-full">
              Tap To Call
            </span>
          </a>
        </div>
      </div>

      {/* 🚑 2. AMBULANCE NUMBER (24x7 EMERGENCY DISPATCH) */}
      <div className="bg-gradient-to-r from-red-600 to-rose-700 rounded-2xl p-4 text-white shadow-md space-y-2.5 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Siren className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded uppercase tracking-wider">
                Emergency 24x7
              </span>
              <h3 className="font-extrabold text-sm mt-0.5">Ambulance Number (एम्बुलेंस को बुलाने के लिए)</h3>
            </div>
          </div>
          <span className="text-xs font-black bg-white text-red-700 px-2.5 py-1 rounded-full shadow-2xs">
            Free Govt / ICU
          </span>
        </div>

        <p className="text-xs text-red-100 leading-relaxed">
          Ambulance ko bulane ke liye 24x7 emergency helpline <strong>102</strong> ya <strong>108</strong> par turant call karein (Sadar Hospital Gopalganj & Sadar Hospital Siwan):
        </p>

        <div className="grid grid-cols-2 gap-2 pt-0.5">
          <a
            href="tel:102"
            className="py-2.5 px-3 bg-white text-red-700 rounded-xl font-black text-xs text-center flex flex-col items-center justify-center shadow-sm hover:bg-red-50 cursor-pointer active:scale-95"
          >
            <div className="flex items-center space-x-1">
              <Phone className="w-3.5 h-3.5 text-red-600" />
              <span className="text-base font-black">102</span>
            </div>
            <span className="text-[9px] font-bold text-red-600 uppercase mt-0.5">Free Govt Ambulance</span>
          </a>

          <a
            href="tel:108"
            className="py-2.5 px-3 bg-white text-red-700 rounded-xl font-black text-xs text-center flex flex-col items-center justify-center shadow-sm hover:bg-red-50 cursor-pointer active:scale-95"
          >
            <div className="flex items-center space-x-1">
              <Phone className="w-3.5 h-3.5 text-red-600" />
              <span className="text-base font-black">108</span>
            </div>
            <span className="text-[9px] font-bold text-red-600 uppercase mt-0.5">Emergency Ambulance</span>
          </a>
        </div>

        <div className="text-[10px] text-red-200 text-center font-medium pt-1">
          National Emergency Helpline: <a href="tel:112" className="underline font-bold text-white">Dial 112</a>
        </div>
      </div>

      {/* 📞 3. CONTACT & HELPLINE NUMBERS CARD */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {/* Helpline Number */}
        <div className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center">
                <PhoneCall className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-extrabold text-sm text-slate-900">Helpline Number</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                    24x7 Active
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">General patient guidance, doctor timings & token assistance</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <a
              href={`tel:${phone1}`}
              className="py-2 px-3 bg-slate-50 hover:bg-amber-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5 text-amber-600" />
              <span>{phone1}</span>
            </a>
            <a
              href={`tel:${phone2}`}
              className="py-2 px-3 bg-slate-50 hover:bg-amber-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5 text-amber-600" />
              <span>{phone2}</span>
            </a>
          </div>
        </div>

        {/* Contact Number */}
        <div className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center">
                <Phone className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-extrabold text-sm text-slate-900">Contact Number</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-100 text-sky-800">
                    Hospital Desk
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Doctor consultations, lab tests & appointment queries</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <a
              href={`tel:${phone1}`}
              className="py-2 px-3 bg-slate-50 hover:bg-sky-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5 text-sky-600" />
              <span>{phone1}</span>
            </a>
            <a
              href={`tel:${phone2}`}
              className="py-2 px-3 bg-slate-50 hover:bg-sky-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5 text-sky-600" />
              <span>{phone2}</span>
            </a>
          </div>
        </div>

        {/* Post-Visit Patient Feedback */}
        <button
          onClick={() => setShowFeedbackModal(true)}
          className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group cursor-pointer text-left"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Star className="w-5 h-5 stroke-[2.2] fill-amber-400" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-sm text-slate-900">Patient Care Feedback</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                  Rate Visit
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Rate doctor consultation, wait time, or share comments for admin
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-700" />
        </button>

        {/* Privacy Policy */}
        <button
          onClick={() => setActiveModal('privacy')}
          className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group cursor-pointer text-left"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <span className="font-extrabold text-sm text-slate-900">Privacy Policy</span>
              <p className="text-xs text-slate-500 mt-0.5">
                Health data confidentiality & encryption
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-700" />
        </button>

        {/* Terms & Services */}
        <button
          onClick={() => setActiveModal('terms')}
          className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group cursor-pointer text-left"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <span className="font-extrabold text-sm text-slate-900">Terms & Services</span>
              <p className="text-xs text-slate-500 mt-0.5">
                OPD token protocols, doctor consultation guidelines & policies
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-700" />
        </button>
      </div>

      {/* Hospital Location */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
          <MapPin className="w-4 h-4 text-sky-600" />
          <span className="text-sm font-extrabold text-slate-900">Sadar Hospital Gopalganj and Sadar Hospital Siwan</span>
        </div>

        <div className="space-y-2 text-xs text-slate-600 font-medium">
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/60">
            <span className="font-bold text-slate-900 block">🏥 Sadar Hospital Gopalganj</span>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
              Hospital Chowk, Sadar Hospital Road, Gopalganj, Bihar - 841428
            </p>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/60">
            <span className="font-bold text-slate-900 block">🏥 Sadar Hospital Siwan</span>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
              Hospital Road, Near Naya Bazar, Siwan, Bihar - 841226
            </p>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100">
          <span>OPD: 08:00 AM - 08:00 PM</span>
          <span className="font-semibold text-emerald-600">24/7 Casualty & Emergency Open</span>
        </div>
      </div>

      {/* Staff & Admin Portal Access */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-4 text-white shadow-xs space-y-3">
        <div className="flex items-center space-x-2 text-sky-400 text-xs font-bold">
          <ShieldCheck className="w-4 h-4" />
          <span>Hospital Administration & Reception Portal</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Authorized hospital staff, Group Admin, and Compounder login for live OPD token queue advancement and management.
        </p>
        <button
          onClick={onOpenStaffLogin}
          className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center space-x-2 cursor-pointer"
        >
          <span>Staff Login (Admin / Compounder)</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Privacy Policy Modal */}
      {activeModal === 'privacy' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2 text-slate-900 font-bold text-base">
                <Shield className="w-5 h-5 text-emerald-600" />
                <span>Privacy Policy</span>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-200/60 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto space-y-3 text-xs text-slate-600 leading-relaxed">
              <h4 className="font-extrabold text-sm text-slate-900">1. Commitment to Health Data Security</h4>
              <p>
                &quot;Hello Doctor&quot; adheres strictly to health data privacy guidelines. Your patient name, age, contact details, diagnostic records, and booking history are transmitted through encrypted Firestore channels.
              </p>

              <h4 className="font-extrabold text-sm text-slate-900 mt-3">2. Real-time OPD Token Anonymization</h4>
              <p>
                Live token numbers are broadcast strictly as queue markers (e.g. &quot;Token #14&quot;). Individual patient medical details and symptoms are kept private and confidential.
              </p>

              <h4 className="font-extrabold text-sm text-slate-900 mt-3">3. Diagnostic Lab & Doctor Home Visits</h4>
              <p>
                Doctor home visits and diagnostic lab sample collections are handled by verified medical personnel. Reports are delivered directly to the patient&apos;s registered phone number.
              </p>

              <h4 className="font-extrabold text-sm text-slate-900 mt-3">4. Contact Information & Privacy Officer</h4>
              <p>
                For any privacy inquiries, data deletion requests, or questions regarding this policy, you may contact our designated data protection team directly:
              </p>
              <div className="mt-2 p-3 bg-slate-100 rounded-xl flex items-center space-x-2 text-slate-800 font-semibold">
                <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Official Privacy Email:</span>
                <a 
                  href="mailto:satyamsingh36224@gmail.com" 
                  className="text-emerald-700 hover:text-emerald-800 underline font-bold"
                >
                  satyamsingh36224@gmail.com
                </a>
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 text-right">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                I Understand & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Terms & Services Modal */}
      {activeModal === 'terms' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2 text-slate-900 font-bold text-base">
                <FileText className="w-5 h-5 text-indigo-600" />
                <span>Terms & Services</span>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-200/60 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto space-y-3 text-xs text-slate-600 leading-relaxed">
              <h4 className="font-extrabold text-sm text-slate-900">1. Nature of OPD Token Allocation</h4>
              <p>
                Tokens booked via &quot;Hello Doctor&quot; represent an automated sequential priority number for outpatient consultation. Status is verified by Hospital Admin based on OPD room availability.
              </p>

              <h4 className="font-extrabold text-sm text-slate-900 mt-3">2. Medical Emergency Protocol</h4>
              <p>
                In case of emergency, users can call the 24x7 Ambulance / Emergency numbers: <strong>102</strong> (Free Govt Ambulance) or <strong>108</strong> (Emergency Ambulance).
              </p>

              <h4 className="font-extrabold text-sm text-slate-900 mt-3">3. Fee Settlement</h4>
              <p>
                All OPD consultation fees are payable directly at the hospital reception or OPD billing desk.
              </p>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 text-right">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Accept & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post-Visit Patient Feedback Modal */}
      {showFeedbackModal && (
        <PostVisitFeedbackModal
          onClose={() => setShowFeedbackModal(false)}
          onSuccess={() => setShowFeedbackModal(false)}
        />
      )}
    </div>
  );
};
