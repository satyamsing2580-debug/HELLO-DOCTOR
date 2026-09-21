import React, { useState } from 'react';
import { 
  X, ShieldCheck, Building2, Banknote, CheckCircle2, 
  ArrowRight, Loader2, Sparkles, AlertCircle, Clock, MapPin, Receipt
} from 'lucide-react';
import { PaymentDetails } from '../types';
import { paymentGateway, CounterPaymentType, COUNTER_PAYMENT_CONFIGS } from '../services/paymentGateway';

interface Props {
  amount: number;
  serviceTitle: string;
  serviceSubtitle: string;
  patientName: string;
  patientPhone: string;
  allowCounterPayment?: boolean;
  counterPaymentLabel?: string;
  counterPaymentType?: CounterPaymentType;
  onClose: () => void;
  onPaymentSuccess: (paymentDetails: PaymentDetails) => void;
}

export const PaymentCheckoutModal: React.FC<Props> = ({
  amount,
  serviceTitle,
  serviceSubtitle,
  patientName,
  patientPhone,
  allowCounterPayment = true,
  counterPaymentLabel,
  counterPaymentType = 'AT_COUNTER',
  onClose,
  onPaymentSuccess,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'counter'>('counter');

  const config = COUNTER_PAYMENT_CONFIGS[counterPaymentType] || COUNTER_PAYMENT_CONFIGS.AT_COUNTER;
  const displayLabel = counterPaymentLabel || config.label;

  const handleConfirmPayAtCounter = async () => {
    setIsProcessing(true);
    // Brief deliberate transition for visual feedback
    await new Promise((r) => setTimeout(r, 450));
    const record = paymentGateway.createCounterPaymentRecord(amount, counterPaymentType);
    onPaymentSuccess(record);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
        
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm tracking-tight">Hospital Desk Checkout</h3>
              <p className="text-[11px] text-slate-300">HELLO DOCTORRR • Pay at Clinic Counter</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Summary Header */}
        <div className="p-4 bg-emerald-50/70 border-b border-emerald-100 flex items-center justify-between">
          <div className="min-w-0 pr-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-full inline-flex items-center space-x-1">
              <Receipt className="w-2.5 h-2.5 mr-0.5" />
              <span>Bill Summary</span>
            </span>
            <h4 className="font-bold text-sm text-slate-900 mt-1 truncate">{serviceTitle}</h4>
            <p className="text-xs text-slate-500 truncate">{serviceSubtitle}</p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Total Payable</span>
            <span className="text-xl font-black text-emerald-700">₹{amount}</span>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1 text-slate-800">
          
          {/* Patient Details Snapshot */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Patient</span>
              <span className="font-bold text-slate-800 text-xs">{patientName}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Contact</span>
              <span className="font-semibold text-slate-700 text-xs">+91 {patientPhone}</span>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Payment & Settlement Method
            </label>

            {/* Primary Pay at Counter Card */}
            <div
              onClick={() => setSelectedMethod('counter')}
              className="p-3.5 rounded-2xl border-2 border-emerald-500 bg-emerald-50/50 shadow-xs flex items-start space-x-3 cursor-pointer transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                <Banknote className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-950">
                    {displayLabel}
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 ml-1" />
                </div>
                <p className="text-[11px] text-emerald-900/90 font-medium mt-0.5 leading-relaxed">
                  {config.sublabel}
                </p>
                <div className="mt-2 inline-flex items-center space-x-1 text-[10px] font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-md">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>No Online Gateway Needed • Pay in Cash</span>
                </div>
              </div>
            </div>
          </div>

          {/* Billing Calculation Breakdown */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-600">
              <span>Consultation / Service Fee</span>
              <span className="font-semibold text-slate-800">₹{amount}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Online Convenience Charges</span>
              <span className="font-semibold text-emerald-600">₹0 (Free)</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Appointment Token Generation</span>
              <span className="font-semibold text-emerald-600">Included</span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between font-bold text-slate-900">
              <span>Amount Due at Counter</span>
              <span className="text-base text-emerald-700">₹{amount}</span>
            </div>
          </div>

          {/* Hospital Counter Instructions */}
          <div className="p-3 bg-amber-50/80 rounded-2xl border border-amber-200/90 text-xs text-amber-900 space-y-1">
            <div className="flex items-center space-x-1.5 font-bold">
              <Clock className="w-3.5 h-3.5 text-amber-700" />
              <span>Counter Payment Instructions</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Upon booking confirmation, your official Token Number and digital receipt will be generated. Please show the token at the hospital/clinic reception desk and settle ₹{amount} in cash before entering the doctor&apos;s OPD chamber.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/70 space-y-2">
          {isProcessing ? (
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center space-x-3 text-emerald-900 text-xs">
              <Loader2 className="w-5 h-5 animate-spin text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold">Assigning Live Token Number...</p>
                <p className="text-[11px] text-emerald-700">Generating cash settlement receipt slip.</p>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleConfirmPayAtCounter}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl shadow-md shadow-emerald-600/25 flex items-center justify-center space-x-2 cursor-pointer active:scale-[0.99] transition-all"
            >
              <Banknote className="w-4 h-4" />
              <span>Pay Cash at Hospital / Counter (₹{amount})</span>
            </button>
          )}

          <div className="flex items-center justify-center space-x-3 text-[10px] text-slate-400 pt-1">
            <span className="flex items-center space-x-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>Verified Hospital OPD Token</span>
            </span>
            <span>•</span>
            <span>Zero Advance Charges</span>
            <span>•</span>
            <span>Instant Confirmation</span>
          </div>
        </div>
      </div>
    </div>
  );
};
