import { useEffect, useRef } from 'react';
import { TabType } from '../components/BottomNavigation';
import { nativeBridge } from '../services/nativeBridge';

interface BackButtonOptions {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isModalOpen?: boolean;
  onCloseModal?: () => void;
}

/**
 * Handles Android Hardware Back Button & gesture navigation inside
 * Median.co, Web2App, Android WebViews, and mobile browsers.
 */
export function useNativeBackButton({
  activeTab,
  setActiveTab,
  isModalOpen = false,
  onCloseModal,
}: BackButtonOptions) {
  const activeTabRef = useRef(activeTab);
  const isModalOpenRef = useRef(isModalOpen);
  const onCloseModalRef = useRef(onCloseModal);

  activeTabRef.current = activeTab;
  isModalOpenRef.current = isModalOpen;
  onCloseModalRef.current = onCloseModal;

  // Manage browser history entries so Android back button triggers popstate
  useEffect(() => {
    // Push a state when a modal opens
    if (isModalOpen) {
      window.history.pushState({ modalOpen: true }, '');
    }
  }, [isModalOpen]);

  useEffect(() => {
    // Push a state when moving away from home tab
    if (activeTab !== 'home') {
      window.history.pushState({ tab: activeTab }, '');
    }
  }, [activeTab]);

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      // 1. If modal was open, close modal first
      if (isModalOpenRef.current && onCloseModalRef.current) {
        e.preventDefault();
        nativeBridge.haptic(15);
        onCloseModalRef.current();
        return;
      }

      // 2. If on a sub-tab, go back to home tab
      if (activeTabRef.current !== 'home') {
        e.preventDefault();
        nativeBridge.haptic(15);
        setActiveTab('home');
        return;
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [setActiveTab]);
}
