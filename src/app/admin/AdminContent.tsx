"use client";

import { useEffect, useState } from "react";

type Appointment = {
  _id: string;
  name: string;
  phone: string;
  email: string;
  date: string; // ISO string
  time: string; // ex: "10:30"
  reason?: string;
};

function formatDateTime(dateISO: string, time: string) {
  const date = new Date(dateISO);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}-${month}-${year} às ${time}h`;
}

export default function AdminContent() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filterDate, setFilterDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<string | null>(null);

  const itemsPerPage = 5;

  async function fetchAppointments(page: number, filterDate: string) {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", itemsPerPage.toString());
    if (filterDate) {
      params.append("date", filterDate); // backend deve filtrar por esta data exata YYYY-MM-DD
    }

    const res = await fetch(`/api/appointments?${params.toString()}`);
    const json = await res.json();

    if (json.data) {
      setAppointments(json.data);
      setTotalPages(json.totalPages);
    }
  }

  useEffect(() => {
    fetchAppointments(currentPage, filterDate);
  }, [currentPage, filterDate]);

  function openDeleteModal(id: string) {
    setAppointmentToDelete(id);
    setModalOpen(true);
  }

  async function confirmDelete() {
    if (!appointmentToDelete) return;

    const res = await fetch(`/api/appointments/${appointmentToDelete}`, { method: "DELETE" });
    if (res.ok) {
      // Atualiza lista depois da exclusão
      fetchAppointments(currentPage, filterDate);
      setModalOpen(false);
      setAppointmentToDelete(null);
    } else {
      alert("Erro ao cancelar agendamento.");
    }
  }

  function cancelDelete() {
    setModalOpen(false);
    setAppointmentToDelete(null);
  }

  function exportToCSV() {
    if (appointments.length === 0) {
      alert("Nenhum agendamento para exportar.");
      return;
    }

    const rows = appointments.map((a) => ({
      Nome: a.name,
      Telefone: a.phone,
      Email: a.email,
      Data: formatDateTime(a.date, a.time),
      Hora: a.time,
      Motivo: a.reason || "",
    }));

    const header = Object.keys(rows[0]).join(",");
    const body = rows
      .map((row) =>
        Object.values(row)
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");
    const csv = `${header}\n${body}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "agendamentos.csv";
    link.click();
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Agendamentos</h1>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <input
          type="date"
          value={filterDate}
          onChange={(e) => {
            setFilterDate(e.target.value);
            setCurrentPage(1); // reseta para página 1 no filtro
          }}
          className="border rounded px-3 py-2 w-full sm:w-auto"
          placeholder="Filtrar por data"
        />
        <button
          onClick={exportToCSV}
          className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700 transition"
        >
          Exportar CSV
        </button>
      </div>

      <ul className="space-y-5">
        {appointments.length === 0 && (
          <li className="text-center text-gray-500">Nenhum agendamento encontrado.</li>
        )}
        {appointments.map((appt) => (
          <li
            key={appt._id}
            className="border border-gray-300 rounded-lg p-5 shadow hover:shadow-md transition"
          >
            <p>
              <strong>Nome:</strong> {appt.name}
            </p>
            <p>
              <strong>Telefone:</strong> {appt.phone}
            </p>
            <p>
              <strong>Email:</strong> {appt.email}
            </p>
            <p>
              <strong>Data e Hora:</strong> {formatDateTime(appt.date, appt.time)}
            </p>
            <p>
              <strong>Motivo:</strong> {appt.reason || "-"}
            </p>
            <button
              onClick={() => openDeleteModal(appt._id)}
              className="mt-3 text-sm text-red-600 underline hover:text-red-800"
            >
              Cancelar
            </button>
          </li>
        ))}
      </ul>

      {totalPages > 1 && (
        <div className="flex justify-center mt-8 gap-3">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            &lt; Anterior
          </button>

          {[...Array(totalPages)].map((_, i) => {
            const page = i + 1;
            return (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 border rounded ${
                  currentPage === page ? "bg-blue-600 text-white" : "hover:bg-blue-100"
                }`}
              >
                {page}
              </button>
            );
          })}

          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Próximo &gt;
          </button>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Confirmar cancelamento</h2>
            <p className="mb-6">Tem certeza que deseja cancelar este agendamento?</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 border rounded hover:bg-gray-100 transition"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
