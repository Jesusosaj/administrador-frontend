"use client";

import { useEffect, useState, Fragment } from "react";
import Sidebar from "../components/Header";
import styles from "./page.module.css";

const API_PAGOS_URL = "http://148.230.72.52:8080/v1/azzar/pagos/lista";

export default function VentasPage() {
  const [search, setSearch] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("todos");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [pagos, setPagos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedPagoId, setExpandedPagoId] = useState<number | null>(null);
  const [modalImage, setModalImage] = useState<string | null>(null);

  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    tipo: "aprobar" | "rechazar" | null;
    idPago: number | null;
  }>({ open: false, tipo: null, idPago: null });

  useEffect(() => {
    fetchPagos();
  }, []);

  const fetchPagos = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No se encontró token");

      const response = await fetch(API_PAGOS_URL, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);

      const data = await response.json();
      const mappedPagos = data.map((p: any) => ({
        ...p,
        fechaConfirmacionFormateada: new Date(p.fechaConfirmacion).toLocaleString("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
        fechaConfirmacionDate: new Date(p.fechaConfirmacion),
        montoFormateado: Number(p.monto).toLocaleString("es-ES") + " Gs",
      }));
      setPagos(mappedPagos);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (idPago: number) => {
    setExpandedPagoId(expandedPagoId === idPago ? null : idPago);
  };

  const handleVerComprobante = (imagenBinaria: string) => {
    if (!imagenBinaria) return;
    setModalImage(`data:image/jpeg;base64,${imagenBinaria}`);
  };

  const handleCerrarModal = () => setModalImage(null);

  const confirmarAccion = (tipo: "aprobar" | "rechazar", idPago: number) => {
    setConfirmModal({ open: true, tipo, idPago });
  };

  const ejecutarAccion = async () => {
    if (!confirmModal.idPago || !confirmModal.tipo) return;
    const { tipo, idPago } = confirmModal;

    try {
      const body = { idPago };
      const url = `http://148.230.72.52:8080/v1/azzar/pagos/${tipo}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error("Error al procesar la solicitud");

      setConfirmModal({ open: false, tipo: null, idPago: null });
      fetchPagos(); // refrescar lista
    } catch (err) {
      console.error(err);
      alert("Error al procesar la acción");
    }
  };

  // 🧮 FILTROS
  const filteredPagos = pagos.filter((p) => {
    const matchReferencia = p.referenciaPago
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchEstado =
      estadoFiltro === "todos" ||
      (estadoFiltro === "aprobado" && p.esAprobado === 1) ||
      (estadoFiltro === "pendiente" && p.esAprobado === 0) ||
      (estadoFiltro === "rechazado" && p.esAprobado === 2);

    const fechaPago = new Date(p.fechaConfirmacionDate);
    const matchFechaDesde = fechaDesde ? fechaPago >= new Date(fechaDesde) : true;
    const matchFechaHasta = fechaHasta
      ? fechaPago <= new Date(`${fechaHasta}T23:59:59`)
      : true;

    return matchReferencia && matchEstado && matchFechaDesde && matchFechaHasta;
  });

  return (
    <>
      <Sidebar />
      <main className={styles.main}>
        <h1 className={styles.title}>Gestión de Ventas</h1>

        <div className={styles.filters}>
          <input
            type="text"
            placeholder="Buscar por referencia..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />

          <select
            value={estadoFiltro}
            onChange={(e) => setEstadoFiltro(e.target.value)}
            className={styles.selectInput}
          >
            <option value="todos">Todos</option>
            <option value="pendiente">Pendientes</option>
            <option value="aprobado">Aprobados</option>
            <option value="rechazado">Rechazados</option>
          </select>

          <div className={styles.dateFilters}>
            <label>
              <input
                type="date"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
              />
            </label>

            <label>
              <input
                type="date"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
              />
            </label>
          </div>
        </div>

        {/* 🧾 TABLA DE PAGOS */}
        {loading ? (
          <p>Cargando pagos...</p>
        ) : error ? (
          <p style={{ color: "red" }}>{error}</p>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID Pago</th>
                  <th>Referencia</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th>Monto</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredPagos.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center" }}>
                      No se encontraron resultados
                    </td>
                  </tr>
                ) : (
                  filteredPagos.map((pago) => (
                    <Fragment key={pago.idPago}>
                      <tr
                        style={{ cursor: "pointer" }}
                        onClick={() => toggleExpand(pago.idPago)}
                      >
                        <td>{pago.idPago}</td>
                        <td>{pago.referenciaPago}</td>
                        <td>
                          <span
                            style={{
                              backgroundColor:
                                pago.esAprobado === 1
                                  ? "#2ecc71"
                                  : pago.esAprobado === 0
                                  ? "#f1c40f"
                                  : "#e74c3c",
                              color: "#fff",
                              padding: "4px 10px",
                              borderRadius: "20px",
                            }}
                          >
                            {pago.esAprobado === 1
                              ? "Aprobado"
                              : pago.esAprobado === 0
                              ? "Pendiente"
                              : "Rechazado"}
                          </span>
                        </td>
                        <td>{pago.fechaConfirmacionFormateada}</td>
                        <td>{pago.montoFormateado}</td>
                        <td style={{ display: "flex", gap: "8px" }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVerComprobante(pago.imagenComprobante);
                            }}
                            style={{
                              backgroundColor: "#6b6b6b",
                              color: "#fff",
                              padding: "7px",
                              borderRadius: "20px",
                              border: "none",
                              cursor: "pointer",
                              height: "35px",
                            }}
                          >
                            Ver Comprobante
                          </button>

                          {pago.esAprobado === 0 && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  confirmarAccion("aprobar", pago.idPago);
                                }}
                                style={{
                                  backgroundColor: "#2ecc71",
                                  color: "#fff",
                                  border: "none",
                                  borderRadius: "10px",
                                  cursor: "pointer",
                                  padding: "4px 8px",
                                  height: "35px",
                                }}
                              >
                                <span className="material-symbols-outlined">check</span>
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  confirmarAccion("rechazar", pago.idPago);
                                }}
                                style={{
                                  backgroundColor: "#e74c3c",
                                  color: "#fff",
                                  border: "none",
                                  borderRadius: "10px",
                                  cursor: "pointer",
                                  padding: "4px 8px",
                                  height: "35px",
                                }}
                              >
                                <span className="material-symbols-outlined">close</span>
                              </button>
                            </>
                          )}
                        </td>
                      </tr>

                      {expandedPagoId === pago.idPago && (
                        <tr>
                          <td colSpan={6} style={{ padding: "0", border: "none" }}>
                            <table
                              style={{
                                width: "100%",
                                borderCollapse: "collapse",
                                margin: "8px 0",
                              }}
                            >
                              <thead>
                                <tr style={{ backgroundColor: "#ecf0f1" }}>
                                  <th>Ticket</th>
                                  <th>Comprador</th>
                                  <th>Premio</th>
                                  <th>Estado Venta</th>
                                  <th>Fecha Venta</th>
                                  <th>Precio</th>
                                </tr>
                              </thead>
                              <tbody>
                                {pago.items.map((item: any) => (
                                  <tr key={item.idVenta}>
                                    <td>{item.numeroRifa}</td>
                                    <td>{item.nombreCliente}</td>
                                    <td>{item.nombrePremio}</td>
                                    <td>
                                      {item.estadoVenta === 1
                                        ? "Pendiente" : item.estadoVenta === 2 ? "Pagado"
                                        : item.estadoVenta === 3 ? "Rechazado" : ""}
                                    </td>
                                    <td>
                                      {new Date(item.fechaVenta).toLocaleString("es-ES")}
                                    </td>
                                    <td>
                                      {Number(item.precioRifa).toLocaleString("es-ES")} Gs
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 🖼️ MODAL IMAGEN */}
        {modalImage && (
          <div
            onClick={handleCerrarModal}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              backgroundColor: "rgba(0,0,0,0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
            }}
          >
            <img
              src={modalImage}
              alt="Comprobante"
              style={{
                maxHeight: "80%",
                maxWidth: "80%",
                borderRadius: "8px",
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}

        {/* ⚠️ MODAL CONFIRMACIÓN */}
        {confirmModal.open && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              backgroundColor: "rgba(0,0,0,0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1100,
            }}
          >
            <div
              style={{
                background: "#fff",
                padding: "20px",
                borderRadius: "10px",
                width: "300px",
                textAlign: "center",
              }}
            >
              <h3>
                ¿Estás seguro de{" "}
                {confirmModal.tipo === "aprobar" ? "aprobar" : "rechazar"} este
                pago?
              </h3>
              <div
                style={{
                  marginTop: "20px",
                  display: "flex",
                  justifyContent: "space-around",
                }}
              >
                <button
                  onClick={() =>
                    setConfirmModal({ open: false, tipo: null, idPago: null })
                  }
                  style={{
                    backgroundColor: "#ccc",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={ejecutarAccion}
                  style={{
                    backgroundColor:
                      confirmModal.tipo === "aprobar" ? "#2ecc71" : "#e74c3c",
                    color: "#fff",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                  {confirmModal.tipo === "aprobar" ? "Aprobar" : "Rechazar"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
