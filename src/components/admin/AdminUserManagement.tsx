import React, { useState, useEffect } from 'react';
import { 
  Users, UserX, UserCheck, Search, ShieldAlert, Phone, 
  Calendar, Clock, CheckCircle2, AlertTriangle, ArrowUpDown, History
} from 'lucide-react';
import { PlatformUser, Appointment, LabBooking, HomeVisitBooking } from '../../types';
import { realtimeDb } from '../../services/realtimeDb';

interface Props {
  appointments: Appointment[];
  labBookings: LabBooking[];
  homeVisits: HomeVisitBooking[];
}

export const AdminUserManagement: React.FC<Props> = ({ appointments, labBookings, homeVisits }) => {
  const [users, setUsers] = useState<PlatformUser[]>(() => realtimeDb.getUsers());
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'patient' | 'compounder' | 'admin'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'blocked'>('all');
  const [selectedUserForHistory, setSelectedUserForHistory] = useState<PlatformUser | null>(null);
  const [userToBlock, setUserToBlock] = useState<PlatformUser | null>(null);
  const [blockReason, setBlockReason] = useState('Security policy violation / repeated fake bookings');
  const [customReason, setCustomReason] = useState('');
  const [statusToast, setStatusToast] = useState<string | null>(null);

  useEffect(() => {
    return realtimeDb.subscribeUsers((list) => {
      setUsers(list);
    });
  }, []);

  const showToast = (msg: string) => {
    setStatusToast(msg);
    setTimeout(() => setStatusToast(null), 3000);
  };

  const handleInitiateBlock = (user: PlatformUser) => {
    setUserToBlock(user);
    setBlockReason('Repeated fake / no-show bookings');
    setCustomReason('');
  };

  const handleConfirmBlock = async () => {
    if (!userToBlock) return;
    const finalReason = customReason.trim() ? customReason.trim() : blockReason;
    await realtimeDb.toggleUserBlockStatus(userToBlock.id, finalReason);
    showToast(`User ${userToBlock.name} (${userToBlock.phone}) has been BLOCKED.`);
    setUserToBlock(null);
  };

  const handleUnblockUser = async (user: PlatformUser) => {
    await realtimeDb.toggleUserBlockStatus(user.id);
    showToast(`User ${user.name} (${user.phone}) has been UNBLOCKED and is now Active.`);
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.phone.includes(search);
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Calculate user booking history when user is selected
  const userAppointments = selectedUserForHistory
    ? appointments.filter(
        (a) => a.patientPhone === selectedUserForHistory.phone || a.userId === selectedUserForHistory.id
      )
    : [];

  const userLabBookings = selectedUserForHistory
    ? labBookings.filter(
        (l) => l.patientPhone === selectedUserForHistory.phone || l.userId === selectedUserForHistory.id
      )
    : [];

  const userHomeVisits = selectedUserForHistory
    ? homeVisits.filter(
        (h) => h.patientPhone === selectedUserForHistory.phone || h.userId === selectedUserForHistory.id
      )
    : [];

  return (
    <div className="space-y-4">
      {/* Real-time Status Toast Notification */}
      {statusToast && (
        <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-lg flex items-center justify-between text-xs font-bold animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-200" />
            <span>{statusToast}</span>
          </div>
          <button
            onClick={() => setStatusToast(null)}
            className="p-1 text-emerald-200 hover:text-white rounded-md cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-extrabold text-base text-slate-900 flex items-center space-x-2">
            <Users className="w-5 h-5 text-sky-600" />
            <span>User & Patient Management</span>
          </h3>
          <p className="text-xs text-slate-500">
            {users.length} Total Users • {users.filter((u) => u.status === 'blocked').length} Blocked
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by phone number or patient name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          />
        </div>

        <div className="flex space-x-1.5 overflow-x-auto no-scrollbar text-[11px] font-bold">
          <button
            onClick={() => setRoleFilter('all')}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              roleFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Roles
          </button>
          <button
            onClick={() => setRoleFilter('patient')}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              roleFilter === 'patient' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Patients ({users.filter((u) => u.role === 'patient').length})
          </button>
          <button
            onClick={() => setRoleFilter('compounder')}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              roleFilter === 'compounder' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Compounders
          </button>
          <button
            onClick={() => setStatusFilter(statusFilter === 'all' ? 'blocked' : 'all')}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ml-auto flex items-center space-x-1 ${
              statusFilter === 'blocked' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            <ShieldAlert className="w-3 h-3" />
            <span>Blocked ({users.filter((u) => u.status === 'blocked').length})</span>
          </button>
        </div>
      </div>

      {/* Users List */}
      <div className="space-y-2.5">
        {filteredUsers.map((u) => {
          const isBlocked = u.status === 'blocked';
          return (
            <div
              key={u.id}
              className={`p-3.5 rounded-2xl border transition-all ${
                isBlocked
                  ? 'bg-rose-50/50 border-rose-200 shadow-2xs'
                  : 'bg-white border-slate-200/90 shadow-2xs'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-extrabold text-xs text-slate-900 truncate">{u.name}</h4>
                    <span
                      className={`text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                        u.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : u.role === 'compounder'
                          ? 'bg-teal-100 text-teal-800'
                          : 'bg-sky-100 text-sky-800'
                      }`}
                    >
                      {u.role}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                        isBlocked
                          ? 'bg-rose-600 text-white animate-pulse'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {isBlocked ? 'BLOCKED' : 'ACTIVE'}
                    </span>
                  </div>

                  <p className="text-[11px] font-mono font-bold text-slate-600 mt-1 flex items-center space-x-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{u.phone}</span>
                    {u.assignedDoctorName && (
                      <span className="text-[10px] text-teal-700 font-sans font-normal ml-1">
                        • Assigned: {u.assignedDoctorName}
                      </span>
                    )}
                  </p>

                  {isBlocked && u.blockedReason && (
                    <p className="text-[10px] text-rose-700 font-medium mt-1 flex items-center space-x-1">
                      <AlertTriangle className="w-3 h-3 shrink-0" />
                      <span>Reason: {u.blockedReason}</span>
                    </p>
                  )}

                  <div className="flex items-center space-x-3 text-[10px] text-slate-400 mt-1.5">
                    <span>Bookings: <strong>{u.totalBookings || 0}</strong></span>
                    <span>•</span>
                    <span>Last Active: {new Date(u.lastActive).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col space-y-1.5 shrink-0 items-end">
                  {isBlocked ? (
                    <button
                      onClick={() => handleUnblockUser(u)}
                      className="px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center space-x-1 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Unblock</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleInitiateBlock(u)}
                      className="px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center space-x-1 cursor-pointer bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200"
                    >
                      <UserX className="w-3.5 h-3.5" />
                      <span>Block User</span>
                    </button>
                  )}

                  <button
                    onClick={() => setSelectedUserForHistory(u)}
                    className="text-[10px] text-sky-600 hover:text-sky-800 font-bold flex items-center space-x-0.5 cursor-pointer"
                  >
                    <History className="w-3 h-3" />
                    <span>View History</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredUsers.length === 0 && (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-400 text-xs">
            No users found matching current filters.
          </div>
        )}
      </div>

      {/* Booking History Modal */}
      {selectedUserForHistory && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[85vh]">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-sm">{selectedUserForHistory.name}&apos;s Activity History</h4>
                <p className="text-[11px] text-slate-400 font-mono">{selectedUserForHistory.phone}</p>
              </div>
              <button
                onClick={() => setSelectedUserForHistory(null)}
                className="p-1 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 text-xs">
              <div>
                <h5 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] mb-2">
                  OPD Appointments ({userAppointments.length})
                </h5>
                <div className="space-y-1.5">
                  {userAppointments.map((apt) => (
                    <div key={apt.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between font-bold text-slate-900">
                        <span>{apt.doctorName}</span>
                        <span className="text-sky-600">Token #{apt.tokenNumber}</span>
                      </div>
                      <p className="text-[11px] text-slate-500">{apt.bookingDate} • {apt.timeSlot} • Status: {apt.status}</p>
                    </div>
                  ))}
                  {userAppointments.length === 0 && (
                    <p className="text-slate-400 text-[11px] italic">No OPD appointments recorded.</p>
                  )}
                </div>
              </div>

              <div>
                <h5 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] mb-2">
                  Diagnostic Lab Bookings ({userLabBookings.length})
                </h5>
                <div className="space-y-1.5">
                  {userLabBookings.map((lab) => (
                    <div key={lab.id} className="p-2.5 bg-teal-50/50 rounded-xl border border-teal-100">
                      <div className="flex items-center justify-between font-bold text-slate-900">
                        <span>{lab.testName}</span>
                        <span className="text-teal-700">₹{lab.price}</span>
                      </div>
                      <p className="text-[11px] text-slate-500">{lab.date} • {lab.bookingType} • Status: {lab.status}</p>
                    </div>
                  ))}
                  {userLabBookings.length === 0 && (
                    <p className="text-slate-400 text-[11px] italic">No lab test bookings recorded.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Block User Confirmation Modal */}
      {userToBlock && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col animate-in zoom-in-95 duration-150">
            <div className="p-4 bg-rose-600 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <UserX className="w-5 h-5 text-rose-200" />
                <h4 className="font-extrabold text-sm">Block User Account</h4>
              </div>
              <button
                onClick={() => setUserToBlock(null)}
                className="p-1 text-rose-200 hover:text-white rounded-full hover:bg-rose-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-3.5 text-xs">
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-2xl">
                <p className="font-bold text-slate-800 text-sm">{userToBlock.name}</p>
                <p className="text-slate-500 font-mono text-xs">{userToBlock.phone} • Role: {userToBlock.role}</p>
                <p className="text-[11px] text-rose-700 mt-1">
                  Blocking will prevent this user from booking new OPD tokens or home visits.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5 text-xs">
                  Select Reason for Blocking:
                </label>
                <div className="grid grid-cols-1 gap-1.5">
                  {[
                    'Repeated fake / no-show bookings',
                    'Security policy violation',
                    'Invalid or fraudulent contact details',
                    'Harassment / abuse of hospital counter staff',
                    'Administrative policy restriction'
                  ].map((r) => (
                    <button
                      type="button"
                      key={r}
                      onClick={() => {
                        setBlockReason(r);
                        setCustomReason('');
                      }}
                      className={`p-2 rounded-xl text-left text-[11px] font-medium transition-all cursor-pointer border ${
                        blockReason === r && !customReason
                          ? 'bg-rose-50 border-rose-400 text-rose-800 font-bold'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 text-[11px]">
                  Or Custom Specific Reason:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Multiple unpaid cancellations..."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setUserToBlock(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmBlock}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md cursor-pointer flex items-center justify-center space-x-1"
                >
                  <UserX className="w-4 h-4" />
                  <span>Confirm Block</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
