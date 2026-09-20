import React, { useState } from 'react';
import { X, Upload, CheckCircle2, AlertCircle, ShoppingBag, Truck, FileText, Image as ImageIcon } from 'lucide-react';
import { realtimeDb } from '../services/realtimeDb';

interface MedicineDeliveryModalProps {
  onClose: () => void;
  onSuccess: () => void;
  deliveryFee: number;
}

export const MedicineDeliveryModal: React.FC<MedicineDeliveryModalProps> = ({
  onClose,
  onSuccess,
  deliveryFee
}) => {
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [address, setAddress] = useState('');
  const [medicinesList, setMedicinesList] = useState('');
  const [prescriptionImage, setPrescriptionImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please upload a valid image file (JPG, PNG).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setPrescriptionImage(uploadEvent.target?.result as string);
      setErrorMessage('');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim() || !patientPhone.trim() || !address.trim()) {
      setErrorMessage('Please fill in Name, Phone, and Full Address.');
      return;
    }

    if (!medicinesList.trim() && !prescriptionImage) {
      setErrorMessage('Please write required medicines or upload a prescription image.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await realtimeDb.orderMedicines({
        patientName: patientName.trim(),
        patientPhone: patientPhone.trim(),
        address: address.trim(),
        medicinesList: medicinesList.trim() || 'Prescription uploaded by patient',
        prescriptionImage: prescriptionImage || undefined,
        deliveryFee
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to place medicine order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-4 py-3.5 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-xl">
              🚚
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">Ghar Par Dawai Delivery</h3>
              <p className="text-xs text-emerald-100 font-medium">Home Delivery of Authentic Medicines</p>
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
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-3.5 text-sm flex-1">
          {errorMessage && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Delivery Info Banner */}
          <div className="bg-emerald-50/80 border border-emerald-100 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Truck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span className="text-xs font-semibold text-emerald-900">Doorstep Delivery Charge</span>
            </div>
            <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-600 text-white">
              ₹{deliveryFee} Flat
            </span>
          </div>

          {/* Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Patient / Customer Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Kumar"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Contact Mobile Number *
              </label>
              <input
                type="tel"
                required
                placeholder="10-digit mobile"
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
              />
            </div>
          </div>

          {/* Delivery Address */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Complete Delivery Address (Gopalganj / Siwan) *
            </label>
            <textarea
              required
              rows={2}
              placeholder="House/Ward number, Street/Mohalla, Landmark, City..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50 resize-none"
            />
          </div>

          {/* Medicines List */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              List of Medicines / Dosage (Or upload prescription below)
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Paracetamol 650mg (1 strip), Azithromycin 500mg, Cough Syrup..."
              value={medicinesList}
              onChange={(e) => setMedicinesList(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50 resize-none"
            />
          </div>

          {/* Upload Prescription */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Upload Prescription (Doctor Parchi Photo)
            </label>
            {prescriptionImage ? (
              <div className="relative border border-emerald-200 rounded-xl p-2 bg-emerald-50/40 flex items-center space-x-3">
                <img
                  src={prescriptionImage}
                  alt="Prescription preview"
                  className="w-16 h-16 object-cover rounded-lg border border-emerald-200 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1 text-xs font-bold text-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Prescription Attached</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">Verified photo ready to send to pharmacy</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPrescriptionImage(null)}
                  className="px-2 py-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                >
                  Remove
                </button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-slate-200 hover:border-emerald-400 rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50/50 text-center">
                <Upload className="w-5 h-5 text-emerald-600 mb-1" />
                <span className="text-xs font-semibold text-slate-700">Click or Drag to Upload Parchi</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Supports camera photo or gallery image (JPG, PNG)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Summary Box */}
          <div className="p-3 bg-slate-100/70 rounded-xl space-y-1 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Medicine Cost:</span>
              <span className="font-semibold text-slate-800">Calculated after pharmacy review</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Delivery Fee:</span>
              <span className="font-semibold text-emerald-700">₹{deliveryFee}</span>
            </div>
            <p className="text-[10px] text-slate-500 pt-1 border-t border-slate-200">
              Genuine medicines will be packed securely and dispatched via local delivery executive.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Placing Delivery Order...</span>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span>Confirm Medicine Order (₹{deliveryFee})</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
