import { FamilyDependant } from '../types';

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

  public isPhoneLocked(): boolean {
    return !!this.userPhone && this.userPhone.length === 10;
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

  /**
   * Sets or locks user identity.
   * If the session already has a verified phone number, arbitrary switching is blocked
   * to protect patient confidentiality.
   */
  public setUserIdentity(phone: string, name?: string, force = false): boolean {
    const cleanPhone = this.normalizePhone(phone);
    if (!cleanPhone || cleanPhone.length < 10) {
      return false;
    }

    // Security Gate: If already verified and not a forced reset, block changing to a different phone
    if (this.isPhoneLocked() && this.userPhone !== cleanPhone && !force) {
      console.warn('Security Notice: Cannot switch to an unauthorized phone number in an active verified session.');
      return false;
    }

    this.userPhone = cleanPhone;
    try {
      localStorage.setItem('hd_user_phone', cleanPhone);
    } catch (e) {
      console.warn('Storage error:', e);
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
    return true;
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

  /**
   * Strictly verifies whether a booking belongs to the current verified phone account.
   * Prevents any cross-account data leakage.
   */
  public isUserBooking(
    item: { userId?: string; patientPhone?: string },
    filterPhoneOverride?: string
  ): boolean {
    const activePhone = this.normalizePhone(filterPhoneOverride || this.userPhone);
    const activeUserId = this.userId;

    if (!activePhone && !activeUserId) {
      return false;
    }

    // 1. Strict phone number matching (Primary privacy barrier)
    if (activePhone && item.patientPhone) {
      const itemPhone = this.normalizePhone(item.patientPhone);
      if (itemPhone === activePhone) {
        return true;
      }
      // If the booking explicitly has a different phone number, REJECT it immediately
      return false;
    }

    // 2. User ID match ONLY if booking has no phone attached
    if (item.userId && activeUserId && item.userId === activeUserId && !item.patientPhone) {
      return true;
    }

    return false;
  }

  /**
   * Family Profiles: Retrieves dependants created under the SAME verified account/phone number.
   * All dependants share the single verified phone number and cannot access other accounts.
   */
  public getFamilyDependants(): FamilyDependant[] {
    const phone = this.userPhone;
    if (!phone) return [];

    try {
      const raw = localStorage.getItem(`hd_dependants_${phone}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading family dependants:', e);
    }

    // Default primary self profile if available
    const primaryName = this.userName || 'Primary Account';
    const initial: FamilyDependant[] = [
      {
        id: `self_${phone}`,
        name: primaryName,
        relationship: 'Self',
        createdAt: Date.now()
      }
    ];

    try {
      localStorage.setItem(`hd_dependants_${phone}`, JSON.stringify(initial));
    } catch {}

    return initial;
  }

  /**
   * Add a new family dependant strictly under the current verified account phone number.
   */
  public addFamilyDependant(
    dependant: Omit<FamilyDependant, 'id' | 'createdAt'>
  ): FamilyDependant | null {
    const phone = this.userPhone;
    if (!phone) return null;

    const list = this.getFamilyDependants();
    const newDep: FamilyDependant = {
      id: `dep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: dependant.name.trim(),
      relationship: dependant.relationship || 'Other',
      age: dependant.age,
      gender: dependant.gender,
      createdAt: Date.now()
    };

    const updated = [...list, newDep];
    try {
      localStorage.setItem(`hd_dependants_${phone}`, JSON.stringify(updated));
    } catch (e) {
      console.warn('Error saving dependant:', e);
    }

    return newDep;
  }

  /**
   * Remove a family dependant strictly from the current verified account.
   */
  public removeFamilyDependant(id: string): void {
    const phone = this.userPhone;
    if (!phone) return;

    const list = this.getFamilyDependants();
    // Cannot delete the primary 'Self' profile
    const updated = list.filter(d => d.id !== id || d.relationship === 'Self');
    try {
      localStorage.setItem(`hd_dependants_${phone}`, JSON.stringify(updated));
    } catch (e) {
      console.warn('Error removing dependant:', e);
    }
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
