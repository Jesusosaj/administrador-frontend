"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Header";
import styles from "./page.module.css";

const API_URL = "http://148.230.72.52:8080/v1/azzar/premios";
const API_URL_INSERT = "http://148.230.72.52:8080/v1/azzar/premios/registrar";
const API_EVENTOS = "http://148.230.72.52:8080/v1/azzar/eventos";
const API_GENERAR_RIFAS = "http://148.230.72.52:8080/v1/azzar/rifas/registrar";

export default function PremiosPage() {
  const { user } = useAuth();
  const [premios, setPremios] = useState<any[]>([]);
  const [eventos, setEventos] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingPremio, setEditingPremio] = useState<any>(null);
  const [generarRifasId, setGenerarRifasId] = useState<number | null>(null);
  const [cantidadRifas, setCantidadRifas] = useState<number>(1);
  const [flyerToShow, setFlyerToShow] = useState<string | null>(null);
  const [premioAEliminar, setPremioAEliminar] = useState<any | null>(null);

  const [nuevoPremio, setNuevoPremio] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    fechaSorteo: "",
    imagenFile: null as File | null,
    eventoId: "",
  });

  useEffect(() => {
    fetchPremios();
    fetchEventos();
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
        imagenUrl: p.imagenPremio
          ? `data:image/png;base64,${p.imagenPremio}`
          : "/placeholder.png",
        estado: p.estado === 1 ? "Activo" : "Inactivo",
        fecha: p.fechaSorteo
          ? new Date(p.fechaSorteo).toLocaleDateString("es-ES")
          : "N/A",
        fechaSorteoOriginal: p.fechaSorteo,
        precioTicket: `${new Intl.NumberFormat("es-ES", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(parseFloat(p.precioRifa) || 0)} Gs`,
        idEvento: p.idEvento,
        descripcion: p.descripcion,
      }));

      setPremios(premiosNormalizados);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchEventos = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token");
      const res = await fetch(API_EVENTOS, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Error cargando eventos");
      const data = await res.json();
      setEventos(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Error cargando eventos:", err);
      setEventos([]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
    if (!nuevoPremio.eventoId) return alert("Debe seleccionar un evento");

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("nombrePremio", nuevoPremio.nombre);
      formData.append("descripcion", nuevoPremio.descripcion);
      formData.append("precioRifa", nuevoPremio.precio);
      formData.append("estado", "1");
      if (nuevoPremio.fechaSorteo) {
        const fecha = new Date(nuevoPremio.fechaSorteo);
        formData.append("fechaSorteo", fecha.toISOString());
      }
      formData.append("idEvento", nuevoPremio.eventoId);
      if (nuevoPremio.imagenFile) formData.append("imagenPremio", nuevoPremio.imagenFile);

      const url = editingPremio
        ? `${API_URL}/${editingPremio.id}`
        : API_URL_INSERT;

      const method = editingPremio ? "PUT" : "POST";

      const res = await fetch(url, { method, body: formData });
      if (!res.ok) throw new Error(editingPremio ? "Error actualizando premio" : "Error creando premio");

      await fetchPremios();
      setShowModal(false);
      setEditingPremio(null);
      setNuevoPremio({
        nombre: "",
        descripcion: "",
        precio: "",
        fechaSorteo: "",
        imagenFile: null,
        eventoId: "",
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (premio: any) => {
    let fechaFormateada = "";
    if (premio.fechaSorteoOriginal) {
      const fecha = new Date(premio.fechaSorteoOriginal);
      fechaFormateada = fecha.toISOString().slice(0,16); // YYYY-MM-DDTHH:mm
    }

    setEditingPremio(premio);
    setNuevoPremio({
      nombre: premio.nombre,
      descripcion: premio.descripcion,
      precio: premio.precioTicket.replace(/\D/g, ""),
      fechaSorteo: fechaFormateada,
      imagenFile: null,
      eventoId: premio.idEvento,
    });
    setShowModal(true);
  };

  const confirmDelete = (premio: any) => setPremioAEliminar(premio);
  
  const closeConfirmDelete = () => setPremioAEliminar(null);
  const handleDeleteConfirmed = async () => {
    if (!premioAEliminar) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      console.log(premioAEliminar);

      const res = await fetch(`${API_URL}/${premioAEliminar.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error eliminando premio");

      await fetchPremios();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setPremioAEliminar(null);
    }
  };

  const handleGenerarRifas = async () => {
    if (!generarRifasId || cantidadRifas <= 0) return alert("Cantidad inválida");
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`${API_GENERAR_RIFAS}?idPremio=${generarRifasId}&cantidad=${cantidadRifas}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error generando rifas");

      setGenerarRifasId(null);
      setCantidadRifas(1);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const openFlyerModal = (imagenBase64: string) => {
    if (!imagenBase64) return;
    const src = imagenBase64.startsWith("data:image") ? imagenBase64 : `data:image/png;base64,${imagenBase64}`;
    setFlyerToShow(src);
  };
  const closeFlyerModal = () => setFlyerToShow(null);

  const filteredPremios = premios.filter(
    (p) =>
      p.nombre.toLowerCase().includes(search.toLowerCase()) ||
      p.codigo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Sidebar />
      <main className={styles.main}>
        <h1 className={styles.title}>Gestión de Premios</h1>

        <div className={styles.actions}>
          <input
            type="text"
            placeholder="Buscar premio..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
          <button className={styles.addButton} onClick={() => { setShowModal(true); setEditingPremio(null); }}>
            <span className="material-symbols-outlined">add_circle</span> Nuevo Premio
          </button>
        </div>

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
                <th>Estado</th>
                <th>Fecha</th>
                <th>Precio x Ticket</th>
                <th>Rifas</th>
                <th>#</th>
              </tr>
            </thead>
            <tbody>
              {filteredPremios.length ? (
                filteredPremios.map((p) => (
                  <tr key={p.id}>
                    <td>{p.codigo}</td>
                    <td>{p.nombre}</td>
                    <td>{p.estado}</td>
                    <td>{p.fecha}</td>
                    <td>{p.precioTicket}</td>
                    <td>
                      <button className={styles.generarButton} onClick={() => setGenerarRifasId(p.id)}>
                        <span className="material-symbols-outlined">confirmation_number</span> Generar rifas
                      </button>
                    </td>
                    <td>
                      <button className={styles.iconButton} onClick={() => openEditModal(p)}>
                        <span className="material-symbols-outlined">edit</span>
                      </button>
                      <button className={styles.iconButton} onClick={() => confirmDelete(p)}>
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center" }}>No se encontraron premios</td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {/* Modal Crear/Editar */}
        {showModal && !loading && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <h2 className={styles.modalTitle}>{editingPremio ? "Editar Premio" : "Cargar Nuevo Premio"}</h2>
              <form onSubmit={handleSubmit} className={styles.form}>
                <label className={styles.inputLabel}>
                  Evento
                  <select
                    name="eventoId"
                    value={nuevoPremio.eventoId}
                    onChange={handleChange}
                    className={styles.inputSelect}
                    required
                  >
                    <option value="">Seleccione evento</option>
                    {Array.isArray(eventos) &&
                      eventos.map((evento) => (
                        <option key={evento.idEvento} value={evento.idEvento}>
                          {evento.nombreEvento}
                        </option>
                      ))}
                  </select>
                </label>

                <label className={styles.inputLabel}>
                  Nombre del Premio
                  <input
                    type="text"
                    name="nombre"
                    placeholder="Nombre"
                    value={nuevoPremio.nombre}
                    onChange={handleChange}
                    className={styles.inputText}
                    required
                  />
                </label>

                <label className={styles.inputLabel}>
                  Descripción
                  <textarea
                    name="descripcion"
                    placeholder="Descripción"
                    value={nuevoPremio.descripcion}
                    onChange={handleChange}
                    className={styles.inputTextArea}
                    required
                  />
                </label>

                <label className={styles.inputLabel}>
                  Precio por Ticket
                  <input
                    type="number"
                    name="precio"
                    placeholder="Precio"
                    value={nuevoPremio.precio}
                    onChange={handleChange}
                    className={styles.inputText}
                    required
                  />
                </label>

                <label className={styles.inputLabel}>
                  Fecha de Sorteo
                  <input
                    type="datetime-local"
                    name="fechaSorteo"
                    value={nuevoPremio.fechaSorteo}
                    onChange={handleChange}
                    className={styles.inputText}
                    required
                  />
                </label>

                <label className={styles.inputLabel}>
                  Flyer del Premio
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className={styles.inputFile}
                  />
                </label>

                <div className={styles.modalActions}>
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); setEditingPremio(null); }}
                    className={`${styles.btn} ${styles.cancelButton}`}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className={`${styles.btn} ${styles.saveButton}`}
                  >
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Generar Rifas */}
        {generarRifasId && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <h2 className={styles.modalTitle}>Generar Rifas</h2>
              <label className={styles.inputLabel}>
                Cantidad de Rifas
                <input
                  type="number"
                  value={cantidadRifas}
                  onChange={(e) => setCantidadRifas(parseInt(e.target.value))}
                  className={styles.inputText}
                  min={1}
                />
              </label>
              <div className={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => setGenerarRifasId(null)}
                  className={`${styles.btn} ${styles.cancelButton}`}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleGenerarRifas}
                  className={`${styles.btn} ${styles.saveButton}`}
                >
                  Generar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Ver Imagen */}
        {flyerToShow && (
          <div className={styles.flyerOverlay} onClick={closeFlyerModal}>
            <img
              src={flyerToShow}
              alt="Flyer"
              className={styles.flyerImage}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}

        {/* Modal Confirmación Eliminar */}
        {premioAEliminar && (
          <div className={styles.modal}>
            <div className={styles.modalContent} style={{ maxWidth: "400px", textAlign: "center" }}>
              <h2 className={styles.modalTitle}>¿Estás seguro de eliminar este premio?</h2>
              <div className={styles.modalActions}>
                <button
                  type="button"
                  onClick={closeConfirmDelete}
                  className={`${styles.btn} ${styles.cancelButton}`}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirmed}
                  className={`${styles.btn} ${styles.saveButton}`}
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </>
  );
}
