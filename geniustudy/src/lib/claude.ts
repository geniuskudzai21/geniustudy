const API_KEY = import.meta.env.VITE_GROQ_API_KEY || ''
const BASE_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.3-70b-versatile'

async function callGroq(systemPrompt: string, userMessage: string, retries = 3): Promise<string> {
  for (let attempt = 0; attempt < retries; attempt++) {
    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
      }),
    })

    if (res.status === 429 && attempt < retries - 1) {
      const delay = 2000 * Math.pow(2, attempt)
      await new Promise(r => setTimeout(r, delay))
      continue
    }

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Groq API error (${res.status}): ${err}`)
    }

    const data = await res.json()
    return data.choices[0].message.content
  }

  throw new Error('Groq API: exhausted retries')
}

export async function generateSummary(text: string, length: 'brief' | 'standard' | 'detailed' = 'standard') {
  const lengthMap = { brief: '2-3', standard: '5-7', detailed: '10-15' }
  const sys = `You are a study assistant. Return a JSON object with: { "overview": string, "keyPoints": string[], "difficulty": "easy" | "medium" | "hard" }. Keep overview to ${lengthMap[length]} sentences.`
  const raw = await callGroq(sys, `Summarize the following study material:\n\n${text.slice(0, 50000)}`)
  const cleaned = raw.replace(/```json\s*|\s*```/g, '')
  return JSON.parse(cleaned)
}

export async function generateFlashcards(text: string, count: number = 10) {
  const sys = `You are a study assistant. Return a JSON array of ${count} objects with: { "question": string, "answer": string }. Questions should test understanding, not just recall.`
  const raw = await callGroq(sys, `Generate ${count} flashcards from this material:\n\n${text.slice(0, 50000)}`)
  const cleaned = raw.replace(/```json\s*|\s*```/g, '')
  return JSON.parse(cleaned)
}

export async function generateQuiz(text: string, count: number = 5) {
  const sys = `You are a study assistant. Return a JSON array of ${count} objects with: { "question": string, "options": string[], "correct": number (index of correct answer), "explanation": string }.`
  const raw = await callGroq(sys, `Generate a ${count}-question multiple choice quiz from this material:\n\n${text.slice(0, 50000)}`)
  const cleaned = raw.replace(/```json\s*|\s*```/g, '')
  return JSON.parse(cleaned)
}

export async function askDocument(text: string, question: string, history: { role: string; content: string }[] = []) {
  const sys = `You are a study assistant. Answer questions based solely on the provided document. If the answer isn't in the document, say so.`
  const messages = [
    { role: 'system', content: sys },
    { role: 'user', content: `Document:\n${text.slice(0, 50000)}` },
    ...history.map(m => ({ role: m.role, content: m.content })),
    { role: 'user', content: question },
  ]

  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({ model: MODEL, messages }),
    })

    if (res.status === 429 && attempt < 2) {
      const delay = 2000 * Math.pow(2, attempt)
      await new Promise(r => setTimeout(r, delay))
      continue
    }

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Groq API error (${res.status}): ${err}`)
    }

    const data = await res.json()
    return data.choices[0].message.content
  }

  throw new Error('Groq API: exhausted retries')
}

export async function explainText(text: string, selectedText: string) {
  const sys = `You are a study assistant. Explain the given concept simply and concisely in 2-3 sentences.`
  return callGroq(sys, `Context:\n${text.slice(0, 50000)}\n\nExplain this: "${selectedText}"`)
}
