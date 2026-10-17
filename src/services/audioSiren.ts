/**
 * HTML5 Web Audio Looping Medical Emergency Siren Engine
 * Plays an authentic looping alert siren when new patient appointments arrive.
 * Plays continuously until acknowledged by the Admin.
 */

class AudioSirenManager {
  private audioCtx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private intervalId: number | null = null;
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;

  public startSiren() {
    if (this.isPlaying) return;
    this.isPlaying = true;

    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtxClass) return;

      this.audioCtx = new AudioCtxClass();
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      this.gainNode = this.audioCtx.createGain();
      this.gainNode.gain.setValueAtTime(0.35, this.audioCtx.currentTime);
      this.gainNode.connect(this.audioCtx.destination);

      this.oscillator = this.audioCtx.createOscillator();
      this.oscillator.type = 'sawtooth';

      // Modulate frequency between 750Hz and 950Hz to create standard medical siren
      const now = this.audioCtx.currentTime;
      this.oscillator.frequency.setValueAtTime(750, now);
      this.oscillator.connect(this.gainNode);
      this.oscillator.start();

      let highTone = false;
      this.intervalId = window.setInterval(() => {
        if (!this.audioCtx || !this.oscillator || !this.isPlaying) return;
        highTone = !highTone;
        const targetFreq = highTone ? 950 : 720;
        this.oscillator.frequency.exponentialRampToValueAtTime(targetFreq, this.audioCtx.currentTime + 0.18);
      }, 400);

    } catch (e) {
      console.warn('Audio Siren playback issue (waiting for user interaction):', e);
    }
  }

  public stopSiren() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.oscillator) {
      try {
        this.oscillator.stop();
        this.oscillator.disconnect();
      } catch {
        // ignore
      }
      this.oscillator = null;
    }
    if (this.gainNode) {
      try {
        this.gainNode.disconnect();
      } catch {
        // ignore
      }
      this.gainNode = null;
    }
    if (this.audioCtx) {
      try {
        this.audioCtx.close();
      } catch {
        // ignore
      }
      this.audioCtx = null;
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Dedicated Notification Sound (Beep) for new Lab Orders
   * Plays a crisp, authentic dual-tone hospital alert chime.
   */
  public playLabBeep() {
    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtxClass) return;
      const ctx = new AudioCtxClass();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      // Dual tone beep: 880Hz then 1046.5Hz
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.setValueAtTime(1174.66, now + 0.12);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(now + 0.38);

      setTimeout(() => {
        try {
          ctx.close();
        } catch {}
      }, 600);
    } catch (e) {
      console.warn('Lab notification beep audio issue:', e);
    }
  }
}

export const sirenManager = new AudioSirenManager();
