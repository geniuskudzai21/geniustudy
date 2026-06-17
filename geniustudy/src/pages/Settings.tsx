import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAppStore } from '@/store/useAppStore'
import { Sun, Moon, Type, Volume2, Music, Brain, User, ChevronRight } from 'lucide-react'
import type { ReadingTheme } from '@/types'

type SettingsTab = 'appearance' | 'tts' | 'ambient' | 'ai' | 'account'

export function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('appearance')
  const { preferences, setPreferences } = useAppStore()

  const tabs: { id: SettingsTab; label: string; icon: any }[] = [
    { id: 'appearance', label: 'Appearance', icon: Sun },
    { id: 'tts', label: 'Text-to-Speech', icon: Volume2 },
    { id: 'ambient', label: 'Ambient', icon: Music },
    { id: 'ai', label: 'AI', icon: Brain },
    { id: 'account', label: 'Account', icon: User },
  ]

  return (
    <div className="flex h-full animate-fade-in-up">
      <div className="w-52 border-r border-border p-3 shrink-0">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors mb-1 ${
              activeTab === tab.id
                ? 'bg-accent-subtle text-accent'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 p-6 overflow-auto">
        {activeTab === 'appearance' && <AppearanceSettings />}
        {activeTab === 'tts' && <TTSSettings />}
        {activeTab === 'ambient' && <AmbientSettings />}
        {activeTab === 'ai' && <AISettings />}
        {activeTab === 'account' && <AccountSettings />}
      </div>
    </div>
  )
}

function AppearanceSettings() {
  const { readingTheme, setReadingTheme, fontFamily, setFontFamily, fontSize, setFontSize, lineHeight, setLineHeight, readingWidth, setReadingWidth } = useAppStore()

  return (
    <div className="max-w-lg space-y-6">
      <h2 className="font-display text-xl font-bold text-text-primary">Appearance</h2>

      <div>
        <label className="text-sm text-text-secondary block mb-2">Reader Theme</label>
        <div className="flex gap-2">
          {(['dark', 'light', 'sepia', 'forest', 'midnight'] as ReadingTheme[]).map(t => (
            <button
              key={t}
              onClick={() => setReadingTheme(t)}
              className={`w-10 h-10 rounded-xl border-2 transition-all ${
                readingTheme === t ? 'border-accent' : 'border-border'
              } reader-theme-${t}`}
              title={t}
            />
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm text-text-secondary block mb-2">Font Family</label>
        <div className="flex gap-2">
          {(['serif', 'sans'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFontFamily(f)}
              className={`px-4 py-2 rounded-xl text-sm border transition-all ${
                fontFamily === f ? 'border-accent bg-accent-subtle text-accent' : 'border-border text-text-secondary'
              }`}
              style={{ fontFamily: f === 'serif' ? "'Lora', serif" : "'DM Sans', sans-serif" }}
            >
              {f === 'serif' ? 'Serif' : 'Sans'}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm text-text-secondary block mb-2">Font Size: {fontSize}px</label>
        <input type="range" min={14} max={24} value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-full accent-accent" />
      </div>

      <div>
        <label className="text-sm text-text-secondary block mb-2">Line Height: {lineHeight}</label>
        <input type="range" min={1.2} max={2.4} step={0.1} value={lineHeight} onChange={(e) => setLineHeight(Number(e.target.value))} className="w-full accent-accent" />
      </div>

      <div>
        <label className="text-sm text-text-secondary block mb-2">Reading Width</label>
        <div className="flex gap-2">
          {(['narrow', 'medium', 'wide'] as const).map(w => (
            <button
              key={w}
              onClick={() => setReadingWidth(w)}
              className={`px-4 py-2 rounded-xl text-sm border transition-all capitalize ${
                readingWidth === w ? 'border-accent bg-accent-subtle text-accent' : 'border-border text-text-secondary'
              }`}
            >
              {w}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function TTSSettings() {
  const { ttsSpeed, setTtsSpeed, ttsPitch, setTtsPitch, ttsVolume, setTtsVolume } = useAppStore()

  return (
    <div className="max-w-lg space-y-6">
      <h2 className="font-display text-xl font-bold text-text-primary">Text-to-Speech</h2>

      <div>
        <label className="text-sm text-text-secondary block mb-2">Speed: {ttsSpeed}x</label>
        <input type="range" min={0.5} max={3} step={0.1} value={ttsSpeed} onChange={(e) => setTtsSpeed(Number(e.target.value))} className="w-full accent-accent" />
      </div>

      <div>
        <label className="text-sm text-text-secondary block mb-2">Pitch: {ttsPitch}</label>
        <input type="range" min={0.5} max={2} step={0.1} value={ttsPitch} onChange={(e) => setTtsPitch(Number(e.target.value))} className="w-full accent-accent" />
      </div>

      <div>
        <label className="text-sm text-text-secondary block mb-2">Volume: {Math.round(ttsVolume * 100)}%</label>
        <input type="range" min={0} max={1} step={0.05} value={ttsVolume} onChange={(e) => setTtsVolume(Number(e.target.value))} className="w-full accent-accent" />
      </div>
    </div>
  )
}

function AmbientSettings() {
  const { ambientGlobalVolume, setAmbientGlobalVolume } = useAppStore()

  return (
    <div className="max-w-lg space-y-6">
      <h2 className="font-display text-xl font-bold text-text-primary">Ambient Sounds</h2>

      <div>
        <label className="text-sm text-text-secondary block mb-2">Default Volume: {Math.round(ambientGlobalVolume * 100)}%</label>
        <input type="range" min={0} max={1} step={0.05} value={ambientGlobalVolume} onChange={(e) => setAmbientGlobalVolume(Number(e.target.value))} className="w-full accent-accent" />
      </div>
    </div>
  )
}

function AISettings() {
  return (
    <div className="max-w-lg space-y-6">
      <h2 className="font-display text-xl font-bold text-text-primary">AI Settings</h2>
      <p className="text-sm text-text-secondary">
        AI features use the Claude API. Configure your API key in the .env.local file.
      </p>
    </div>
  )
}

function AccountSettings() {
  const user = useAppStore((s) => s.user)

  return (
    <div className="max-w-lg space-y-6">
      <h2 className="font-display text-xl font-bold text-text-primary">Account</h2>

      <div className="bg-surface border border-border rounded-xl p-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-accent-subtle flex items-center justify-center">
            <span className="text-accent font-semibold">
              {user?.display_name?.[0] || '?'}
            </span>
          </div>
          <div>
            <p className="font-medium text-text-primary">{user?.display_name || 'User'}</p>
            <p className="text-sm text-text-muted">Level {user?.level || 1} — {user?.xp || 0} XP</p>
          </div>
        </div>
      </div>
    </div>
  )
}
