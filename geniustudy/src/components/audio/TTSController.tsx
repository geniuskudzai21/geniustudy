import { Play, Pause, Square, SkipBack, SkipForward, Volume2 } from 'lucide-react'

interface TTSControllerProps {
  tts: any
}

export function TTSController({ tts }: TTSControllerProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-surface border-t border-border shrink-0">
      <button
        onClick={tts.togglePlayPause}
        className="w-9 h-9 rounded-full bg-accent text-background flex items-center justify-center hover:brightness-110 transition-all"
      >
        {tts.isTTSPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
      </button>

      <button onClick={tts.stop} className="p-2 rounded-md text-text-secondary hover:text-text-primary transition-colors">
        <Square className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-2 text-xs text-text-muted">
        <span>Speed</span>
        <input
          type="range"
          min={0.5}
          max={3}
          step={0.1}
          value={tts.ttsSpeed}
          onChange={(e) => tts.setTtsSpeed(Number(e.target.value))}
          className="w-16 accent-accent"
        />
        <span>{tts.ttsSpeed}x</span>
      </div>

      <div className="flex items-center gap-2 text-xs text-text-muted">
        <Volume2 className="w-3 h-3" />
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={tts.ttsVolume}
          onChange={(e) => tts.setTtsVolume(Number(e.target.value))}
          className="w-16 accent-accent"
        />
      </div>
    </div>
  )
}
