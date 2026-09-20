import React, { useState } from 'react';
import { X, Save, Stethoscope, User, DollarSign, Clock, MapPin, Award, Smile } from 'lucide-react';
import { Doctor } from '../types';

interface Props {
  doctorToEdit: Doctor | null; // null for add mode
  onClose: () => void;
  onSave: (docData: Omit<Doctor, 'id' | 'currentToken' | 'totalTokensToday'>) => void;
}

const DOCTOR_EMOJIS = ['👨‍⚕️', '👩‍⚕️', '🧑‍⚕️', '🩺', '🦷', '👁️', '👶', '🦴', '🌿', '✨', '👂', '🤰'];

export const DoctorEditModal: React.FC<Props> = ({ doctorToEdit, onClose, onSave }) => {
  const [name, setName] = useState(doctorToEdit?.name || '');
  const [specialty, setSpecialty] = useState(doctorToEdit?.specialty || 'General Physician & Diabetologist');
  const [qualification, setQualification] = useState(doctorToEdit?.qualification || 'MBBS, MD');
  const [experience, setExperience] = useState(doctorToEdit?.experience || '10 Years Exp.');
  const [hospital, setHospital] = useState(doctorToEdit?.hospital || 'Hospital Road, Gopalganj');
  const [roomNumber, setRoomNumber] = useState(doctorToEdit?.roomNumber || 'OPD-1');
  const [consultationFee, setConsultationFee] = useState(doctorToEdit?.consultationFee?.toString() || '400');
  const [timing, setTiming] = useState(doctorToEdit?.timing || '10:00 AM - 02:30 PM');
  const [availableDays, setAvailableDays] = useState(doctorToEdit?.availableDays || 'Mon - Sat');
  const [emoji, setEmoji] = useState(doctorToEdit?.emoji || '👨‍⚕️');
  const [status, setStatus] = useState<Doctor['status']>(doctorToEdit?.status || 'Available');
  const [bio, setBio] = useState(doctorToEdit?.bio || '');

  const specialtiesList = [
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
    'Cardiologist',
    'Neurologist'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      specialty: specialty.trim(),
      qualification: qualification.trim(),
      experience: experience.trim(),
      hospital: hospital.trim(),
      roomNumber: roomNumber.trim(),
      consultationFee: parseInt(consultationFee, 10) || 400,
      rating: doctorToEdit?.rating || 4.9,
      reviewCount: doctorToEdit?.reviewCount || 10,
      availableDays: availableDays.trim(),
      timing: timing.trim(),
      emoji: emoji.trim() || '👨‍⚕️',
      status,
      bio: bio.trim()
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Stethoscope className="w-5 h-5 text-sky-400" />
            <h3 className="font-extrabold text-sm">
              {doctorToEdit ? 'Live Doctor Edit Mode' : 'Add New Doctor to Registry'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-3.5 text-xs text-slate-700">
          <div>
            <label className="block font-bold text-slate-800 mb-1">
              Doctor Full Name & Title *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                placeholder="e.g. Dr. Rajesh Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Medical Specialty *
              </label>
              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              >
                {specialtiesList.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Consultation Fee (₹) *
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="number"
                  required
                  min="0"
                  step="50"
                  value={consultationFee}
                  onChange={(e) => setConsultationFee(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Qualification Degrees *
              </label>
              <div className="relative">
                <Award className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="MBBS, MD, DM"
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Years of Experience *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 14 Years Exp."
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Hospital / Clinic Name *
              </label>
              <input
                type="text"
                required
                placeholder="Apex Heart Clinic"
                value={hospital}
                onChange={(e) => setHospital(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">
                OPD Room Number *
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="OPD-102"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                OPD Timings *
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="09:00 AM - 01:30 PM"
                  value={timing}
                  onChange={(e) => setTiming(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Available Days
              </label>
              <input
                type="text"
                placeholder="Mon - Sat"
                value={availableDays}
                onChange={(e) => setAvailableDays(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">
              Doctor Avatar (Select Emoji) *
            </label>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl">
                {DOCTOR_EMOJIS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setEmoji(e)}
                    className={`w-10 h-10 text-2xl flex items-center justify-center rounded-xl transition-all ${
                      emoji === e
                        ? 'bg-sky-500 shadow-md scale-110 border-2 border-sky-600'
                        : 'bg-white border border-slate-200 hover:bg-sky-50'
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-500 font-medium">Selected Emoji:</span>
                <span className="text-2xl p-1 bg-sky-50 border border-sky-200 rounded-lg">{emoji}</span>
                <input
                  type="text"
                  maxLength={4}
                  placeholder="Custom emoji"
                  value={emoji}
                  onChange={(e) => setEmoji(e.target.value)}
                  className="w-28 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-center focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">
              OPD Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Doctor['status'])}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
            >
              <option value="Available">Available</option>
              <option value="In OPD">In OPD (Active Session)</option>
              <option value="On Break">On Break</option>
              <option value="Completed">OPD Completed for Today</option>
            </select>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{doctorToEdit ? 'Save Doctor Changes (Instant Sync)' : 'Register Doctor (Instant Sync)'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
