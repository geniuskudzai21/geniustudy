export interface Profile {
  id: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
  xp: number;
  level: number;
  streak_days: number;
  last_studied?: string;
  created_at: string;
}

export interface Document {
  id: string;
  user_id: string;
  title: string;
  source_type: 'pdf' | 'docx' | 'pptx' | 'txt' | 'paste';
  raw_text?: string;
  html_content?: string;
  word_count: number;
  file_url?: string;
  is_favourite: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  theme: string;
  font_family: string;
  font_size: number;
  line_height: number;
  reading_width: string;
  tts_voice?: string;
  tts_speed: number;
  tts_pitch: number;
  tts_volume: number;
  tts_highlight: string;
  ambient_preset: string;
  ambient_volume: number;
  pomodoro_enabled: boolean;
  pomodoro_focus: number;
  pomodoro_break: number;
  updated_at: string;
}

export interface StudySession {
  id: string;
  user_id: string;
  document_id?: string;
  started_at: string;
  ended_at?: string;
  duration_secs?: number;
  xp_earned: number;
  created_at: string;
}

export interface Flashcard {
  id: string;
  user_id: string;
  document_id: string;
  question: string;
  answer: string;
  ease_factor: number;
  interval_days: number;
  repetitions: number;
  next_review: string;
  last_quality?: number;
  created_at: string;
}

export interface QuizResult {
  id: string;
  user_id: string;
  document_id: string;
  score: number;
  total: number;
  percentage: number;
  time_secs?: number;
  questions: QuizQuestionData[];
  created_at: string;
}

export interface QuizQuestionData {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  userAnswer?: number;
}

export interface Highlight {
  id: string;
  user_id: string;
  document_id: string;
  text: string;
  color: string;
  note?: string;
  char_start: number;
  char_end: number;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  document_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export type ReadingTheme = 'dark' | 'light' | 'sepia' | 'forest' | 'midnight';
export type ReadingWidth = 'narrow' | 'medium' | 'wide';
export type FontFamily = 'serif' | 'sans';

export interface AmbientSound {
  id: string;
  name: string;
  icon: string;
  category: 'nature' | 'study' | 'white-noise' | 'focus' | 'space';
  active: boolean;
  volume: number;
}

export interface AISummary {
  overview: string;
  keyPoints: string[];
  difficulty: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}
