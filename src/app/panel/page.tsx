"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Header";

interface TotalesResponse {
  totalVentas: number;
  totalEventos: number;
  totalPremios: number;
  totalUsuarios: number;
}

interface LogResponse {
  nombreCliente: string;
  descripcionAccion: string;
  detalle: string;
  fechaHora: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState({
    ventas: 0,
    eventos: 0,
    premios: 0,
    usuarios: 0,
  });

  const [logs, setLogs] = useState<LogResponse[]>([]);

  useEffect(() => {
    // Cargar totales
    const fetchTotales = async () => {
      try {
        const res = await fetch("http://148.230.72.52:8080/v1/azzar/totales");
        if (!res.ok) throw new Error("Error al obtener los totales");

        const data: TotalesResponse = await res.json();
        setStats({
          ventas: data.totalVentas,
          eventos: data.totalEventos,
          premios: data.totalPremios,
          usuarios: data.totalUsuarios,
        });
      } catch (error) {
        console.error("Error al cargar los totales:", error);
      }
    };

    // Cargar logs
    const fetchLogs = async () => {
      try {
        const res = await fetch("http://148.230.72.52:8080/v1/azzar/logs");
        if (!res.ok) throw new Error("Error al obtener los logs");

        const data: LogResponse[] = await res.json();
        setLogs(data);
      } catch (error) {
        console.error("Error al cargar los logs:", error);
      }
    };

    fetchTotales();
    fetchLogs();
  }, []);

  return (
    <>
      <Sidebar />
      <main
        style={{
          marginLeft: "240px",
          padding: "40px",
          backgroundColor: "#f9fafb",
          minHeight: "100vh",
        }}
      >
        <h1
          style={{
            fontSize: "1.8rem",
            fontWeight: 600,
            marginBottom: "24px",
            color: "#2c3e50",
          }}
        >
          Panel de Inicio
        </h1>

        {/* Estadísticas */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "20px",
            marginBottom: "40px",
          }}
        >
          {/* Ventas */}
          <div
            style={{
              background: "#fff",
              borderRadius: "12px",
              padding: "20px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "32px", color: "#1abc9c" }}
            >
              attach_money
            </span>
            <div>
              <p style={{ margin: 0, fontSize: "14px", color: "#7f8c8d" }}>
                Ventas Totales
              </p>
              <h2 style={{ margin: 0, color: "#2c3e50" }}>{stats.ventas}</h2>
            </div>
          </div>

          {/* Eventos */}
          <div
            style={{
              background: "#fff",
              borderRadius: "12px",
              padding: "20px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "32px", color: "#3498db" }}
            >
              celebration
            </span>
            <div>
              <p style={{ margin: 0, fontSize: "14px", color: "#7f8c8d" }}>
                Eventos Activos
              </p>
              <h2 style={{ margin: 0, color: "#2c3e50" }}>{stats.eventos}</h2>
            </div>
          </div>

          {/* Premios */}
          <div
            style={{
              background: "#fff",
              borderRadius: "12px",
              padding: "20px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "32px", color: "#9b59b6" }}
            >
              featured_seasonal_and_gifts
            </span>
            <div>
              <p style={{ margin: 0, fontSize: "14px", color: "#7f8c8d" }}>
                Premios Disponibles
              </p>
              <h2 style={{ margin: 0, color: "#2c3e50" }}>{stats.premios}</h2>
            </div>
          </div>

          {/* Usuarios */}
          <div
            style={{
              background: "#fff",
              borderRadius: "12px",
              padding: "20px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "32px", color: "#e67e22" }}
            >
              groups
            </span>
            <div>
              <p style={{ margin: 0, fontSize: "14px", color: "#7f8c8d" }}>
                Usuarios Registrados
              </p>
              <h2 style={{ margin: 0, color: "#2c3e50" }}>{stats.usuarios}</h2>
            </div>
          </div>
        </section>

        {/* Actividad reciente */}
        <section>
          <h3
            style={{
              fontSize: "1.2rem",
              fontWeight: 600,
              color: "#2c3e50",
              marginBottom: "16px",
            }}
          >
            Actividad Reciente
          </h3>

          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              backgroundColor: "#fff",
              borderRadius: "12px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
              overflow: "hidden",
            }}
          >
            <thead style={{ background: "#ecf0f1", textAlign: "left" }}>
              <tr>
                <th style={{ padding: "12px 16px", fontSize: "14px" }}>Fecha</th>
                <th style={{ padding: "12px 16px", fontSize: "14px" }}>Evento</th>
                <th style={{ padding: "12px 16px", fontSize: "14px" }}>Usuario</th>
                <th style={{ padding: "12px 16px", fontSize: "14px" }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: "12px 16px", textAlign: "center" }}>
                    No hay actividad reciente
                  </td>
                </tr>
              ) : (
                logs.map((log, idx) => (
                  <tr key={idx} style={{ background: idx % 2 === 0 ? "#fff" : "#fafafa" }}>
                    <td style={{ padding: "12px 16px", fontSize: "14px" }}>
                      {new Date(log.fechaHora).toLocaleString()}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "14px" }}>
                      {log.detalle}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "14px" }}>
                      {log.nombreCliente}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "14px" }}>
                      {log.descripcionAccion}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      </main>
    </>
  );
}
