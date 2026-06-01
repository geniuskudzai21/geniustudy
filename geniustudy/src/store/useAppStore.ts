import { create } from 'zustand'
import type { Profile, Document, UserPreferences, ReadingTheme, FontFamily, ReadingWidth, AmbientSound } from '@/types'

interface AppState {
  user: Profile | null
  setUser: (user: Profile | null) => void

  currentDocument: Document | null
  setCurrentDocument: (doc: Document | null) => void

  preferences: Partial<UserPreferences>
  setPreferences: (prefs: Partial<UserPreferences>) => void

  readingTheme: ReadingTheme
  setReadingTheme: (theme: ReadingTheme) => void
  fontFamily: FontFamily
  setFontFamily: (font: FontFamily) => void
  fontSize: number
  setFontSize: (size: number) => void
  lineHeight: number
  setLineHeight: (height: number) => void
  readingWidth: ReadingWidth
  setReadingWidth: (width: ReadingWidth) => void

  ttsSpeed: number
  setTtsSpeed: (speed: number) => void
  ttsPitch: number
  setTtsPitch: (pitch: number) => void
  ttsVolume: number
  setTtsVolume: (volume: number) => void
  isTTSPlaying: boolean
  setIsTTSPlaying: (playing: boolean) => void

  ambientSounds: AmbientSound[]
  setAmbientSounds: (sounds: AmbientSound[]) => void
  ambientGlobalVolume: number
  setAmbientGlobalVolume: (volume: number) => void

  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  tocOpen: boolean
  setTocOpen: (open: boolean) => void
  aiPanelOpen: boolean
  setAiPanelOpen: (open: boolean) => void
  ambientPanelOpen: boolean
  setAmbientPanelOpen: (open: boolean) => void
}

const defaultAmbientSounds: AmbientSound[] = [
  { id: 'rain', name: 'Rain', icon: 'CloudRain', category: 'nature', active: false, volume: 0.5 },
  { id: 'thunder', name: 'Thunderstorm', icon: 'CloudLightning', category: 'nature', active: false, volume: 0.5 },
  { id: 'ocean', name: 'Ocean Waves', icon: 'Waves', category: 'nature', active: false, volume: 0.5 },
  { id: 'forest', name: 'Forest', icon: 'Tree', category: 'nature', active: false, volume: 0.5 },
  { id: 'river', name: 'River', icon: 'Droplets', category: 'nature', active: false, volume: 0.5 },
  { id: 'lofi', name: 'Lo-fi Hip Hop', icon: 'Headphones', category: 'study', active: false, volume: 0.5 },
  { id: 'coffee', name: 'Coffee Shop', icon: 'Coffee', category: 'study', active: false, volume: 0.5 },
  { id: 'library', name: 'Library', icon: 'BookOpen', category: 'study', active: false, volume: 0.5 },
  { id: 'white-noise', name: 'White Noise', icon: 'Radio', category: 'white-noise', active: false, volume: 0.5 },
  { id: 'brown-noise', name: 'Brown Noise', icon: 'Radio', category: 'white-noise', active: false, volume: 0.5 },
  { id: 'pink-noise', name: 'Pink Noise', icon: 'Radio', category: 'white-noise', active: false, volume: 0.5 },
  { id: 'alpha', name: 'Alpha Waves', icon: 'Brain', category: 'focus', active: false, volume: 0.5 },
  { id: 'beta', name: 'Beta Waves', icon: 'Brain', category: 'focus', active: false, volume: 0.5 },
  { id: 'theta', name: 'Theta Waves', icon: 'Brain', category: 'focus', active: false, volume: 0.5 },
  { id: '432hz', name: '432Hz Tone', icon: 'Music', category: 'focus', active: false, volume: 0.5 },
  { id: 'space', name: 'Deep Space', icon: 'Stars', category: 'space', active: false, volume: 0.5 },
]

export const useAppStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),

  currentDocument: null,
  setCurrentDocument: (doc) => set({ currentDocument: doc }),

  preferences: {},
  setPreferences: (prefs) => set((state) => ({ preferences: { ...state.preferences, ...prefs } })),

  readingTheme: 'dark',
  setReadingTheme: (theme) => set({ readingTheme: theme }),
  fontFamily: 'serif',
  setFontFamily: (font) => set({ fontFamily: font }),
  fontSize: 18,
  setFontSize: (size) => set({ fontSize: size }),
  lineHeight: 1.7,
  setLineHeight: (height) => set({ lineHeight: height }),
  readingWidth: 'medium',
  setReadingWidth: (width) => set({ readingWidth: width }),

  ttsSpeed: 1.0,
  setTtsSpeed: (speed) => set({ ttsSpeed: speed }),
  ttsPitch: 1.0,
  setTtsPitch: (pitch) => set({ ttsPitch: pitch }),
  ttsVolume: 1.0,
  setTtsVolume: (volume) => set({ ttsVolume: volume }),
  isTTSPlaying: false,
  setIsTTSPlaying: (playing) => set({ isTTSPlaying: playing }),

  ambientSounds: defaultAmbientSounds,
  setAmbientSounds: (sounds) => set({ ambientSounds: sounds }),
  ambientGlobalVolume: 0.4,
  setAmbientGlobalVolume: (volume) => set({ ambientGlobalVolume: volume }),

  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  tocOpen: false,
  setTocOpen: (open) => set({ tocOpen: open }),
  aiPanelOpen: false,
  setAiPanelOpen: (open) => set({ aiPanelOpen: open }),
  ambientPanelOpen: false,
  setAmbientPanelOpen: (open) => set({ ambientPanelOpen: open }),
}))
