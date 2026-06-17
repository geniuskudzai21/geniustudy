import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAppStore } from '@/store/useAppStore'
import { useTextToSpeech } from '@/hooks/useTextToSpeech'
import { useStudySession } from '@/hooks/useStudySession'
import { NoteReader } from '@/components/reader/NoteReader'
import { ReaderToolbar } from '@/components/reader/ReaderToolbar'
import { TableOfContents } from '@/components/reader/TableOfContents'
import { TTSController } from '@/components/audio/TTSController'
import { VoiceSelector } from '@/components/audio/VoiceSelector'
import { AmbientPlayer } from '@/components/audio/AmbientPlayer'
import { SummaryPanel } from '@/components/ai/SummaryPanel'
import { FlashcardDeck } from '@/components/ai/FlashcardDeck'
import { QuizMode } from '@/components/ai/QuizMode'
import { useAI } from '@/hooks/useAI'
import { Music, Brain, BookOpen, MessageCircle, X, ChevronRight } from 'lucide-react'
import type { Document } from '@/types'

type AITab = 'summary' | 'flashcards' | 'quiz' | 'chat'

export function Studio() {
  const { documentId } = useParams()
  const { currentDocument, setCurrentDocument, tocOpen, setTocOpen, aiPanelOpen, setAiPanelOpen, ambientPanelOpen, setAmbientPanelOpen, readingTheme, fontFamily, fontSize, lineHeight, readingWidth } = useAppStore()
  const tts = useTextToSpeech()
  const session = useStudySession()
  const [activeTab, setActiveTab] = useState<AITab>('summary')
  const [documentText, setDocumentText] = useState('')

  useEffect(() => {
    if (documentId) loadDocument(documentId)
  }, [documentId])

  useEffect(() => {
    if (currentDocument) {
      tts.setDocument(currentDocument.raw_text || '')
      setDocumentText(currentDocument.raw_text || '')
    }
  }, [currentDocument])

  useEffect(() => {
    session.startSession()
    return () => { session.endSession() }
  }, [])

  async function loadDocument(id: string) {
    const { data } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .single()
    if (data) setCurrentDocument(data)
  }

  if (!currentDocument) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-text-muted">Select a document to start studying</p>
      </div>
    )
  }

  return (
    <div className="flex h-full relative">
      {tocOpen && (
        <div className="w-60 border-r border-border bg-surface shrink-0 overflow-auto">
          <TableOfContents html={currentDocument.html_content || ''} />
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <ReaderToolbar />

        <div className={`flex-1 overflow-auto ${readingTheme ? `reader-theme-${readingTheme}` : ''}`}>
          <div className="mx-auto py-8 px-4" style={{
            maxWidth: readingWidth === 'narrow' ? '640px' : readingWidth === 'medium' ? '720px' : '880px',
            fontFamily: fontFamily === 'serif' ? "'Lora', Georgia, serif" : "'DM Sans', sans-serif",
            fontSize: `${fontSize}px`,
            lineHeight: lineHeight,
          }}>
            <NoteReader
              html={currentDocument.html_content || ''}
              currentSentenceIndex={tts.currentSentenceIndex}
              onSentenceClick={tts.seek}
            />
          </div>
        </div>

        <TTSController tts={tts} />

        <button
          onClick={() => setAmbientPanelOpen(!ambientPanelOpen)}
          className="fixed bottom-20 right-4 w-12 h-12 rounded-full bg-accent text-background flex items-center justify-center shadow-lg hover:brightness-110 transition-all z-20"
        >
          <Music className="w-5 h-5" />
        </button>

        {ambientPanelOpen && (
          <div className="fixed bottom-36 right-4 w-80 bg-surface-elevated border border-border rounded-xl shadow-2xl z-20">
            <div className="flex items-center justify-between p-3 border-b border-border">
              <span className="text-sm font-medium text-text-primary">Ambient Sounds</span>
              <button onClick={() => setAmbientPanelOpen(false)} className="text-text-muted hover:text-text-primary">
                <X className="w-4 h-4" />
              </button>
            </div>
            <AmbientPlayer />
          </div>
        )}
      </div>

      {aiPanelOpen ? (
        <div className="w-80 border-l border-border bg-surface shrink-0 flex flex-col">
          <div className="flex items-center justify-between p-3 border-b border-border">
            <div className="flex gap-1">
              {(['summary', 'flashcards', 'quiz', 'chat'] as AITab[]).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                    activeTab === tab
                      ? 'bg-accent text-background'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {tab === 'summary' && 'Summary'}
                  {tab === 'flashcards' && 'Cards'}
                  {tab === 'quiz' && 'Quiz'}
                  {tab === 'chat' && 'Chat'}
                </button>
              ))}
            </div>
            <button onClick={() => setAiPanelOpen(false)} className="text-text-muted hover:text-text-primary">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-auto p-3">
            {activeTab === 'summary' && <SummaryPanel text={documentText} />}
            {activeTab === 'flashcards' && <FlashcardDeck text={documentText} documentId={currentDocument.id} />}
            {activeTab === 'quiz' && <QuizMode text={documentText} documentId={currentDocument.id} />}
            {activeTab === 'chat' && <ChatPanel text={documentText} documentId={currentDocument.id} />}
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAiPanelOpen(true)}
          className="fixed right-4 top-20 w-10 h-10 rounded-full bg-surface border border-border text-accent flex items-center justify-center hover:bg-accent-subtle transition-all z-10"
        >
          <Brain className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

function ChatPanel({ text, documentId }: { text: string; documentId: string }) {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const { askQuestion } = useAI()

  const sendMessage = async () => {
    if (!input.trim()) return
    const userMsg = { role: 'user', content: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const response = await askQuestion(text, input, messages)
      if (response) {
        setMessages(prev => [...prev, { role: 'assistant', content: response }])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto space-y-3 mb-3">
        {messages.map((msg, i) => (
          <div key={i} className={`p-3 rounded-xl text-sm ${
            msg.role === 'user'
              ? 'bg-accent-subtle text-text-primary ml-4'
              : 'bg-surface-elevated text-text-secondary mr-4'
          }`}>
            {msg.content}
          </div>
        ))}
        {loading && <p className="text-xs text-text-muted">Thinking...</p>}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Ask about this document..."
          className="flex-1 px-3 py-2 bg-surface border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
        />
        <button onClick={sendMessage} className="px-3 py-2 bg-accent text-background rounded-lg text-sm">
          Send
        </button>
      </div>
    </div>
  )
}
