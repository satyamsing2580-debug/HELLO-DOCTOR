import React from 'react';
import { 
  X, Stethoscope, Star, MapPin, Clock, Award, 
  Calendar, CheckCircle, ShieldCheck, Activity, Share2, 
  Phone, Sparkles, Navigation, AlertCircle, Building2
} from 'lucide-react';
import { Doctor } from '../types';
import { DoctorAvatar } from './DoctorAvatar';

interface Props {
  doctor: Doctor;
  onClose: () => void;
  onBookToken: (doctor: Doctor) => void;
}

export const DoctorProfileModal: React.FC<Props> = ({
  doctor,
  onClose,
  onBookToken
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleShare = async () => {
    const shareData = {
      title: `${doctor.name} - ${doctor.specialty}`,
      text: `Consult with ${doctor.name} (${doctor.specialty}, ${doctor.experience}) at ${doctor.hospital}. Book instant live OPD Token on Hello Doctor app.`,
      url: window.location.href
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(
        `${doctor.name} (${doctor.specialty})\n${doctor.qualification}\nClinic: ${doctor.hospital} (${doctor.roomNumber})\nOPD Timing: ${doctor.timing}\nBook live token on Hello Doctor: ${window.location.href}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Ignored
    }
  };

  const getMapsUrl = () => {
    const query = encodeURIComponent(`${doctor.hospital}, Bihar`);
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150">
      <div 
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="doctor-profile-title"
      >
        {/* Modal Top Header with Colorful Banner */}
        <div className="relative bg-gradient-to-r from-sky-600 via-teal-600 to-cyan-700 text-white p-5 pb-6">
          <button
            onClick={onClose}
            aria-label="Close Doctor Profile"
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/20 hover:bg-black/30 text-white flex items-center justify-center transition-colors cursor-pointer z-10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start space-x-3.5 pr-8">
            <DoctorAvatar 
              emoji={doctor.emoji} 
              name={doctor.name} 
              size="lg" 
              className="bg-white/95 border-2 border-white/60 shadow-md ring-2 ring-white/30" 
            />

            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 backdrop-blur-xs px-2 py-0.5 rounded-full text-white border border-white/30">
                  Verified Doctor
                </span>
                <span className="text-[10px] font-bold bg-amber-400 text-slate-900 px-1.5 py-0.5 rounded flex items-center space-x-0.5">
                  <Star className="w-3 h-3 fill-current text-slate-900" />
                  <span>{doctor.rating}</span>
                </span>
              </div>

              <h2 id="doctor-profile-title" className="text-lg sm:text-xl font-black text-white mt-1 leading-snug truncate">
                {doctor.name}
              </h2>

              <p className="text-xs font-semibold text-sky-100 mt-0.5 flex items-center space-x-1">
                <Stethoscope className="w-3.5 h-3.5 shrink-0 text-sky-200" />
                <span className="truncate">{doctor.specialty}</span>
              </p>

              <div className="flex items-center space-x-2 mt-1.5 text-[11px] text-teal-100">
                <span className="font-bold">{doctor.experience}</span>
                <span>•</span>
                <span>{doctor.reviewCount}+ verified reviews</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live OPD Status Ticker Card */}
        <div className="bg-emerald-50/90 border-y border-emerald-200/80 px-4 py-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <div>
              <span className="font-extrabold text-emerald-950 block">
                Live OPD Token: <strong className="text-emerald-700">#{doctor.currentToken}</strong>
              </span>
              <span className="text-[10px] text-emerald-700 block font-medium">
                {doctor.totalTokensToday} tokens issued today • Queue actively progressing
              </span>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white shadow-2xs">
            {doctor.status === 'In OPD' ? '● Live In OPD' : doctor.status}
          </span>
        </div>

        {/* Scrollable Profile Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs text-slate-700 flex-1">
          {/* Key Quick Facts Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Experience</span>
              <span className="text-xs font-extrabold text-slate-900 mt-0.5 block flex items-center space-x-1">
                <Award className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span>{doctor.experience}</span>
              </span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">OPD Fee</span>
              <span className="text-xs font-black text-emerald-700 mt-0.5 block">
                ₹{doctor.consultationFee}
              </span>
              <span className="text-[9px] text-slate-400 leading-none">Pay at counter</span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Chamber</span>
              <span className="text-xs font-extrabold text-slate-900 mt-0.5 block truncate">
                {doctor.roomNumber}
              </span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Days Available</span>
              <span className="text-xs font-extrabold text-slate-900 mt-0.5 block truncate">
                {doctor.availableDays}
              </span>
            </div>
          </div>

          {/* Educational Qualifications */}
          <div className="p-3.5 bg-sky-50/60 border border-sky-100 rounded-2xl space-y-1.5">
            <div className="flex items-center space-x-2 text-sky-900 font-extrabold text-xs">
              <Award className="w-4 h-4 text-sky-600 shrink-0" />
              <span>Medical Qualifications & Certifications</span>
            </div>
            <p className="text-xs font-bold text-slate-800 pl-6 leading-relaxed">
              {doctor.qualification}
            </p>
            <div className="pl-6 flex items-center space-x-1.5 text-[10px] text-sky-700 font-medium">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>Registered Practitioner • Medical Council Recognized</span>
            </div>
          </div>

          {/* Professional Bio / About Doctor */}
          <div className="space-y-1.5">
            <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>About Dr. {doctor.name.replace(/^Dr\.\s*/i, '')}</span>
            </h4>
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
              <p className="text-xs text-slate-700 leading-relaxed font-normal">
                {doctor.bio || 
                  `${doctor.name} is a highly accomplished ${doctor.specialty} with over ${doctor.experience} of dedicated clinical practice. Known for patient-first diagnosis, comprehensive OPD treatment, and adherence to highest medical standards in Gopalganj and Siwan.`}
              </p>
            </div>
          </div>

          {/* Clinic / Hospital Address & Room */}
          <div className="space-y-1.5">
            <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
              <Building2 className="w-3.5 h-3.5 text-teal-600" />
              <span>Chamber & Clinic Location</span>
            </h4>

            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
              <div className="flex items-start space-x-2.5">
                <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="font-extrabold text-xs text-slate-900 leading-snug">
                    {doctor.hospital}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-semibold">
                    Consultation Room: <strong className="text-sky-700">{doctor.roomNumber}</strong>
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">Need help reaching clinic?</span>
                <a
                  href={getMapsUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-[11px] font-bold text-sky-700 hover:text-sky-800 hover:underline cursor-pointer"
                >
                  <Navigation className="w-3 h-3 text-sky-600" />
                  <span>Open in Google Maps</span>
                </a>
              </div>
            </div>
          </div>

          {/* OPD Timing & Schedule */}
          <div className="space-y-1.5">
            <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              <span>Consultation Schedule</span>
            </h4>

            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Days:</span>
                <span className="font-extrabold text-slate-900">{doctor.availableDays}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Daily OPD Hours:</span>
                <span className="font-extrabold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  {doctor.timing}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-200/60 leading-tight">
                * Please arrive at the OPD counter 10-15 minutes prior to your token call.
              </p>
            </div>
          </div>

          {/* Share Profile */}
          <div className="pt-1 flex items-center justify-between">
            <button
              type="button"
              onClick={handleShare}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-slate-500" />
              <span>{copied ? 'Profile Copied!' : 'Share Doctor Profile'}</span>
            </button>

            <span className="text-[10px] text-slate-400">
              Live Token Sync Enabled
            </span>
          </div>
        </div>

        {/* Fixed Bottom Booking Bar */}
        <div className="p-4 bg-white border-t border-slate-200/90 shadow-lg flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">
              Consultation Fee
            </span>
            <div className="flex items-baseline space-x-1">
              <span className="text-lg font-black text-slate-900">₹{doctor.consultationFee}</span>
              <span className="text-[10px] text-slate-500">/ OPD visit</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 flex-1 max-w-xs">
            <button
              type="button"
              onClick={() => {
                onClose();
                onBookToken(doctor);
              }}
              className="w-full py-3 px-4 bg-gradient-to-r from-sky-600 via-teal-600 to-cyan-600 hover:from-sky-700 hover:to-cyan-700 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-md shadow-sky-600/20 hover:shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer active:scale-[0.98]"
            >
              <Activity className="w-4 h-4 stroke-[2.5]" />
              <span>Book OPD Token</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
