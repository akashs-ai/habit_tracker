// Pure Web Audio API Synthesizer for tactile RPG sound feedback
// Zero external assets or network latency - runs entirely in-memory

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    // Check initial mute state from localStorage
    try {
      const saved = localStorage.getItem('liferpg_sound_muted');
      this.isMuted = saved === 'true';
    } catch {
      this.isMuted = false;
    }
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    try {
      localStorage.setItem('liferpg_sound_muted', String(this.isMuted));
    } catch {}
    return this.isMuted;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    try {
      localStorage.setItem('liferpg_sound_muted', String(muted));
    } catch {}
  }

  /**
   * Satisfying, crisp wooden checkmark tick with a soft sub-chime
   */
  public playCheckmark() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;

      // Pop / click
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(740, now + 0.08);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.12);

      // Sweet subtle overtone
      const chime = this.ctx.createOscillator();
      const chimeGain = this.ctx.createGain();
      chime.type = 'triangle';
      chime.frequency.setValueAtTime(1174.66, now + 0.02); // D6
      chimeGain.gain.setValueAtTime(0.08, now + 0.02);
      chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

      chime.connect(chimeGain);
      chimeGain.connect(this.ctx.destination);

      chime.start(now + 0.02);
      chime.stop(now + 0.25);
    } catch {
      // AudioContext failure gracefully handled
    }
  }

  /**
   * Cheerful, heroic major pentatonic quest completion chime (G4 -> C5 -> E5 -> G5)
   */
  public playQuestComplete() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [392.0, 523.25, 659.25, 783.99]; // G4, C5, E5, G5
      notes.forEach((freq, idx) => {
        const start = now + idx * 0.07;
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.18, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(start);
        osc.stop(start + 0.35);
      });
    } catch {}
  }

  /**
   * Triumphant Level Up fanfare (ascending chord with resonant golden bell)
   */
  public playLevelUp() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const fanfareNotes = [
        { f: 523.25, d: 0.12, t: 0.0 },   // C5
        { f: 659.25, d: 0.12, t: 0.1 },   // E5
        { f: 783.99, d: 0.12, t: 0.2 },   // G5
        { f: 1046.5, d: 0.5,  t: 0.32 },  // C6 (held)
      ];

      fanfareNotes.forEach(({ f, d, t }) => {
        const start = now + t;
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, start);

        gain.gain.setValueAtTime(0.25, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + d + 0.2);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(start);
        osc.stop(start + d + 0.25);
      });

      // Shimmer chord
      const shimmer = this.ctx.createOscillator();
      const sGain = this.ctx.createGain();
      shimmer.type = 'triangle';
      shimmer.frequency.setValueAtTime(1318.51, now + 0.35); // E6
      sGain.gain.setValueAtTime(0.12, now + 0.35);
      sGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.1);

      shimmer.connect(sGain);
      sGain.connect(this.ctx.destination);
      shimmer.start(now + 0.35);
      shimmer.stop(now + 1.1);
    } catch {}
  }

  /**
   * Crisp, metallic gold coin drop / reward purchase chime
   */
  public playCoin() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';

      osc1.frequency.setValueAtTime(987.77, now); // B5
      osc1.frequency.exponentialRampToValueAtTime(1318.51, now + 0.06); // E6

      osc2.frequency.setValueAtTime(1975.53, now); // B6
      osc2.frequency.exponentialRampToValueAtTime(2637.02, now + 0.08); // E7

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.38);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.4);
      osc2.stop(now + 0.4);
    } catch {}
  }

  /**
   * Magical reward unlocked / crystal resonant chord
   */
  public playRewardUnlocked() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const chords = [587.33, 739.99, 880.0, 1174.66]; // D, F#, A, D
      chords.forEach((freq, i) => {
        const start = now + i * 0.05;
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.15, start);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.6);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(start);
        osc.stop(start + 0.65);
      });
    } catch {}
  }
}

export const soundFx = new SoundEngine();
