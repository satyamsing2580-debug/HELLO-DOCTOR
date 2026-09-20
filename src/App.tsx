import React, { useState, useEffect } from 'react';
import { Doctor, Appointment, LabTest, LabBooking, MedicineOrder, HomeVisitBooking, AppSettings, UserRole } from './types';
import { realtimeDb } from './services/realtimeDb';
import { MobileAppHeader } from './components/MobileAppHeader';
import { BottomNavigation, TabType } from './components/BottomNavigation';
import { HomeTab } from './components/HomeTab';
import { MyBookingsTab } from './components/MyBookingsTab';
import { LabTestsTab } from './components/LabTestsTab';
import { SettingsTab } from './components/SettingsTab';
import { StaffLoginModal } from './components/StaffLoginModal';
import { GroupAdminDashboard } from './components/GroupAdminDashboard';
import { CompounderDashboard } from './components/CompounderDashboard';
import { sirenManager } from './services/audioSiren';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [currentRole, setCurrentRole] = useState<UserRole>('patient');
  const [compounderDoctorName, setCompounderDoctorName] = useState<string>('');
  const [isStaffLoginOpen, setIsStaffLoginOpen] = useState(false);

  // Real-time synced data state
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [labBookings, setLabBookings] = useState<LabBooking[]>([]);
  const [medicineOrders, setMedicineOrders] = useState<MedicineOrder[]>([]);
  const [homeVisits, setHomeVisits] = useState<HomeVisitBooking[]>([]);
  const [appSettings, setAppSettings] = useState<AppSettings>(realtimeDb.getAppSettings());
  const [hasActiveAlarm, setHasActiveAlarm] = useState(false);

  // Establish Real-time Subscriptions (onSnapshot equivalent with Firestore)
  useEffect(() => {
    const unsubDoctors = realtimeDb.subscribeDoctors((newDocs) => {
      setDoctors(newDocs);
    });

    const unsubAppointments = realtimeDb.subscribeAppointments((newApts) => {
      setAppointments(newApts);
    });

    const unsubLabTests = realtimeDb.subscribeLabTests((newLabs) => {
      setLabTests(newLabs);
    });

    const unsubLabBookings = realtimeDb.subscribeLabBookings((newBookings) => {
      setLabBookings(newBookings);
    });

    const unsubMedicineOrders = realtimeDb.subscribeMedicineOrders((newOrders) => {
      setMedicineOrders(newOrders);
    });

    const unsubHomeVisits = realtimeDb.subscribeHomeVisits((newVisits) => {
      setHomeVisits(newVisits);
    });

    const unsubAppSettings = realtimeDb.subscribeAppSettings((newSettings) => {
      setAppSettings(newSettings);
    });

    const unsubAlarm = realtimeDb.subscribeAlarm((active) => {
      setHasActiveAlarm(active);
    });

    return () => {
      unsubDoctors();
      unsubAppointments();
      unsubLabTests();
      unsubLabBookings();
      unsubMedicineOrders();
      unsubHomeVisits();
      unsubAppSettings();
      unsubAlarm();
    };
  }, []);

  const handleAcknowledgeAlarm = () => {
    realtimeDb.acknowledgeAlarm();
  };

  const handleLoginSuccess = (role: UserRole) => {
    setCurrentRole(role);
    setIsStaffLoginOpen(false);
  };

  const handleLogoutStaff = () => {
    sirenManager.stopSiren();
    setCurrentRole('patient');
    setCompounderDoctorName('');
    setActiveTab('home');
  };

  // Active bookings count (confirmed or pending)
  const activeBookingCount = 
    appointments.filter((a) => a.status === 'Confirmed' || a.status === 'Pending').length +
    medicineOrders.filter((m) => m.status !== 'Delivered' && m.status !== 'Cancelled').length +
    homeVisits.filter((h) => h.status !== 'Completed' && h.status !== 'Cancelled').length;

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center text-slate-900 font-sans">
      {/* Mobile-Frame Container (Optimized for Median Native Webview & Mobile APK) */}
      <div className="w-full max-w-md min-h-screen bg-slate-50 flex flex-col relative shadow-xl overflow-x-hidden border-x border-slate-200/60">
        {/* Mobile Header with App-like styling & Live Alert Bar */}
        <MobileAppHeader
          currentRole={currentRole}
          onOpenStaffLogin={() => setIsStaffLoginOpen(true)}
          onLogoutStaff={handleLogoutStaff}
          compounderDoctorName={compounderDoctorName}
          hasActiveAlarm={currentRole === 'admin' && hasActiveAlarm}
          onAcknowledgeAlarm={handleAcknowledgeAlarm}
        />

        {/* Dynamic Main Body Content based on Active Role */}
        <main className="flex-1">
          {currentRole === 'admin' ? (
            <GroupAdminDashboard
              doctors={doctors}
              appointments={appointments}
              labBookings={labBookings}
              medicineOrders={medicineOrders}
              homeVisits={homeVisits}
              appSettings={appSettings}
              labTests={labTests}
              hasActiveAlarm={hasActiveAlarm}
              onAcknowledgeAlarm={handleAcknowledgeAlarm}
              onExit={handleLogoutStaff}
            />
          ) : currentRole === 'compounder' ? (
            <CompounderDashboard
              doctors={doctors}
              appointments={appointments}
              onExit={handleLogoutStaff}
              onDoctorSelected={(name) => setCompounderDoctorName(name)}
            />
          ) : (
            /* Patient Mobile Tabs */
            <>
              {activeTab === 'home' && (
                <HomeTab
                  doctors={doctors}
                  appSettings={appSettings}
                  onNavigateToTab={(tab) => setActiveTab(tab)}
                  onBookingCreated={() => setActiveTab('bookings')}
                />
              )}

              {activeTab === 'bookings' && (
                <MyBookingsTab
                  appointments={appointments}
                  doctors={doctors}
                  labBookings={labBookings}
                  medicineOrders={medicineOrders}
                  homeVisits={homeVisits}
                  onNavigateToHome={() => setActiveTab('home')}
                />
              )}

              {activeTab === 'labtests' && (
                <LabTestsTab
                  labTests={labTests}
                  onBookingSuccess={() => setActiveTab('bookings')}
                />
              )}

              {activeTab === 'settings' && (
                <SettingsTab
                  appSettings={appSettings}
                  onOpenStaffLogin={() => setIsStaffLoginOpen(true)}
                />
              )}
            </>
          )}
        </main>

        {/* Bottom Navigation (Only visible for Patient mode) */}
        {currentRole === 'patient' && (
          <BottomNavigation
            activeTab={activeTab}
            onChangeTab={(tab) => setActiveTab(tab)}
            activeBookingCount={activeBookingCount}
          />
        )}

        {/* Staff Authentication Modal */}
        {isStaffLoginOpen && (
          <StaffLoginModal
            onClose={() => setIsStaffLoginOpen(false)}
            onLoginSuccess={handleLoginSuccess}
          />
        )}
      </div>
    </div>
  );
}
