import React from 'react';
import { Home, CalendarCheck, FlaskConical, Settings } from 'lucide-react';

export type TabType = 'home' | 'bookings' | 'labtests' | 'settings';

interface Props {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  activeBookingCount: number;
}

export const BottomNavigation: React.FC<Props> = ({
  activeTab,
  onChangeTab,
  activeBookingCount
}) => {
  const tabs = [
    {
      id: 'home' as TabType,
      label: 'Home',
      icon: Home,
    },
    {
      id: 'bookings' as TabType,
      label: 'My Bookings',
      icon: CalendarCheck,
      badge: activeBookingCount > 0 ? activeBookingCount : undefined
    },
    {
      id: 'labtests' as TabType,
      label: 'Lab Tests',
      icon: FlaskConical,
    },
    {
      id: 'settings' as TabType,
      label: 'Settings',
      icon: Settings,
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.04)] safe-bottom">
      <div className="max-w-md mx-auto grid grid-cols-4 px-2 py-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all duration-200 cursor-pointer ${
                isActive ? 'text-sky-600 font-bold' : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 stroke-[2.4]' : 'scale-100 stroke-[1.8]'
                  }`}
                />
                {tab.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[11px] mt-1 tracking-tight ${isActive ? 'font-bold' : 'font-medium'}`}>
                {tab.label}
              </span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-sky-600 mt-0.5"></span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
