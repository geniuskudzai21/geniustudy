import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAppStore } from '@/store/useAppStore'
import { useFileParser } from '@/hooks/useFileParser'
import { Upload, FileText, AlertCircle, Loader2 } from 'lucide-react'

const ACCEPTED_TYPES = '.pdf,.docx,.pptx,.txt,.md'
const MAX_SIZE = 20 * 1024 * 1024

export function FileUploader() {
  const navigate = useNavigate()
  const user = useAppStore((s) => s.user)
  const { parseFile, isParsing, error } = useFileParser()
  const [dragOver, setDragOver] = useState(false)
  const [progress, setProgress] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    if (!user) return
    if (file.size > MAX_SIZE) {
      setProgress('File exceeds 20MB limit')
      return
    }

    setProgress('Parsing file...')
    const result = await parseFile(file)
    if (!result) {
      setProgress(null)
      return
    }

    setProgress('Saving to cloud...')
    try {
      const ext = file.name.split('.').pop()
      const filePath = `${user.id}/${crypto.randomUUID()}.${ext}`
      await supabase.storage.from('study-files').upload(filePath, file)

      const { data } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          title: result.title,
          source_type: ext as string,
          raw_text: result.rawText,
          html_content: result.htmlContent,
          word_count: result.rawText.split(/\s+/).length,
          file_url: filePath,
        })
        .select()
        .single()

      if (data) {
        navigate(`/app/studio/${data.id}`)
      }
    } catch (err) {
      setProgress('Failed to save document')
    }
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
        dragOver ? 'border-accent bg-accent-glow' : 'border-border hover:border-accent/50'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES}
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />

      {isParsing || progress ? (
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
          <p className="text-sm text-text-secondary">{progress || 'Parsing...'}</p>
        </div>
      ) : (
        <>
          <Upload className="w-8 h-8 text-accent mx-auto mb-3" />
          <p className="text-text-primary font-medium mb-1">
            Drop your file here, or click to browse
          </p>
          <p className="text-text-muted text-sm">
            PDF, DOCX, PPTX, TXT, MD — up to 20MB
          </p>
          {error && (
            <div className="flex items-center gap-2 mt-3 text-error text-sm justify-center">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
        </>
      )}
    </div>
  )
}
