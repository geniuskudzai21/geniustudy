import { useNavigate } from 'react-router-dom'
import { Sparkles, Volume2, Music, Brain } from 'lucide-react'

export function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-info rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 text-center px-4 max-w-3xl animate-fade-in-up">
        <div className="flex items-center justify-center gap-3 mb-6">
          <Sparkles className="w-8 h-8 text-accent" />
          <span className="font-display text-4xl font-bold text-text-primary">
            GeniuStudy
          </span>
        </div>
        <p className="text-xl text-text-secondary mb-2 font-light">
          Your immersive AI-powered study companion
        </p>
        <p className="text-text-muted mb-12 max-w-lg mx-auto">
          Upload your notes, listen with lifelike TTS, study with ambient sounds,
          and master any subject with AI-powered tools.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 text-left">
          {[
            { icon: Volume2, title: 'Text-to-Speech', desc: 'Listen to your notes with natural AI voices at your own pace.' },
            { icon: Music, title: 'Ambient Sounds', desc: 'Focus with lo-fi, rain, binaural beats, and more.' },
            { icon: Brain, title: 'AI Study Tools', desc: 'Generate summaries, flashcards, and quizzes from any material.' },
          ].map((item) => (
            <div key={item.title} className="bg-surface border border-border rounded-xl p-5 hover:border-accent/30 transition-colors">
              <item.icon className="w-6 h-6 text-accent mb-3" />
              <h3 className="font-display text-lg font-semibold text-text-primary mb-1">{item.title}</h3>
              <p className="text-sm text-text-secondary">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => navigate('/auth')}
            className="px-8 py-3 bg-accent text-background font-semibold rounded-xl hover:brightness-110 transition-all"
          >
            Start Studying Free
          </button>
          <button
            onClick={() => navigate('/auth')}
            className="px-8 py-3 border border-border text-text-secondary rounded-xl hover:bg-surface hover:text-text-primary transition-all"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  )
}
