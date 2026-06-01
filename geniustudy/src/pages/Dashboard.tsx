import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAppStore } from '@/store/useAppStore'
import { FileUploader } from '@/components/uploader/FileUploader'
import { PasteNotes } from '@/components/uploader/PasteNotes'
import { DocumentList } from '@/components/dashboard/DocumentList'
import { StudyStats } from '@/components/dashboard/StudyStats'
import { Flame, Upload, FileText, Plus } from 'lucide-react'
import type { Document } from '@/types'

export function Dashboard() {
  const navigate = useNavigate()
  const user = useAppStore((s) => s.user)
  const [documents, setDocuments] = useState<Document[]>([])
  const [showUploader, setShowUploader] = useState(false)
  const [showPaste, setShowPaste] = useState(false)

  useEffect(() => {
    if (user) loadDocuments()
  }, [user])

  async function loadDocuments() {
    if (!user) return
    const { data } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (data) setDocuments(data)
  }

  return (
    <div className="p-6 max-w-6xl mx-auto animate-fade-in-up">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-text-primary">
            Welcome back{user?.display_name ? `, ${user.display_name}` : ''}
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Ready to study? Pick up where you left off.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-surface border border-border rounded-xl px-4 py-2">
            <Flame className="w-4 h-4 text-warning" />
            <span className="text-sm font-medium text-text-primary">
              {user?.streak_days || 0} day streak
            </span>
          </div>
          <div className="flex items-center gap-2 bg-surface border border-border rounded-xl px-4 py-2">
            <span className="text-sm text-text-primary font-medium">Lv.{user?.level || 1}</span>
            <span className="text-xs text-text-muted">{user?.xp || 0} XP</span>
          </div>
        </div>
      </div>

      <StudyStats />

      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => { setShowUploader(true); setShowPaste(false) }}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-background font-medium rounded-xl hover:brightness-110 transition-all text-sm"
        >
          <Upload className="w-4 h-4" />
          Upload File
        </button>
        <button
          onClick={() => { setShowPaste(true); setShowUploader(false) }}
          className="flex items-center gap-2 px-4 py-2 border border-border text-text-secondary rounded-xl hover:bg-surface hover:text-text-primary transition-all text-sm"
        >
          <FileText className="w-4 h-4" />
          Paste Notes
        </button>
      </div>

      {showUploader && (
        <div className="mb-6">
          <FileUploader />
        </div>
      )}
      {showPaste && (
        <div className="mb-6">
          <PasteNotes />
        </div>
      )}

      <DocumentList documents={documents} onRefresh={loadDocuments} />
    </div>
  )
}
