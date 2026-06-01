import { useState, useCallback } from 'react'
import { parsePDF, parseDOCX, parseTXT, parsePPTX, parsePastedText } from '@/lib/fileParser'

interface ParseResult {
  title: string
  rawText: string
  htmlContent: string
}

export function useFileParser() {
  const [isParsing, setIsParsing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const parseFile = useCallback(async (file: File): Promise<ParseResult | null> => {
    setIsParsing(true)
    setError(null)
    try {
      const ext = file.name.split('.').pop()?.toLowerCase()
      let result: ParseResult
      switch (ext) {
        case 'pdf':
          result = await parsePDF(file)
          break
        case 'docx':
          result = await parseDOCX(file)
          break
        case 'pptx':
          result = await parsePPTX(file)
          break
        case 'txt':
        case 'md':
          result = await parseTXT(file)
          break
        default:
          throw new Error(`Unsupported file type: .${ext}`)
      }
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to parse file'
      setError(message)
      return null
    } finally {
      setIsParsing(false)
    }
  }, [])

  const parsePaste = useCallback((text: string): ParseResult => {
    return parsePastedText(text)
  }, [])

  return { parseFile, parsePaste, isParsing, error }
}
