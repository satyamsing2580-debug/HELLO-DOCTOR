// User Identity & Local Auth Service for Hello Doctor Patient Data Separation
type UserIdentityListener = (user: { userId: string; phone: string; name: string }) => void;

class UserAuthService {
  private userId: string = '';
  private userPhone: string = '';
  private userName: string = '';
  private listeners: UserIdentityListener[] = [];

  constructor() {
    this.init();
  }

  private init() {
    try {
      let storedId = localStorage.getItem('hd_user_id');
      if (!storedId) {
        storedId = `usr_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
        localStorage.setItem('hd_user_id', storedId);
      }
      this.userId = storedId;
      this.userPhone = localStorage.getItem('hd_user_phone') || '';
      this.userName = localStorage.getItem('hd_user_name') || '';
    } catch {
      this.userId = `usr_${Date.now()}`;
    }
  }

  public getUserId(): string {
    if (!this.userId) {
      this.init();
    }
    return this.userId;
  }

  public getUserPhone(): string {
    return this.userPhone;
  }

  public getUserName(): string {
    return this.userName;
  }

  public normalizePhone(phone: string): string {
    if (!phone) return '';
    // Strip everything except digits
    let digits = phone.replace(/\D/g, '');
    // If has 91 prefix and length 12, strip 91
    if (digits.length === 12 && digits.startsWith('91')) {
      digits = digits.substring(2);
    }
    // If starts with 0 and length 11, strip 0
    if (digits.length === 11 && digits.startsWith('0')) {
      digits = digits.substring(1);
    }
    return digits;
  }

  public setUserIdentity(phone: string, name?: string) {
    const cleanPhone = this.normalizePhone(phone);
    if (cleanPhone) {
      this.userPhone = cleanPhone;
      try {
        localStorage.setItem('hd_user_phone', cleanPhone);
      } catch (e) {
        console.warn('Storage error:', e);
      }
    }

    if (name && name.trim()) {
      this.userName = name.trim();
      try {
        localStorage.setItem('hd_user_name', this.userName);
      } catch (e) {
        console.warn('Storage error:', e);
      }
    }

    this.notify();
  }

  public clearUserIdentity() {
    this.userPhone = '';
    this.userName = '';
    try {
      localStorage.removeItem('hd_user_phone');
      localStorage.removeItem('hd_user_name');
    } catch (e) {
      console.warn('Storage error:', e);
    }
    this.notify();
  }

  public isUserBooking(
    item: { userId?: string; patientPhone?: string },
    filterPhoneOverride?: string
  ): boolean {
    const activePhone = filterPhoneOverride ? this.normalizePhone(filterPhoneOverride) : this.userPhone;
    const activeUserId = this.userId;

    // 1. Direct user ID match
    if (item.userId && activeUserId && item.userId === activeUserId) {
      return true;
    }

    // 2. Phone number match (robustly normalized)
    if (activePhone && item.patientPhone) {
      const itemPhone = this.normalizePhone(item.patientPhone);
      if (itemPhone && itemPhone === activePhone) {
        return true;
      }
    }

    return false;
  }

  public subscribe(listener: UserIdentityListener): () => void {
    this.listeners.push(listener);
    listener({ userId: this.userId, phone: this.userPhone, name: this.userName });
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  public subscribeUser(listener: UserIdentityListener): () => void {
    return this.subscribe(listener);
  }

  private notify() {
    const user = { userId: this.userId, phone: this.userPhone, name: this.userName };
    this.listeners.forEach(cb => cb(user));
  }
}

export const userAuth = new UserAuthService();
