import * as pdfjsLib from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

export async function parsePDF(file: File): Promise<{ title: string; rawText: string; htmlContent: string }> {
  const buffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise
  let text = ''
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    text += content.items.map((item: any) => item.str).join(' ') + '\n\n'
  }
  const title = file.name.replace(/\.pdf$/i, '')
  const html = textToHTML(text)
  return { title, rawText: text, htmlContent: html }
}

export async function parseDOCX(file: File): Promise<{ title: string; rawText: string; htmlContent: string }> {
  const mammoth = await import('mammoth')
  const buffer = await file.arrayBuffer()
  const result = await mammoth.extractRawText({ arrayBuffer: buffer })
  const text = result.value
  const title = file.name.replace(/\.docx$/i, '')
  const html = textToHTML(text)
  return { title, rawText: text, htmlContent: html }
}

export async function parseTXT(file: File): Promise<{ title: string; rawText: string; htmlContent: string }> {
  const text = await file.text()
  const title = file.name.replace(/\.(txt|md)$/i, '')
  const html = textToHTML(text)
  return { title, rawText: text, htmlContent: html }
}

export async function parsePPTX(file: File): Promise<{ title: string; rawText: string; htmlContent: string }> {
  const JSZip = (await import('jszip')).default
  const buffer = await file.arrayBuffer()
  const zip = await JSZip.loadAsync(buffer)
  let text = ''
  const slideFiles = Object.keys(zip.files).filter(f => f.startsWith('ppt/slides/slide') && f.endsWith('.xml'))
  slideFiles.sort()
  for (const slideFile of slideFiles) {
    const content = await zip.files[slideFile].async('text')
    const parser = new DOMParser()
    const xml = parser.parseFromString(content, 'text/xml')
    const texts = xml.querySelectorAll('a\\:t, t')
    texts.forEach(t => { text += t.textContent + ' ' })
    text += '\n\n'
  }
  const title = file.name.replace(/\.pptx$/i, '')
  const html = textToHTML(text)
  return { title, rawText: text, htmlContent: html }
}

function textToHTML(text: string): string {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  let html = ''
  for (const line of lines) {
    if (line.startsWith('#')) {
      const match = line.match(/^(#{1,3})\s+(.+)/)
      if (match) {
        const level = match[1].length
        html += `<h${level}>${escapeHtml(match[2])}</h${level}>\n`
        continue
      }
    }
    if (line.match(/^[-*]\s/)) {
      html += `<li>${escapeHtml(line.replace(/^[-*]\s/, ''))}</li>\n`
      continue
    }
    html += `<p>${escapeHtml(line)}</p>\n`
  }
  return html
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export function parsePastedText(text: string): { title: string; rawText: string; htmlContent: string } {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  let title = 'Untitled Notes'
  if (lines.length > 0 && lines[0].startsWith('#')) {
    title = lines[0].replace(/^#+\s+/, '')
  }
  const html = textToHTML(text)
  return { title, rawText: text, htmlContent: html }
}
