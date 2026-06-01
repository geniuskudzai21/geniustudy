import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAppStore } from '@/store/useAppStore'
import { Clock, Flame, BookOpen, Award } from 'lucide-react'

export function StudyStats() {
  const user = useAppStore((s) => s.user)
  const [todayMinutes, setTodayMinutes] = useState(0)
  const [docCount, setDocCount] = useState(0)

  useEffect(() => {
    if (!user) return
    loadStats()
  }, [user])

  async function loadStats() {
    if (!user) return
    const today = new Date().toISOString().split('T')[0]

    const { data: sessions } = await supabase
      .from('study_sessions')
      .select('duration_secs')
      .eq('user_id', user.id)
      .gte('started_at', today)

    if (sessions) {
      const totalMin = sessions.reduce((sum, s) => sum + (s.duration_secs || 0), 0) / 60
      setTodayMinutes(Math.round(totalMin))
    }

    const { count } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
    if (count !== null) setDocCount(count)
  }

  const stats = [
    { icon: Clock, label: "Today's Study", value: `${todayMinutes}m`, color: 'text-accent' },
    { icon: Flame, label: 'Streak', value: `${user?.streak_days || 0} days`, color: 'text-warning' },
    { icon: BookOpen, label: 'Documents', value: `${docCount}`, color: 'text-info' },
    { icon: Award, label: 'Level', value: `${user?.level || 1}`, color: 'text-success' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {stats.map(stat => (
        <div key={stat.label} className="bg-surface border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <stat.icon className={`w-4 h-4 ${stat.color}`} />
            <span className="text-xs text-text-muted">{stat.label}</span>
          </div>
          <p className="text-lg font-bold text-text-primary">{stat.value}</p>
        </div>
      ))}
    </div>
  )
}
