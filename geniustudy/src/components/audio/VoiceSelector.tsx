import { useState, useEffect } from 'react'
import { Play, Check } from 'lucide-react'

interface VoiceSelectorProps {
  voices: SpeechSynthesisVoice[]
  selectedVoice: SpeechSynthesisVoice | null
  onSelect: (voice: SpeechSynthesisVoice) => void
}

export function VoiceSelector({ voices, selectedVoice, onSelect }: VoiceSelectorProps) {
  const [language, setLanguage] = useState('en')
  const [previewText] = useState('The quick brown fox jumps over the lazy dog.')

  const languages = [...new Set(voices.map(v => v.lang))].sort()
  const filteredVoices = voices.filter(v => v.lang.startsWith(language))

  const playPreview = (voice: SpeechSynthesisVoice) => {
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(previewText)
    utterance.voice = voice
    utterance.rate = 0.9
    window.speechSynthesis.speak(utterance)
  }

  return (
    <div className="space-y-3">
      <div>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent"
        >
          {languages.map(l => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </div>

      <div className="space-y-1 max-h-48 overflow-auto">
        {filteredVoices.map((voice, i) => (
          <div key={`${voice.name}-${i}`} className="flex items-center gap-2">
            <button
              onClick={() => playPreview(voice)}
              className="p-1.5 rounded-md hover:bg-accent-subtle text-text-secondary hover:text-accent transition-colors shrink-0"
            >
              <Play className="w-3 h-3" />
            </button>
            <button
              onClick={() => onSelect(voice)}
              className={`flex-1 flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedVoice?.name === voice.name
                  ? 'bg-accent-subtle text-accent'
                  : 'text-text-secondary hover:bg-surface-elevated hover:text-text-primary'
              }`}
            >
              <span className="truncate">{voice.name}</span>
              {selectedVoice?.name === voice.name && <Check className="w-3 h-3 shrink-0" />}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
