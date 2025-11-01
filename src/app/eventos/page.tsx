"use client";

import { useState, useEffect } from "react";
import Sidebar from "../components/Header";
import styles from "./page.module.css";
import { jwtDecode } from "jwt-decode";

const API_EVENTOS_URL = "http://localhost:8080/v1/azzar/eventos";

export default function EventosPage() {
  const [eventos, setEventos] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchEventos();
  }, []);

  const fetchEventos = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token");
      const decoded: any = jwtDecode(token);
      const idEmpresa = decoded.idEmpresa;

      const response = await fetch(`${API_EVENTOS_URL}?idEmpresa=${idEmpresa}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setEventos(data);
    } catch (error) {
      console.error("Error cargando eventos:", error);
    }
  };

  const filteredEventos = eventos.filter((e) =>
    e.nombreEvento.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Sidebar />
      <main className={styles.main}>
        <div className={styles.header}>
          <div >
            <h1 style={{
          fontSize: "1.8rem",
          fontWeight: 600,
          marginBottom: "24px",
          color: "#2c3e50",
        }}>Gestión de Eventos</h1>
          </div>

          <div className={styles.actions}>
            <div className={styles.searchBox}>
              <input
                type="text"
                placeholder="Buscar evento..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <span className="material-symbols-outlined">
                search
                </span>
            </div>
            <button className={styles.addButton}>
              <span className="material-symbols-outlined">
                    add_circle
               </span>
              Nuevo Evento
            </button>
          </div>
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Flyer</th>
              <th>Nombre</th>
              <th>Ubicación</th>
              <th>Fecha Registro</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredEventos.map((evento, idx) => (
              <tr key={idx}>
                <td>
                  <img
                    src={evento.imagenFlyer || "/placeholder.png"}
                    alt={evento.nombreEvento}
                    className={styles.flyer}
                  />
                </td>
                <td>{evento.nombreEvento}</td>
                <td>{evento.ubicacionEvento}</td>
                <td>{new Date(evento.fechaRegistro).toLocaleDateString("es-ES")}</td>
                <td className={styles.actionsCell}>
                  <button title="Editar" className={styles.iconButton}>
                    <span className="material-symbols-outlined">edit</span>
                  </button>
                  <button title="Eliminar" className={styles.iconButton}>
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </>
  );
}
