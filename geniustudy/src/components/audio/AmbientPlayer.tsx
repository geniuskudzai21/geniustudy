import { useAppStore } from '@/store/useAppStore'
import { useAmbientAudio } from '@/hooks/useAmbientAudio'
import {
  CloudRain, Waves, Leaf, Droplets, Headphones, Coffee,
  BookOpen, Radio, Brain, Music, Stars, CloudLightning, Volume2
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const iconMap: Record<string, LucideIcon> = {
  CloudRain, Waves, Leaf, Droplets, Headphones, Coffee,
  BookOpen, Radio, Brain, Music, Stars, CloudLightning, Volume2,
}

const categoryLabels: Record<string, string> = {
  nature: 'Nature',
  study: 'Study',
  'white-noise': 'Noise',
  focus: 'Focus',
  space: 'Space',
}

export function AmbientPlayer() {
  const { ambientSounds, setAmbientSounds, ambientGlobalVolume, setAmbientGlobalVolume } = useAppStore()
  const { toggleSound, stopSound, setSoundVolume, setPreset } = useAmbientAudio()

  const handleToggle = (sound: typeof ambientSounds[0]) => {
    toggleSound(sound)
    setAmbientSounds(ambientSounds.map(s =>
      s.id === sound.id ? { ...s, active: !s.active } : s
    ))
  }

  const handleVolumeChange = (id: string, volume: number) => {
    setSoundVolume(id, volume)
    setAmbientSounds(ambientSounds.map(s =>
      s.id === id ? { ...s, volume } : s
    ))
  }

  const categories = [...new Set(ambientSounds.map(s => s.category))]

  return (
    <div className="p-3 space-y-3">
      <div className="flex gap-2">
        {['deep-focus', 'chill-study', 'power-study'].map(preset => (
          <button
            key={preset}
            onClick={() => setPreset(preset)}
            className="flex-1 px-2 py-1.5 text-xs bg-surface border border-border rounded-lg text-text-secondary hover:border-accent hover:text-accent transition-all capitalize"
          >
            {preset.replace('-', ' ')}
          </button>
        ))}
      </div>

      <div>
        <label className="text-xs text-text-muted block mb-1">Global Volume</label>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={ambientGlobalVolume}
          onChange={(e) => setAmbientGlobalVolume(Number(e.target.value))}
          className="w-full accent-accent"
        />
      </div>

      {categories.map(cat => (
        <div key={cat}>
          <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">
            {categoryLabels[cat] || cat}
          </h4>
          <div className="grid grid-cols-2 gap-1.5">
            {ambientSounds.filter(s => s.category === cat).map(sound => {
              const Icon = iconMap[sound.icon] || Music
              return (
                <button
                  key={sound.id}
                  onClick={() => handleToggle(sound)}
                  className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs border transition-all ${
                    sound.active
                      ? 'border-accent bg-accent-subtle text-accent'
                      : 'border-border text-text-secondary hover:border-accent/50 hover:text-text-primary'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${sound.active ? 'animate-pulse-glow' : ''}`} />
                  <span className="truncate">{sound.name}</span>
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
