const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY || ''
const API_URL = 'https://api.anthropic.com/v1/messages'

async function callClaude(systemPrompt: string, userMessage: string): Promise<string> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Claude API error: ${err}`)
  }

  const data = await res.json()
  return data.content[0].text
}

export async function generateSummary(text: string, length: 'brief' | 'standard' | 'detailed' = 'standard') {
  const lengthMap = { brief: '2-3', standard: '5-7', detailed: '10-15' }
  const sys = `You are a study assistant. Return a JSON object with: { "overview": string, "keyPoints": string[], "difficulty": "easy" | "medium" | "hard" }. Keep overview to ${lengthMap[length]} sentences.`
  const raw = await callClaude(sys, `Summarize the following study material:\n\n${text.slice(0, 50000)}`)
  return JSON.parse(raw)
}

export async function generateFlashcards(text: string, count: number = 10) {
  const sys = `You are a study assistant. Return a JSON array of ${count} objects with: { "question": string, "answer": string }. Questions should test understanding, not just recall.`
  const raw = await callClaude(sys, `Generate ${count} flashcards from this material:\n\n${text.slice(0, 50000)}`)
  return JSON.parse(raw)
}

export async function generateQuiz(text: string, count: number = 5) {
  const sys = `You are a study assistant. Return a JSON array of ${count} objects with: { "question": string, "options": string[], "correct": number (index of correct answer), "explanation": string }.`
  const raw = await callClaude(sys, `Generate a ${count}-question multiple choice quiz from this material:\n\n${text.slice(0, 50000)}`)
  return JSON.parse(raw)
}

export async function askDocument(text: string, question: string, history: { role: string; content: string }[] = []) {
  const sys = `You are a study assistant. Answer questions based solely on the provided document. If the answer isn't in the document, say so.`
  const messages = history.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }))
  messages.unshift({ role: 'user', content: `Document:\n${text.slice(0, 50000)}` })

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 4096,
      system: sys,
      messages: [...messages, { role: 'user', content: question }],
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Claude API error: ${err}`)
  }

  const data = await res.json()
  return data.content[0].text
}

export async function explainText(text: string, selectedText: string) {
  const sys = `You are a study assistant. Explain the given concept simply and concisely in 2-3 sentences.`
  return callClaude(sys, `Context:\n${text.slice(0, 50000)}\n\nExplain this: "${selectedText}"`)
}
