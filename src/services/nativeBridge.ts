/**
 * Native Bridge Service for Median.co (GoNative), Web2App & Android/iOS WebViews
 * Provides deep native integration, haptics, wrapper detection, and back-button behavior.
 */

export interface MedianBridge {
  haptic?: {
    vibrate: (pattern?: number | number[]) => void;
  };
  statusbar?: {
    set: (options: { style?: 'light' | 'dark'; color?: string }) => void;
  };
  share?: {
    sharePage: () => void;
  };
}

declare global {
  interface Window {
    median?: MedianBridge;
    gonative?: MedianBridge;
    Android?: {
      showToast?: (message: string) => void;
      vibrate?: (ms: number) => void;
    };
  }
}

class NativeBridgeService {
  /**
   * Check if app is running inside Median.co / GoNative wrapper
   */
  public isMedian(): boolean {
    if (typeof window === 'undefined') return false;
    const ua = navigator.userAgent.toLowerCase();
    return (
      !!window.median ||
      !!window.gonative ||
      ua.includes('gonative') ||
      ua.includes('median')
    );
  }

  /**
   * Check if running inside generic Android WebView or Web2App wrapper
   */
  public isWeb2App(): boolean {
    if (typeof window === 'undefined') return false;
    const ua = navigator.userAgent;
    const isWv = ua.includes('wv') || (ua.includes('Version/4.0') && ua.includes('Chrome/'));
    return !!window.Android || isWv;
  }

  /**
   * Check if running in PWA standalone display mode
   */
  public isStandalonePWA(): boolean {
    if (typeof window === 'undefined') return false;
    const isStandaloneMedia = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    const isAndroidApp = document.referrer.includes('android-app://');
    return isStandaloneMedia || isIOSStandalone || isAndroidApp;
  }

  /**
   * True if running inside any wrapped APK / native shell / standalone PWA
   */
  public isNativeWrapper(): boolean {
    return this.isMedian() || this.isWeb2App() || this.isStandalonePWA();
  }

  /**
   * Trigger native tactile haptic feedback
   */
  public haptic(pattern: number | number[] = 25): void {
    if (typeof window === 'undefined') return;

    // 1. Median / GoNative native bridge haptics
    try {
      if (window.median?.haptic?.vibrate) {
        window.median.haptic.vibrate(pattern);
        return;
      }
      if (window.gonative?.haptic?.vibrate) {
        window.gonative.haptic.vibrate(pattern);
        return;
      }
    } catch {
      // Fallback
    }

    // 2. Web2App Android bridge
    try {
      if (window.Android?.vibrate && typeof pattern === 'number') {
        window.Android.vibrate(pattern);
        return;
      }
    } catch {
      // Fallback
    }

    // 3. Modern Web standard Vibration API
    try {
      if ('vibrate' in navigator) {
        navigator.vibrate(pattern);
      }
    } catch {
      // Ignore if denied
    }
  }

  /**
   * Trigger native share sheet
   */
  public async share(data: { title: string; text: string; url?: string }): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    // Native Web Share
    if (navigator.share) {
      try {
        await navigator.share({
          title: data.title,
          text: data.text,
          url: data.url || window.location.href,
        });
        return true;
      } catch (e) {
        if ((e as Error).name !== 'AbortError') {
          console.warn('Native share error:', e);
        }
      }
    }

    // Median wrapper share fallback
    if (window.median?.share?.sharePage) {
      window.median.share.sharePage();
      return true;
    }

    return false;
  }

  /**
   * Set Status Bar Color in Median wrapper
   */
  public setStatusBar(color = '#0284c7', style: 'light' | 'dark' = 'light'): void {
    try {
      if (window.median?.statusbar?.set) {
        window.median.statusbar.set({ color, style });
      }
    } catch {
      // Ignore if not in Median
    }
  }
}

export const nativeBridge = new NativeBridgeService();
