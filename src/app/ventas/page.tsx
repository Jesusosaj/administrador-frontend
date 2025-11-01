"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Header";
import styles from "./page.module.css";
import { jwtDecode } from "jwt-decode";

const API_URL_GENERAL = "http://localhost:8080/v1/azzar/ventas/reporte-general";
const API_URL_EMPRESA = "http://localhost:8080/v1/azzar/ventas/reporte-empresa";
const API_PREMIOS_URL = "http://localhost:8080/v1/azzar/premios";

export default function VentasPage() {
  const [search, setSearch] = useState("");
  const [selectedPremio, setSelectedPremio] = useState("");
  const [ventas, setVentas] = useState<any[]>([]);
  const [premios, setPremios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPremios();
    fetchVentas();
  }, []);

  const fetchVentas = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No se encontró token");

      const decoded: any = jwtDecode(token);
      const idEmpresa = decoded.idEmpresa;

      const url =
        idEmpresa === -99
          ? API_URL_GENERAL
          : `${API_URL_EMPRESA}?idEmpresa=${idEmpresa}`;

      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      const mappedVentas = data.map((v: any) => {
        const fecha = new Date(v.fechaVenta);
        const fechaFormateada = fecha.toLocaleString("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
        const precioFormateado = Number(v.precioRifa).toLocaleString("es-ES") + " Gs";
        return {
          id: v.idVenta,
          ticket: "Rifa #" + v.numeroRifa,
          comprador: v.nombreCliente,
          premio: v.nombrePremio,
          estado:
            v.estadoVenta === 1
              ? "Pendiente de Pago"
              : v.estadoVenta === 2
              ? "Pagado"
              : "",
          fecha: fechaFormateada,
          precio: precioFormateado,
        };
      });

      setVentas(mappedVentas);
      setError(null);
    } catch (err: any) {
      console.error("Error al cargar ventas:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPremios = async () => {
    try {
      const response = await fetch(API_PREMIOS_URL);
      if (!response.ok) throw new Error(`Error ${response.status}`);
      const data = await response.json();
      setPremios(data);
    } catch (err) {
      console.error("Error al cargar premios:", err);
    }
  };

  const filteredVentas = ventas.filter((venta) => {
    const matchesSearch =
      venta.comprador.toLowerCase().includes(search.toLowerCase()) ||
      venta.premio.toLowerCase().includes(search.toLowerCase());
    const matchesPremio = selectedPremio === "" || venta.premio === selectedPremio;
    return matchesSearch && matchesPremio;
  });

  return (
    <>
      <Sidebar />
      <main
        style={{
          marginLeft: "240px",
          padding: "32px",
          backgroundColor: "#f9fafb",
          minHeight: "100vh",
          fontFamily: "var(--font-poppins)",
        }}
      >
        {/* Título */}
        <div style={{ marginBottom: "24px" }}>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 600, color: "#2c3e50", display: "flex", gap: "2px" }}>
              Reporte de Ventas
          </h1>
        </div>

        {/* Filtros */}
        <div className={styles.filters}>
          <div className={styles.searchBox} style={{width: '30%'}}>
            <input
              type="text"
              placeholder="Buscar comprador o premio..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput}
            />
            <button className={styles.searchButton}>
              <span className="material-symbols-outlined">search</span>
            </button>
          </div>

          <select
            value={selectedPremio}
            onChange={(e) => setSelectedPremio(e.target.value)}
            className={styles.select}
          >
            <option value="">Todos los premios</option>
            {premios.map((premio) => (
              <option key={premio.idPremio} value={premio.nombrePremio}>
                {premio.nombrePremio}
              </option>
            ))}
          </select>

          <button
            className={styles.downloadButton}
            style={{display: "flex", justifyContent: 'center', alignItems: 'center'}}
            onClick={() => alert("📄 Descargando reporte...")}
          >
            <span className="material-symbols-outlined">download</span>
            Descargar Reporte
          </button>
        </div>

        {/* Contenido */}
        {loading ? (
          <div style={{ textAlign: "center", marginTop: "40px" }}>
            <div className={styles.loader}></div>
            <p style={{ color: "#7f8c8d" }}>Cargando ventas...</p>
          </div>
        ) : error ? (
          <p style={{ color: "red" }}>⚠️ {error}</p>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Comprador</th>
                  <th>Premio</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th>Precio</th>
                </tr>
              </thead>
              <tbody>
                {filteredVentas.length > 0 ? (
                  filteredVentas.map((venta) => (
                    <tr key={venta.id}>
                      <td>{venta.ticket}</td>
                      <td>{venta.comprador}</td>
                      <td>{venta.premio}</td>
                      <td>
                        <span
                          style={{
                            backgroundColor:
                              venta.estado === "Pagado"
                                ? "#2ecc71"
                                : "#f1c40f",
                            color: "#fff",
                            padding: "4px 10px",
                            borderRadius: "20px",
                            fontSize: "0.85rem",
                            fontWeight: 500,
                          }}
                        >
                          {venta.estado}
                        </span>
                      </td>
                      <td>{venta.fecha}</td>
                      <td>{venta.precio}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", color: "#7f8c8d" }}>
                      No se encontraron ventas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  );
}
