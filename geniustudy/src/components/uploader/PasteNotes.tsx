import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAppStore } from '@/store/useAppStore'
import { parsePastedText } from '@/lib/fileParser'
import { FileText, Loader2 } from 'lucide-react'

export function PasteNotes() {
  const navigate = useNavigate()
  const user = useAppStore((s) => s.user)
  const [text, setText] = useState('')
  const [saving, setSaving] = useState(false)

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0

  const handleSave = async () => {
    if (!user || !text.trim()) return
    setSaving(true)
    try {
      const result = parsePastedText(text)
      const { data } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          title: result.title,
          source_type: 'paste',
          raw_text: result.rawText,
          html_content: result.htmlContent,
          word_count: wordCount,
        })
        .select()
        .single()

      if (data) navigate(`/app/studio/${data.id}`)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-4">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste your notes or markdown here..."
        className="w-full h-48 px-4 py-3 bg-background border border-border rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent resize-none text-sm"
      />
      <div className="flex items-center justify-between mt-3">
        <span className="text-xs text-text-muted">{wordCount} words</span>
        <button
          onClick={handleSave}
          disabled={!text.trim() || saving}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-background font-medium rounded-xl hover:brightness-110 transition-all text-sm disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
          Start Studying
        </button>
      </div>
    </div>
  )
}
