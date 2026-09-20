import React from 'react';
import { Stethoscope, ShieldCheck, UserCheck, BellRing, VolumeX } from 'lucide-react';
import { UserRole } from '../types';

interface Props {
  currentRole: UserRole;
  onOpenStaffLogin: () => void;
  onLogoutStaff: () => void;
  compounderDoctorName?: string;
  hasActiveAlarm: boolean;
  onAcknowledgeAlarm: () => void;
}

export const MobileAppHeader: React.FC<Props> = ({
  currentRole,
  onOpenStaffLogin,
  onLogoutStaff,
  compounderDoctorName,
  hasActiveAlarm,
  onAcknowledgeAlarm
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs safe-top">
      {/* Alarm Banner strictly restricted to Admin role only */}
      {currentRole === 'admin' && hasActiveAlarm && (
        <div className="bg-red-600 text-white px-3 py-2 flex items-center justify-between animate-pulse">
          <div className="flex items-center space-x-2 text-xs font-semibold">
            <BellRing className="w-4 h-4 animate-bounce" />
            <span>🚨 New Patient Booking Received! OPD Alert Siren Active</span>
          </div>
          <button
            onClick={onAcknowledgeAlarm}
            className="px-2.5 py-1 bg-white text-red-700 rounded-md text-xs font-bold shadow-xs hover:bg-red-50 flex items-center space-x-1 cursor-pointer"
          >
            <VolumeX className="w-3.5 h-3.5" />
            <span>Stop Alarm</span>
          </button>
        </div>
      )}

      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center space-x-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-sky-500/20">
            <Stethoscope className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-lg text-slate-900 tracking-tight">
                Hello Doctor
              </span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse"></span>
                LIVE OPD
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium leading-none mt-0.5">
              Instant OPD Tokens & Diagnostics
            </p>
          </div>
        </div>

        {/* Action Controls & Role Indicator (Staff login is kept only on Settings Page) */}
        {currentRole !== 'patient' && (
          <div className="flex items-center space-x-1.5">
            <span className="text-[11px] font-bold px-2 py-1 rounded-md bg-sky-100 text-sky-800 border border-sky-200 max-w-[120px] truncate">
              {currentRole === 'admin' ? 'Admin Desk' : (compounderDoctorName || 'Compounder')}
            </span>
            <button
              onClick={onLogoutStaff}
              className="text-[11px] font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2 py-1 rounded-md transition-colors cursor-pointer"
            >
              Exit
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
