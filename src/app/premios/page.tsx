"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Header";
import styles from "./page.module.css";

const API_URL = "http://localhost:8080/v1/azzar/premios";
const API_URL_INSERT = "http://localhost:8080/v1/azzar/premios/registrar";

export default function PremiosPage() {
  const { user } = useAuth();
  const [premios, setPremios] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const [nuevoPremio, setNuevoPremio] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    cantTickets: "",
    fechaSorteo: "",
    imagenFile: null as File | null,
  });

  useEffect(() => {
    fetchPremios();
  }, []);

  const fetchPremios = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers: any = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(API_URL, { headers });
      if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
      const data = await res.json();

      const premiosNormalizados = data.map((p: any) => ({
        id: p.idPremio,
        codigo: `#${p.idPremio}`,
        nombre: p.nombrePremio,
        imagenUrl: p.imagen_url || "/placeholder.png",
        estado: p.estado === 1 ? "Activo" : "Inactivo",
        fecha: p.fechaSorteo
          ? new Date(p.fechaSorteo).toLocaleDateString("es-ES")
          : "N/A",
        precioTicket: `${new Intl.NumberFormat("es-ES", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(parseFloat(p.precioRifa) || 0)} Gs`,
      }));

      setPremios(premiosNormalizados);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredPremios = premios.filter(
    (p) =>
      p.nombre.toLowerCase().includes(search.toLowerCase()) ||
      p.codigo.toLowerCase().includes(search.toLowerCase())
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNuevoPremio((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setNuevoPremio((prev) => ({ ...prev, imagenFile: file }));
    } else {
      alert("Por favor, selecciona un archivo de imagen válido.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("nombre", nuevoPremio.nombre);
      formData.append("descripcion", nuevoPremio.descripcion);
      formData.append("precio_ticket", nuevoPremio.precio);
      formData.append("total_ticket", nuevoPremio.cantTickets);
      formData.append("fecha_sorteo", nuevoPremio.fechaSorteo);
      if (nuevoPremio.imagenFile) formData.append("imagen", nuevoPremio.imagenFile);

      const res = await fetch(API_URL_INSERT, { method: "POST", body: formData });
      if (!res.ok) throw new Error("Error al crear el premio");

      await fetchPremios();
      setShowModal(false);
      setNuevoPremio({ nombre: "", descripcion: "", precio: "", cantTickets: "", fechaSorteo: "", imagenFile: null });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Sidebar />
      <main className={styles.main}>
        <h1 className={styles.title}>Gestión de Premios</h1>

        {/* Filtros y acciones */}
        <div className={styles.actions}>
          <input
            type="text"
            placeholder="Buscar premio..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
          <button className={styles.addButton} onClick={() => setShowModal(true)}>
            <span className="material-symbols-outlined">add_circle</span> Nuevo Premio
          </button>
        </div>

        {/* Tabla de premios */}
        {loading ? (
          <div className={styles.loading}>Cargando premios...</div>
        ) : error ? (
          <div className={styles.error}>{error}</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Código</th>
                <th>Premio</th>
                <th>Imagen</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Precio x Ticket</th>
              </tr>
            </thead>
            <tbody>
              {filteredPremios.length ? (
                filteredPremios.map((p) => (
                  <tr key={p.id}>
                    <td>{p.codigo}</td>
                    <td>{p.nombre}</td>
                    <td>
                      <button onClick={() => window.open(p.imagenUrl, "_blank")} className={styles.imageButton}>
                        Ver Imagen
                      </button>
                    </td>
                    <td>{p.estado}</td>
                    <td>{p.fecha}</td>
                    <td>{p.precioTicket}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center" }}>
                    No se encontraron premios
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {/* Modal de creación */}
        {showModal && !loading && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <h2>Cargar Nuevo Premio</h2>
              <form onSubmit={handleSubmit} className={styles.form}>
                <input type="text" name="nombre" placeholder="Nombre" value={nuevoPremio.nombre} onChange={handleChange} required />
                <textarea name="descripcion" placeholder="Descripción" value={nuevoPremio.descripcion} onChange={handleChange} required />
                <input type="number" name="precio" placeholder="Precio por ticket" value={nuevoPremio.precio} onChange={handleChange} required />
                <input type="number" name="cantTickets" placeholder="Cantidad de tickets" value={nuevoPremio.cantTickets} onChange={handleChange} required />
                <input type="date" name="fechaSorteo" value={nuevoPremio.fechaSorteo} onChange={handleChange} required />
                <input type="file" accept="image/*" onChange={handleFileChange} />
                <div className={styles.modalActions}>
                  <button type="button" onClick={() => setShowModal(false)} className={styles.cancelButton}>
                    Cancelar
                  </button>
                  <button type="submit" className={styles.saveButton}>
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
