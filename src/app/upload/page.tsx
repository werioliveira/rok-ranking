'use client'

import { useState } from 'react'
import * as XLSX from 'xlsx'

export default function UploadPage() {
  const [data, setData] = useState<object[] | null>(null)
  const [password, setPassword] = useState('')
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
          // Lê JSONL
          const text = event.target?.result as string
          const lines = text
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .map(line => JSON.parse(line))
          setData(lines)
        } else if (ext === 'xlsx' || ext === 'xls') {
          // Lê XLSX
          const arrayBuffer = event.target?.result as ArrayBuffer
          const workbook = XLSX.read(arrayBuffer, { type: 'array' })
          const sheetName = workbook.SheetNames[0]
          const sheet = workbook.Sheets[sheetName]
          let jsonData: any[] = XLSX.utils.sheet_to_json(sheet, { defval: null })

          // Ignora primeira linha se necessário
          jsonData = jsonData.slice(1, 401) // primeira linha é header, até 400 registros

          setData(jsonData)
        } else {
          throw new Error('Formato de arquivo não suportado')
        }

        setError(null)
        setSuccess(null)
      } catch (err) {
        setError('Erro ao ler arquivo: ' + (err as Error).message)
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
    if (!data || !password) {
      setError('Por favor, carregue o arquivo e insira a senha.')
      return
    }

    setUploading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, players: data }),
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Erro desconhecido')

      setSuccess(`Enviado com sucesso: ${result.count} registros`)
    } catch (err) {
      setError('Erro ao enviar: ' + (err as Error).message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Upload de JSONL / XLSX</h1>

      <div className="space-y-4">
        <input
          type="file"
          accept=".json,.jsonl,.xlsx,.xls"
          onChange={handleFileChange}
          className="w-full border border-gray-300 p-2 rounded"
        />

        <input
          type="password"
          placeholder="Digite a senha de upload"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-300 p-2 rounded bg-gray-800"
        />

        {error && <p className="text-red-600 font-medium">{error}</p>}
        {success && <p className="text-green-600 font-medium">{success}</p>}
      </div>

      {data && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Pré-visualização dos dados:</h2>
          <pre className="bg-gray-800 p-4 rounded max-h-[400px] overflow-y-auto text-sm">
            {JSON.stringify(data, null, 2)}
          </pre>

          <button
            onClick={handleUpload}
            disabled={uploading}
            className="mt-4 px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {uploading ? 'Enviando...' : 'Enviar para o servidor'}
          </button>
        </div>
      )}
    </main>
  )
}
