'use client'

import { useState } from 'react'
import * as XLSX from 'xlsx'
import { useSession } from 'next-auth/react'

export default function UploadPage() {
  const { data: session } = useSession()
  const [data, setData] = useState<any[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    const ext = file.name.split('.').pop()?.toLowerCase()

    reader.onload = async (event) => {
      try {
        if (ext === 'json' || ext === 'jsonl') {
          const text = event.target?.result as string
          const lines = text
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .map(line => JSON.parse(line))
          setData(lines)
        } else if (ext === 'xlsx' || ext === 'xls') {
          const arrayBuffer = event.target?.result as ArrayBuffer
          const workbook = XLSX.read(arrayBuffer, { type: 'array' })
          const sheetName = workbook.SheetNames[0]
          const sheet = workbook.Sheets[sheetName]
          const jsonData: any[] = XLSX.utils.sheet_to_json(sheet, { defval: null })
          
          // Limit to first 1000 records for safety
          setData(jsonData.slice(0, 1000))
        } else {
          throw new Error('Unsupported file format')
        }

        setError(null)
        setSuccess(null)
      } catch (err) {
        setError('Error reading file: ' + (err as Error).message)
        setData(null)
      }
    }

    if (ext === 'xlsx' || ext === 'xls') {
      reader.readAsArrayBuffer(file)
    } else {
      reader.readAsText(file)
    }
  }

  const handleUpload = async () => {
    if (!data) {
      setError('Please load a file first.')
      return
    }

    setUploading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ players: data }), // Senha removida daqui
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Unknown error')

      setSuccess(`Success: ${result.count} snapshots deployed to the database.`)
      setData(null) // Limpa após sucesso
    } catch (err) {
      setError('Upload failed: ' + (err as Error).message)
    } finally {
      setUploading(false)
    }
  }

  if (session?.user.role !== "ADMIN") {
    return <div className="p-10 text-center text-red-500 font-bold">Access Denied: Royal Clearance Required</div>
  }

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center text-primary uppercase tracking-widest">
        Deploy Kill Data
      </h1>

      <div className="space-y-4 bg-card p-6 rounded-xl border border-muted shadow-royal">
        <label className="block text-sm font-medium text-muted-foreground mb-2">
          Select JSONL or XLSX Kingdom Snapshot
        </label>
        <input
          type="file"
          accept=".json,.jsonl,.xlsx,.xls"
          onChange={handleFileChange}
          className="w-full border border-muted p-2 rounded bg-background text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
        />

        {error && <p className="text-red-500 bg-red-500/10 p-3 rounded text-sm">{error}</p>}
        {success && <p className="text-green-500 bg-green-500/10 p-3 rounded text-sm">{success}</p>}
      </div>

      {data && (
        <div className="mt-6 animate-in fade-in slide-in-from-bottom-4">
          <h2 className="text-xl font-semibold mb-2 text-foreground flex items-center gap-2">
            Data Preview <span className="text-xs text-muted-foreground">({data.length} records)</span>
          </h2>
          <pre className="bg-slate-950 p-4 rounded-lg max-h-[300px] overflow-y-auto text-[10px] text-blue-300 border border-muted">
            {JSON.stringify(data.slice(0, 3), null, 2)}
          </pre>

          <button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full mt-4 px-5 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg font-bold shadow-lg hover:shadow-glow transition-all disabled:opacity-50"
          >
            {uploading ? 'Processing Deployment...' : 'Confirm Upload to Kingdom Database'}
          </button>
        </div>
      )}
    </main>
  )
}