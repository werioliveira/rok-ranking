"use client";
import { useState } from "react";
import * as XLSX from "xlsx";

export default function UploadKingdom() {
  const [file, setFile] = useState<File | null>(null);
  const [kingdomId, setKingdomId] = useState("");
  const [kingdomName, setKingdomName] = useState("");
  const [password, setPassword] = useState("");
  const [previewData, setPreviewData] = useState<any[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    setFile(f);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        let jsonData: any[] = XLSX.utils.sheet_to_json(sheet, { defval: null });

        // Limita a 10 registros para preview
        jsonData = jsonData.slice(0, 10);

        setPreviewData(jsonData);
      } catch (err) {
        console.error("Erro ao ler XLSX:", err);
        setPreviewData([]);
      }
    };
    reader.readAsArrayBuffer(f);
  };

  const handleUpload = async () => {
    if (!file || !kingdomId || !kingdomName || !password) {
      alert("Preencha todos os campos e selecione o arquivo.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("password", password);
    formData.append("kingdomId", kingdomId);
    formData.append("kingdomName", kingdomName);

    const res = await fetch("/api/upload/kingdom", {
      method: "POST",
      body: formData,
    });

    const json = await res.json();
    console.log(json);
    alert(json.message || "Upload concluído");
  };

  return (
    <div className="p-4 max-w-md mx-auto space-y-4 border rounded-lg shadow">
      <h2 className="text-xl font-bold">Upload de Reino</h2>

      <input
        type="text"
        placeholder="Kingdom ID"
        value={kingdomId}
        onChange={(e) => setKingdomId(e.target.value)}
        className="w-full border p-2 rounded text-black"
      />

      <input
        type="text"
        placeholder="Kingdom Name"
        value={kingdomName}
        onChange={(e) => setKingdomName(e.target.value)}
        className="w-full border p-2 rounded text-black"
      />

      <input
        type="password"
        placeholder="Senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full border p-2 rounded text-black"
      />

      <input
        type="file"
        accept=".xlsx"
        onChange={handleFileChange}
        className="w-full"
      />

      <button
        onClick={handleUpload}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        Enviar Reino
      </button>

      {previewData.length > 0 && (
        <div className="mt-4" >
          <h3 className="text-lg font-semibold mb-2">Pré-visualização (até 10 linhas)</h3>
          <div className="overflow-x-auto border rounded p-2 bg-gray-50">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr>
                  {Object.keys(previewData[0]).map((key) => (
                    <th key={key} className="border px-2 py-1 text-left text-black">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewData.map((row, idx) => (
                  <tr key={idx}>
                    {Object.keys(row).map((key) => (
                      <td key={key} className="border px-2 py-1 text-black">
                        {row[key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
