export type SpeechRecognitionState = 'inactive' | 'listening' | 'processing' | 'error';

export interface SpeechRecognitionOptions {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
  onStart?: () => void;
}

export class SpeechRecognitionService {
  private recognition: SpeechRecognition | null = null;
  private options: SpeechRecognitionOptions;
  private isSupported: boolean = false;

  constructor(options: SpeechRecognitionOptions) {
    this.options = options;
    this.init();
  }

  private init() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        if (this.recognition) {
          this.recognition.lang = this.options.lang || 'pt-PT';
          this.recognition.continuous = this.options.continuous ?? false;
          this.recognition.interimResults = this.options.interimResults ?? true;
          this.isSupported = true;

          this.setupListeners();
        }
      }
    }
  }

  private setupListeners() {
    if (!this.recognition) return;

    this.recognition.onstart = () => {
      this.options.onStart?.();
    };

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      // Prefer final, fallback to interim if needed for real-time feedback
      const transcript = finalTranscript || interimTranscript;
      const isFinal = !!finalTranscript;
      
      this.options.onResult?.(transcript, isFinal);
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error', event.error);
      this.options.onError?.(event.error);
    };

    this.recognition.onend = () => {
      this.options.onEnd?.();
    };
  }

  public start() {
    if (this.recognition) {
      try {
        this.recognition.start();
      } catch (e) {
        console.error('Failed to start recognition', e);
      }
    }
  }

  public stop() {
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  public abort() {
    if (this.recognition) {
      this.recognition.abort();
    }
  }

  public getIsSupported() {
    return this.isSupported;
  }
}

// Type definitions for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
  
  // Only declare if not present, but since we can't conditionally declare in d.ts easily,
  // we rely on interface merging. If it exists, this extends it.
  // If it doesn't exist, this defines it.
  // We use 'any' for complex types to avoid conflicts with lib.dom.d.ts if they exist there with different modifiers (like readonly)
  interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    abort(): void;
    onstart: (event: Event) => void;
    onresult: (event: any) => void;
    onerror: (event: any) => void;
    onend: (event: Event) => void;
  }

  // We define these as types or interfaces. If they exist, we might conflict if we are not careful.
  // But since we use 'any' in onresult above, we don't strictly need these interfaces for the class to compile,
  // EXCEPT that the code uses them in the callback signature: (event: SpeechRecognitionEvent) => ...
  
  // Let's define them with different names or just use any in the code?
  // The code uses: event: SpeechRecognitionEvent
  // So we need SpeechRecognitionEvent.
  
  interface SpeechRecognitionEvent extends Event {
    resultIndex: number;
    results: any; // Use any to avoid SpeechRecognitionResultList conflict
  }

  interface SpeechRecognitionErrorEvent extends Event {
    error: string;
    message: string;
  }
}

