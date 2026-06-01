import { useState, useCallback, useRef, useEffect } from 'react'
import { getAudioContext, createNoiseNode, createBinauralBeats, createOscillatorTone } from '@/lib/audioUtils'
import type { AmbientSound } from '@/types'

type ActiveSource = {
  id: string
  source: AudioBufferSourceNode | OscillatorNode
  gain: GainNode
  type: 'buffer' | 'noise' | 'oscillator' | 'binaural'
  nodes?: { left: OscillatorNode; right: OscillatorNode; gain: GainNode }
}

export function useAmbientAudio() {
  const [globalVolume, setGlobalVolume] = useState(0.4)
  const [isPlaying, setIsPlaying] = useState(false)
  const activeSources = useRef<Map<string, ActiveSource>>(new Map())
  const masterGain = useRef<GainNode | null>(null)

  useEffect(() => {
    const ctx = getAudioContext()
    masterGain.current = ctx.createGain()
    masterGain.current.gain.value = globalVolume
    masterGain.current.connect(ctx.destination)
    return () => {
      activeSources.current.forEach((src) => {
        try { src.source.stop() } catch {}
      })
      activeSources.current.clear()
    }
  }, [])

  useEffect(() => {
    if (masterGain.current) {
      masterGain.current.gain.linearRampToValueAtTime(
        globalVolume,
        getAudioContext().currentTime + 0.5
      )
    }
  }, [globalVolume])

  const startSound = useCallback((sound: AmbientSound) => {
    if (activeSources.current.has(sound.id)) return
    const ctx = getAudioContext()
    const gain = ctx.createGain()
    gain.gain.value = sound.volume
    gain.connect(masterGain.current || ctx.destination)

    let source: AudioBufferSourceNode | OscillatorNode
    let type: 'buffer' | 'noise' | 'oscillator' | 'binaural'

    if (sound.id === 'white-noise' || sound.id === 'pink-noise' || sound.id === 'brown-noise') {
      const noiseType = sound.id.replace('-noise', '') as 'white' | 'pink' | 'brown'
      source = createNoiseNode(noiseType)
      source.connect(gain)
      type = 'noise'
    } else if (sound.id === 'alpha' || sound.id === 'beta' || sound.id === 'theta') {
      const freqs: Record<string, number> = { alpha: 10, beta: 20, theta: 6 }
      const beats = createBinauralBeats(freqs[sound.id], 200)
      beats.gain.connect(gain)
      beats.left.start()
      beats.right.start()
      type = 'binaural'
    } else if (sound.id === '432hz') {
      source = createOscillatorTone(432, 'sine')
      source.connect(gain)
      source.start()
      type = 'oscillator'
    } else {
      source = ctx.createOscillator()
      source.connect(gain)
      source.start()
      type = 'oscillator'
    }

    const entry: ActiveSource = { id: sound.id, source, gain, type }
    activeSources.current.set(sound.id, entry)
  }, [])

  const stopSound = useCallback((id: string) => {
    const entry = activeSources.current.get(id)
    if (!entry) return
    const ctx = getAudioContext()
    entry.gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3)
    setTimeout(() => {
      try { entry.source.stop() } catch {}
      activeSources.current.delete(id)
    }, 300)
  }, [])

  const setSoundVolume = useCallback((id: string, volume: number) => {
    const entry = activeSources.current.get(id)
    if (entry) {
      entry.gain.gain.linearRampToValueAtTime(volume, getAudioContext().currentTime + 0.1)
    }
  }, [])

  const toggleSound = useCallback((sound: AmbientSound) => {
    if (activeSources.current.has(sound.id)) {
      stopSound(sound.id)
    } else {
      startSound(sound)
    }
  }, [startSound, stopSound])

  const stopAll = useCallback(() => {
    activeSources.current.forEach((src, id) => stopSound(id))
  }, [stopSound])

  const setPreset = useCallback((preset: string) => {
    stopAll()
    const presets: Record<string, string[]> = {
      'deep-focus': ['alpha', 'white-noise'],
      'chill-study': ['lofi', 'rain'],
      'power-study': ['beta', 'coffee'],
    }
    const ids = presets[preset] || []
    ids.forEach(id => {
      const sound = { id, name: '', icon: '', category: 'focus' as const, active: true, volume: 0.5 }
      startSound(sound)
    })
  }, [stopAll, startSound])

  return {
    globalVolume,
    setGlobalVolume,
    isPlaying,
    toggleSound,
    stopSound,
    setSoundVolume,
    stopAll,
    setPreset,
  }
}
