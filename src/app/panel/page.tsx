// app/inicio/page.tsx
"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Header";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    ventas: 0,
    eventos: 0,
    premios: 0,
    usuarios: 0,
  });

  // Simulación de carga de datos
  useEffect(() => {
    setTimeout(() => {
      setStats({
        ventas: 125,
        eventos: 8,
        premios: 14,
        usuarios: 232,
      });
    }, 800);
  }, []);

  return (
    <>
        <Sidebar />
        <main
      style={{
        marginLeft: "240px", // espacio para la Sidebar
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
            <tr>
              <td style={{ padding: "12px 16px", fontSize: "14px" }}>26/10/2025</td>
              <td style={{ padding: "12px 16px", fontSize: "14px" }}>Rifa Halloween</td>
              <td style={{ padding: "12px 16px", fontSize: "14px" }}>jsosa</td>
              <td style={{ padding: "12px 16px", fontSize: "14px" }}>Compra realizada</td>
            </tr>
            <tr style={{ background: "#fafafa" }}>
              <td style={{ padding: "12px 16px", fontSize: "14px" }}>25/10/2025</td>
              <td style={{ padding: "12px 16px", fontSize: "14px" }}>Premio Octubre</td>
              <td style={{ padding: "12px 16px", fontSize: "14px" }}>mperez</td>
              <td style={{ padding: "12px 16px", fontSize: "14px" }}>Nuevo ganador</td>
            </tr>
          </tbody>
        </table>
      </section>
    </main>
    </>
    
  );
}
