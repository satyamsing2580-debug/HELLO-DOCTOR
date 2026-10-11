import React, { useState, useEffect } from 'react';
import { 
  Tag, Plus, Trash2, Edit2, Eye, EyeOff, Check, 
  Calendar, Percent, DollarSign, Clock, AlertCircle
} from 'lucide-react';
import { CouponCode } from '../../types';
import { realtimeDb } from '../../services/realtimeDb';

export const AdminCouponsCMS: React.FC = () => {
  const [coupons, setCoupons] = useState<CouponCode[]>(() => realtimeDb.getCoupons());
  const [isCreating, setIsCreating] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<CouponCode | null>(null);

  // Form State
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'fixed' | 'percentage'>('fixed');
  const [discountValue, setDiscountValue] = useState('50');
  const [minBookingValue, setMinBookingValue] = useState('200');
  const [maxDiscount, setMaxDiscount] = useState('100');
  const [usageLimit, setUsageLimit] = useState('500');
  const [expiryDate, setExpiryDate] = useState('2026-12-31');
  const [service, setService] = useState<'all' | 'opd' | 'home_visit' | 'lab'>('all');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    return realtimeDb.subscribeCoupons((list) => {
      setCoupons(list);
    });
  }, []);

  const resetForm = () => {
    setCode('');
    setDescription('');
    setDiscountType('fixed');
    setDiscountValue('50');
    setMinBookingValue('200');
    setMaxDiscount('100');
    setUsageLimit('500');
    setExpiryDate('2026-12-31');
    setService('all');
    setIsActive(true);
    setIsCreating(false);
    setEditingCoupon(null);
  };

  const handleStartEdit = (c: CouponCode) => {
    setEditingCoupon(c);
    setCode(c.code);
    setDescription(c.description);
    setDiscountType(c.discountType);
    setDiscountValue(c.discountValue.toString());
    setMinBookingValue(c.minBookingValue.toString());
    setMaxDiscount((c.maxDiscount || 100).toString());
    setUsageLimit((c.usageLimit || 500).toString());
    setExpiryDate(c.expiryDate || '2026-12-31');
    setService(c.applicableServices[0] || 'all');
    setIsActive(c.isActive);
    setIsCreating(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    const val = Number(discountValue) || 0;
    const minVal = Number(minBookingValue) || 0;
    const maxVal = Number(maxDiscount) || undefined;
    const limit = Number(usageLimit) || undefined;

    if (editingCoupon) {
      await realtimeDb.updateCoupon(editingCoupon.id, {
        code: code.trim().toUpperCase(),
        description: description.trim(),
        discountType,
        discountValue: val,
        minBookingValue: minVal,
        maxDiscount: maxVal,
        usageLimit: limit,
        expiryDate,
        applicableServices: [service],
        isActive
      });
    } else {
      await realtimeDb.addCoupon({
        code: code.trim().toUpperCase(),
        description: description.trim(),
        discountType,
        discountValue: val,
        minBookingValue: minVal,
        maxDiscount: maxVal,
        usageLimit: limit,
        expiryDate,
        applicableServices: [service],
        isActive
      });
    }

    resetForm();
  };

  const handleToggleActive = async (c: CouponCode) => {
    await realtimeDb.updateCoupon(c.id, { isActive: !c.isActive });
  };

  const handleDelete = async (c: CouponCode) => {
    if (window.confirm(`Delete coupon code ${c.code}?`)) {
      await realtimeDb.deleteCoupon(c.id);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-extrabold text-base text-slate-900 flex items-center space-x-2">
            <Tag className="w-5 h-5 text-emerald-600" />
            <span>Dynamic Coupon & Discount Engine</span>
          </h3>
          <p className="text-xs text-slate-500">
            {coupons.length} Active Vouchers & Patient Promo Codes
          </p>
        </div>

        {!isCreating && (
          <button
            onClick={() => {
              resetForm();
              setIsCreating(true);
            }}
            className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center space-x-1 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Coupon</span>
          </button>
        )}
      </div>

      {/* Create / Edit Form */}
      {isCreating && (
        <form onSubmit={handleSave} className="bg-white p-4 rounded-3xl border border-slate-200 shadow-md space-y-3.5 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h4 className="font-bold text-slate-900">
              {editingCoupon ? `Edit Coupon: ${editingCoupon.code}` : 'Create New Promotional Coupon'}
            </h4>
            <button
              type="button"
              onClick={resetForm}
              className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Coupon Code *</label>
              <input
                type="text"
                required
                placeholder="e.g. FLAT50, FREEOPD"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 uppercase"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Discount Type</label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="fixed">Fixed Rupee Off (₹)</option>
                <option value="percentage">Percentage Off (%)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Discount Value {discountType === 'fixed' ? '(₹)' : '(%)'} *
              </label>
              <input
                type="number"
                required
                min="1"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Min Booking Amount (₹) *</label>
              <input
                type="number"
                min="0"
                value={minBookingValue}
                onChange={(e) => setMinBookingValue(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Coupon Description *</label>
            <input
              type="text"
              required
              placeholder="e.g. Instant ₹50 off on OPD token consultation"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Applicable Service</label>
              <select
                value={service}
                onChange={(e) => setService(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="all">All Healthcare Services</option>
                <option value="opd">OPD Consultations Only</option>
                <option value="home_visit">Doctor Home Visits</option>
                <option value="lab">Diagnostic Lab Tests</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Expiry Date</label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center space-x-2">
            <button
              type="button"
              onClick={resetForm}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md cursor-pointer"
            >
              {editingCoupon ? 'Update Coupon' : 'Create & Activate Coupon'}
            </button>
          </div>
        </form>
      )}

      {/* Coupons List */}
      <div className="space-y-2.5">
        {coupons.map((c) => (
          <div
            key={c.id}
            className={`p-3.5 rounded-2xl border transition-all ${
              c.isActive
                ? 'bg-white border-slate-200/90 shadow-2xs'
                : 'bg-slate-50 border-slate-200 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-black text-sm px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {c.code}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                    {c.discountType === 'fixed' ? `₹${c.discountValue} OFF` : `${c.discountValue}% OFF`}
                  </span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                      c.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {c.isActive ? 'ACTIVE' : 'DISABLED'}
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 font-medium mt-1">{c.description}</p>
                
                <div className="flex items-center space-x-3 text-[10px] text-slate-400 mt-1.5">
                  <span>Min Value: ₹{c.minBookingValue}</span>
                  <span>•</span>
                  <span>Used: <strong>{c.usedCount}</strong> times</span>
                  {c.expiryDate && (
                    <>
                      <span>•</span>
                      <span>Expires: {c.expiryDate}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-1 shrink-0">
                <button
                  onClick={() => handleToggleActive(c)}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    c.isActive ? 'text-emerald-700 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-200'
                  }`}
                  title={c.isActive ? 'Disable' : 'Enable'}
                >
                  {c.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => handleStartEdit(c)}
                  className="p-1.5 text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded-lg cursor-pointer"
                  title="Edit Coupon"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(c)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                  title="Delete Coupon"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {coupons.length === 0 && (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-400 text-xs">
            No coupons configured. Tap &ldquo;Create Coupon&rdquo; to add promo codes.
          </div>
        )}
      </div>
    </div>
  );
};
