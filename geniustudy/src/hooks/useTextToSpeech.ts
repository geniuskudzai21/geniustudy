import { useState, useCallback, useRef, useEffect } from 'react'
import { useAppStore } from '@/store/useAppStore'

export function useTextToSpeech() {
  const {
    ttsSpeed, setTtsSpeed,
    ttsPitch, setTtsPitch,
    ttsVolume, setTtsVolume,
    isTTSPlaying, setIsTTSPlaying,
  } = useAppStore()

  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null)
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(-1)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const sentencesRef = useRef<string[]>([])

  useEffect(() => {
    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices()
      setVoices(v)
      if (v.length > 0 && !selectedVoice) {
        setSelectedVoice(v.find(vo => vo.lang.startsWith('en')) || v[0])
      }
    }
    loadVoices()
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices)
    return () => window.speechSynthesis.removeEventListener('voiceschanged', loadVoices)
  }, [])

  const splitIntoSentences = useCallback((text: string): string[] => {
    return text.match(/[^.!?\n]+[.!?]*\s*/g) || [text]
  }, [])

  const setDocument = useCallback((text: string) => {
    sentencesRef.current = splitIntoSentences(text)
  }, [splitIntoSentences])

  const play = useCallback((startIndex: number = 0) => {
    window.speechSynthesis.cancel()
    const sentences = sentencesRef.current
    if (sentences.length === 0) return

    const text = sentences.slice(startIndex).join(' ')
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = ttsSpeed
    utterance.pitch = ttsPitch
    utterance.volume = ttsVolume
    if (selectedVoice) utterance.voice = selectedVoice

    utterance.onboundary = (e) => {
      if (e.name === 'sentence' || e.name === 'word') {
        setCurrentSentenceIndex(startIndex + Math.floor(e.charIndex / 100))
      }
    }

    utterance.onend = () => {
      setIsTTSPlaying(false)
      setCurrentSentenceIndex(-1)
    }

    utterance.onerror = () => {
      setIsTTSPlaying(false)
    }

    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
    setIsTTSPlaying(true)
  }, [ttsSpeed, ttsPitch, ttsVolume, selectedVoice, setIsTTSPlaying])

  const pause = useCallback(() => {
    window.speechSynthesis.pause()
    setIsTTSPlaying(false)
  }, [setIsTTSPlaying])

  const resume = useCallback(() => {
    window.speechSynthesis.resume()
    setIsTTSPlaying(true)
  }, [setIsTTSPlaying])

  const stop = useCallback(() => {
    window.speechSynthesis.cancel()
    setIsTTSPlaying(false)
    setCurrentSentenceIndex(-1)
  }, [setIsTTSPlaying])

  const togglePlayPause = useCallback(() => {
    if (window.speechSynthesis.paused) {
      resume()
    } else if (isTTSPlaying) {
      pause()
    } else {
      play(currentSentenceIndex >= 0 ? currentSentenceIndex : 0)
    }
  }, [isTTSPlaying, currentSentenceIndex, play, pause, resume])

  const seek = useCallback((sentenceIndex: number) => {
    play(sentenceIndex)
  }, [play])

  return {
    voices,
    selectedVoice,
    setSelectedVoice,
    currentSentenceIndex,
    setCurrentSentenceIndex,
    isTTSPlaying,
    ttsSpeed,
    setTtsSpeed,
    ttsPitch,
    setTtsPitch,
    ttsVolume,
    setTtsVolume,
    setDocument,
    play,
    pause,
    resume,
    stop,
    togglePlayPause,
    seek,
    splitIntoSentences,
  }
}
