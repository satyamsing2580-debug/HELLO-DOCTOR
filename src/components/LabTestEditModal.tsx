import React, { useState } from 'react';
import { X, Save, FlaskConical, DollarSign, Clock, Sparkles, FileText, CheckCircle2, Activity } from 'lucide-react';
import { LabTest } from '../types';

interface Props {
  testToEdit: LabTest | null; // null for add mode
  onClose: () => void;
  onSave: (testData: Omit<LabTest, 'id'>) => void;
}

const PRESET_CATEGORIES = [
  'Blood Tests',
  'Heart Health',
  'Thyroid',
  'Diabetes',
  'Liver Care',
  'Kidney Care',
  'Vitamins & Immunity',
  'Full Body Checkup',
  'Infection & Fevers',
  'Hormones & Fertility'
];

const SAMPLE_TYPES = [
  'Blood Sample',
  'Blood & Urine Sample',
  'Urine Sample',
  'Fasting Blood Sample',
  'Swab Sample',
  'Stool Sample'
];

const REPORT_TIMES = [
  'Within 6 hrs',
  'Within 12 hrs',
  'Within 24 hrs',
  '24 - 48 hrs',
  'Same Day Evening',
  'Within 3 days'
];

export const LabTestEditModal: React.FC<Props> = ({ testToEdit, onClose, onSave }) => {
  const [name, setName] = useState(testToEdit?.name || '');
  const [category, setCategory] = useState(testToEdit?.category || 'Blood Tests');
  const [customCategory, setCustomCategory] = useState('');
  const [price, setPrice] = useState(testToEdit?.price?.toString() || '499');
  const [originalPrice, setOriginalPrice] = useState(testToEdit?.originalPrice?.toString() || '999');
  const [fastingRequired, setFastingRequired] = useState(testToEdit?.fastingRequired ?? false);
  const [sampleType, setSampleType] = useState(testToEdit?.sampleType || 'Blood Sample');
  const [reportTime, setReportTime] = useState(testToEdit?.reportTime || 'Within 24 hrs');
  const [popular, setPopular] = useState(testToEdit?.popular ?? false);
  const [description, setDescription] = useState(testToEdit?.description || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const finalCategory = category === 'Custom' ? (customCategory.trim() || 'General Diagnostics') : category;
    const numericPrice = parseInt(price, 10) || 0;
    const numericOriginalPrice = parseInt(originalPrice, 10) || numericPrice;

    onSave({
      name: name.trim(),
      category: finalCategory,
      price: numericPrice,
      originalPrice: Math.max(numericOriginalPrice, numericPrice),
      fastingRequired,
      sampleType: sampleType.trim() || 'Blood Sample',
      reportTime: reportTime.trim() || 'Within 24 hrs',
      popular,
      description: description.trim() || 'Comprehensive clinical laboratory evaluation.'
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 bg-teal-800 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FlaskConical className="w-5 h-5 text-teal-200" />
            <h3 className="font-extrabold text-sm">
              {testToEdit ? 'Edit Diagnostic Lab Test' : 'Add New Lab Test to Catalog'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-teal-200 hover:text-white rounded-full hover:bg-teal-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs text-slate-700">
          {/* Test Name */}
          <div>
            <label className="block font-bold text-slate-800 mb-1">
              Lab Test Name *
            </label>
            <div className="relative">
              <Activity className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                placeholder="e.g. Complete Blood Count (CBC) with ESR"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
          </div>

          {/* Category Selection */}
          <div>
            <label className="block font-bold text-slate-800 mb-1">
              Clinical Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            >
              {PRESET_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
              <option value="Custom">+ Other Custom Category</option>
            </select>
            {category === 'Custom' && (
              <input
                type="text"
                placeholder="Enter custom category name"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="w-full mt-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            )}
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Discounted Price (₹) *
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="number"
                  min="0"
                  required
                  placeholder="499"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Original Price (₹)
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="number"
                  min="0"
                  placeholder="999"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Preparation Details (Fasting, Sample Type, Report Time) */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block">
              Preparation & Technical Specifications
            </span>

            {/* Fasting Requirement */}
            <div>
              <label className="block font-bold text-slate-800 mb-1.5">
                Fasting Requirement *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFastingRequired(false)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                    !fastingRequired
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>No Fasting Needed</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFastingRequired(true)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                    fastingRequired
                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>10-12 hrs Fasting Req.</span>
                </button>
              </div>
            </div>

            {/* Sample Type & Report Turnaround */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Sample Type
                </label>
                <select
                  value={sampleType}
                  onChange={(e) => setSampleType(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500/20"
                >
                  {SAMPLE_TYPES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Report Delivery
                </label>
                <select
                  value={reportTime}
                  onChange={(e) => setReportTime(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500/20"
                >
                  {REPORT_TIMES.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Popular Tag Toggle */}
          <div className="flex items-center justify-between p-3 bg-teal-50/60 rounded-xl border border-teal-200/70">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <div>
                <span className="font-bold text-teal-950 block">Mark as Popular / Recommended</span>
                <span className="text-[10px] text-teal-700">Highlighted with a badge in the patient test list</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={popular}
              onChange={(e) => setPopular(e.target.checked)}
              className="w-5 h-5 accent-teal-600 rounded cursor-pointer"
            />
          </div>

          {/* Description & Clinical Notes */}
          <div>
            <label className="block font-bold text-slate-800 mb-1">
              Description & Parameters Tested *
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <textarea
                required
                rows={3}
                placeholder="Briefly describe what this test detects (e.g. Evaluates Hemoglobin, RBC, WBC, Platelets, and ESR to diagnose anemia, viral fever, and infections)."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-extrabold rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{testToEdit ? 'Save Lab Test' : 'Publish Test'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
