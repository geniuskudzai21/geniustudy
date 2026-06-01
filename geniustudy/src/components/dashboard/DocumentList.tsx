import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAppStore } from '@/store/useAppStore'
import { FileText, Search, Trash2, Star, Clock, ArrowUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Document } from '@/types'

interface DocumentListProps {
  documents: Document[]
  onRefresh: () => void
}

export function DocumentList({ documents, onRefresh }: DocumentListProps) {
  const navigate = useNavigate()
  const user = useAppStore((s) => s.user)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'recent' | 'alpha' | 'studied'>('recent')

  const filtered = documents
    .filter(d => d.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'recent') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      if (sortBy === 'alpha') return a.title.localeCompare(b.title)
      return 0
    })

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this document?')) return
    await supabase.from('documents').delete().eq('id', id)
    onRefresh()
  }

  const toggleFavourite = async (doc: Document) => {
    await supabase.from('documents').update({ is_favourite: !doc.is_favourite }).eq('id', doc.id)
    onRefresh()
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-12 bg-surface border border-border rounded-xl">
        <FileText className="w-10 h-10 text-text-muted mx-auto mb-3" />
        <p className="text-text-secondary font-medium">No documents yet</p>
        <p className="text-text-muted text-sm mt-1">Upload a file or paste notes to get started</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents..."
            className="w-full pl-9 pr-4 py-2 bg-surface border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
          />
        </div>
        <div className="flex gap-1">
          {(['recent', 'alpha'] as const).map(s => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={cn(
                "px-3 py-1.5 text-xs rounded-lg capitalize transition-colors",
                sortBy === s ? 'bg-accent-subtle text-accent' : 'text-text-secondary hover:text-text-primary'
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(doc => (
          <div
            key={doc.id}
            onClick={() => navigate(`/app/studio/${doc.id}`)}
            className="bg-surface border border-border rounded-xl p-4 hover:border-accent/30 hover:-translate-y-0.5 transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-accent" />
                <span className="text-xs px-2 py-0.5 bg-accent-subtle text-accent rounded-md uppercase">
                  {doc.source_type}
                </span>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => { e.stopPropagation(); toggleFavourite(doc) }}
                  className={cn("p-1 rounded transition-colors", doc.is_favourite ? 'text-accent' : 'text-text-muted hover:text-accent')}
                >
                  <Star className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(doc.id) }}
                  className="p-1 rounded text-text-muted hover:text-error transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <h3 className="font-medium text-text-primary text-sm mb-2 line-clamp-2">{doc.title}</h3>
            <div className="flex items-center gap-3 text-xs text-text-muted">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(doc.created_at).toLocaleDateString()}
              </span>
              <span>{doc.word_count?.toLocaleString()} words</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
