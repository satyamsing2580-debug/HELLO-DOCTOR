import React, { useState } from 'react';
import { 
  Star, X, MessageSquare, CheckCircle2, ThumbsUp, 
  Clock, ShieldCheck, User, Sparkles, Building2
} from 'lucide-react';
import { realtimeDb } from '../services/realtimeDb';
import { userAuth } from '../services/userAuth';
import { Appointment, HomeVisitBooking, LabBooking, MedicineOrder } from '../types';

interface Props {
  onClose: () => void;
  booking?: Appointment | HomeVisitBooking | LabBooking | MedicineOrder | null;
  defaultServiceType?: 'OPD Consultation' | 'Doctor Home Visit' | 'Diagnostic Lab Test' | 'Medicine Delivery' | 'General Clinic Care';
  defaultDoctorName?: string;
  onSuccess?: () => void;
}

export const PostVisitFeedbackModal: React.FC<Props> = ({
  onClose,
  booking,
  defaultServiceType = 'OPD Consultation',
  defaultDoctorName = '',
  onSuccess
}) => {
  // Infer defaults from booking if provided
  const inferDoctorName = () => {
    if (defaultDoctorName) return defaultDoctorName;
    if (booking && 'doctorName' in booking && booking.doctorName) return booking.doctorName;
    return 'Dr. Akhilesh Kumar';
  };

  const inferPatientName = () => {
    if (booking && 'patientName' in booking && booking.patientName) return booking.patientName;
    return userAuth.getUserName() || '';
  };

  const inferPatientPhone = () => {
    if (booking && 'patientPhone' in booking && booking.patientPhone) return booking.patientPhone;
    return userAuth.getUserPhone() || '';
  };

  const [serviceType, setServiceType] = useState<
    'OPD Consultation' | 'Doctor Home Visit' | 'Diagnostic Lab Test' | 'Medicine Delivery' | 'General Clinic Care'
  >(defaultServiceType);
  const [doctorName, setDoctorName] = useState<string>(inferDoctorName());
  const [patientName, setPatientName] = useState<string>(inferPatientName());
  const [patientPhone, setPatientPhone] = useState<string>(inferPatientPhone());
  
  // Rating states (1 to 5)
  const [rating, setRating] = useState<number>(5);
  const [doctorRating, setDoctorRating] = useState<number>(5);
  const [waitingTimeRating, setWaitingTimeRating] = useState<number>(5);
  const [staffRating, setStaffRating] = useState<number>(5);
  const [cleanlinessRating, setCleanlinessRating] = useState<number>(5);

  const [comments, setComments] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) {
      setErrorMsg('Please enter your name');
      return;
    }
    if (!patientPhone.trim() || patientPhone.trim().length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await realtimeDb.submitPatientFeedback({
        patientName: patientName.trim(),
        patientPhone: patientPhone.trim(),
        bookingId: booking?.id,
        doctorName: serviceType === 'OPD Consultation' || serviceType === 'Doctor Home Visit' ? doctorName : undefined,
        serviceType,
        rating,
        doctorRating,
        waitingTimeRating,
        staffRating,
        cleanlinessRating,
        comments: comments.trim(),
      });

      setIsSubmitted(true);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Feedback submit error:', err);
      setErrorMsg('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStarPicker = (
    value: number, 
    onChange: (val: number) => void,
    label: string,
    iconColor = 'text-amber-400'
  ) => {
    return (
      <div className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
        <span className="text-xs font-semibold text-slate-700">{label}</span>
        <div className="flex items-center space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              className="p-1 text-slate-300 hover:scale-110 active:scale-95 transition-all cursor-pointer"
            >
              <Star 
                className={`w-5 h-5 ${star <= value ? `${iconColor} fill-current` : 'text-slate-200'}`} 
              />
            </button>
          ))}
          <span className="text-xs font-bold text-slate-600 w-6 text-right ml-1">
            {value}/5
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 bg-linear-to-r from-sky-600 to-teal-600 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Post-Visit Patient Feedback</h3>
              <p className="text-[11px] text-sky-100">Help the Clinic Admin improve patient care</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-slate-700 text-xs">
          {isSubmitted ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-extrabold text-slate-900">Thank You For Your Feedback!</h4>
                <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
                  Your rating and comments have been delivered directly to the Clinic Administrator. Your voice helps us maintain fair queue times and compassionate medical care.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 text-left space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Patient:</span>
                  <strong className="text-slate-900">{patientName}</strong>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Service:</span>
                  <strong className="text-slate-900">{serviceType}</strong>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Overall Rating:</span>
                  <strong className="text-amber-600 flex items-center space-x-1">
                    <span>{rating} / 5</span>
                    <Star className="w-3.5 h-3.5 fill-current text-amber-500" />
                  </strong>
                </div>
                {comments && (
                  <div className="pt-1 border-t border-slate-200/60 text-slate-600 text-[11px] italic">
                    &ldquo;{comments}&rdquo;
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl cursor-pointer transition-all shadow-md shadow-sky-600/20"
              >
                Close & Return
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-semibold">
                  {errorMsg}
                </div>
              )}

              {/* Service & Doctor Selection */}
              <div className="space-y-3 bg-slate-50 p-3 rounded-2xl border border-slate-200/70">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Healthcare Service Received
                  </label>
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-sky-500/20 focus:outline-none"
                  >
                    <option value="OPD Consultation">OPD Consultation (Clinic Visit)</option>
                    <option value="Doctor Home Visit">Doctor Home Visit</option>
                    <option value="Diagnostic Lab Test">Diagnostic Lab Test / Blood Sample</option>
                    <option value="Medicine Delivery">Prescription Medicine Delivery</option>
                    <option value="General Clinic Care">General Clinic Care / Reception Service</option>
                  </select>
                </div>

                {(serviceType === 'OPD Consultation' || serviceType === 'Doctor Home Visit') && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Attending Doctor
                    </label>
                    <input
                      type="text"
                      value={doctorName}
                      onChange={(e) => setDoctorName(e.target.value)}
                      placeholder="e.g. Dr. Akhilesh Kumar, Dr. Kaumudi Raj..."
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500/20 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Patient Info */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Your Name
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      required
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="Patient name"
                      className="w-full pl-8 pr-2 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500/20 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="10-digit mobile"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500/20 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Rating Scale Breakdown */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70 space-y-1">
                <div className="flex items-center justify-between pb-2 mb-1 border-b border-slate-200">
                  <span className="font-extrabold text-xs text-slate-900 flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Rate Your Experience</span>
                  </span>
                  <span className="text-[11px] text-slate-500">Tap stars to rate</span>
                </div>

                {renderStarPicker(rating, setRating, 'Overall Satisfaction ⭐', 'text-amber-500')}
                {renderStarPicker(doctorRating, setDoctorRating, 'Doctor Consultation & Diagnosis')}
                {renderStarPicker(waitingTimeRating, setWaitingTimeRating, 'Queue & Token Wait Time')}
                {renderStarPicker(staffRating, setStaffRating, 'Compounder / Counter Staff')}
                {renderStarPicker(cleanlinessRating, setCleanlinessRating, 'Clinic Hygiene & Cleanliness')}
              </div>

              {/* Comments & Suggestions */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Comments & Suggestions for Clinic Admin</span>
                  <span className="text-[10px] text-slate-400 font-normal">Directly reviewed</span>
                </label>
                <textarea
                  rows={3}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Share details about your visit, doctor advice, token queue experience, or suggestions to help us improve..."
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500/20 focus:outline-none transition-all placeholder:text-slate-400 leading-relaxed"
                />
              </div>

              {/* Privacy Notice */}
              <div className="flex items-start space-x-2 text-[10px] text-slate-500 bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p>
                  Your feedback is kept confidential and shared only with our administrative quality committee to improve clinical standards.
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 text-white font-bold rounded-xl cursor-pointer transition-all shadow-md shadow-sky-600/20 flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <span>Submitting Feedback to Admin...</span>
                ) : (
                  <>
                    <ThumbsUp className="w-4 h-4" />
                    <span>Submit Feedback to Clinic Admin</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
