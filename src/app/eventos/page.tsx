"use client";

import { useState, useEffect } from "react";
import Sidebar from "../components/Header";
import styles from "./page.module.css";
import { jwtDecode } from "jwt-decode";

const API_EVENTOS_URL = "http://148.230.72.52:8080/v1/azzar/eventos";
const API_EMPRESAS_URL = "http://148.230.72.52:8080/v1/azzar/empresas-afiliadas";

export default function EventosPage() {
  const [eventos, setEventos] = useState<any[]>([]);
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [flyerModalOpen, setFlyerModalOpen] = useState(false);
  const [flyerToShow, setFlyerToShow] = useState<string | null>(null);

  const [editingEvento, setEditingEvento] = useState<any>(null);
  const [eventoToDelete, setEventoToDelete] = useState<any>(null);

  // Campos del formulario
  const [empresaId, setEmpresaId] = useState<number | "">("");
  const [nombreEvento, setNombreEvento] = useState("");
  const [ubicacionEvento, setUbicacionEvento] = useState("");
  const [imagenFlyer, setImagenFlyer] = useState<File | null>(null);
  const [imagenFlyerPreview, setImagenFlyerPreview] = useState<string | null>(null);

  useEffect(() => {
    fetchEventos();
    fetchEmpresas();
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
      console.log(data);
      setEventos(data);
    } catch (error) {
      console.error("Error cargando eventos:", error);
    }
  };

  const fetchEmpresas = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch(API_EMPRESAS_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setEmpresas(data);
    } catch (err) {
      console.error("Error cargando empresas:", err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImagenFlyer(file);

      // Vista previa con MIME correcto
      const reader = new FileReader();
      reader.onload = (ev: any) => {
        setImagenFlyerPreview(ev.target.result); // ya incluye data:image/...
      };
      reader.readAsDataURL(file);
    }
  };

  const openEditModal = (evento: any) => {
    setEditingEvento(evento);
    setEmpresaId(evento.idEmpresa);
    setNombreEvento(evento.nombreEvento);
    setUbicacionEvento(evento.ubicacionEvento);

    if (evento.imagenFlyer) {
      const src = evento.imagenFlyer.startsWith("data:image")
        ? evento.imagenFlyer
        : `data:image/png;base64,${evento.imagenFlyer}`;
      setImagenFlyerPreview(src);
      setImagenFlyer(null); // no hay archivo nuevo seleccionado
    } else {
      setImagenFlyer(null);
      setImagenFlyerPreview(null);
    }
    setModalOpen(true);
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const formData = new FormData();
      formData.append("idEmpresa", String(empresaId));
      formData.append("nombreEvento", nombreEvento);
      formData.append("ubicacionEvento", ubicacionEvento);

      // Solo enviar nueva imagen si el usuario seleccionó un archivo
      if (imagenFlyer) {
        formData.append("imagenFlyerFile", imagenFlyer);
      } else if (editingEvento && editingEvento.imagenFlyer) {
        // Si no cambió imagen, enviar la misma base64
        formData.append("imagenFlyer", editingEvento.imagenFlyer);
      }

      const url = editingEvento
        ? `${API_EVENTOS_URL}/${editingEvento.idEvento}`
        : `${API_EVENTOS_URL}/registrar`;
      const method = editingEvento ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok)
        throw new Error(editingEvento ? "Error actualizando evento" : "Error creando evento");

        setModalOpen(false);
        setEditingEvento(null);
        setEmpresaId("");
        setNombreEvento("");
        setUbicacionEvento("");
        setImagenFlyer(null);
        setImagenFlyerPreview(null);
        fetchEventos();
      } catch (err: any) {
        console.error(err);
        alert(err.message);
      }
  };

  const openDeleteModal = (evento: any) => {
    setEventoToDelete(evento);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!eventoToDelete) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`${API_EVENTOS_URL}/${eventoToDelete.idEvento}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Error eliminando evento");

      setDeleteModalOpen(false);
      setEventoToDelete(null);
      fetchEventos();
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    }
  };

  const openFlyerModal = (flyerBase64: string) => {
    if (!flyerBase64) return;
    const cleanBase64 = flyerBase64.replace(/\s/g, "");

    // Ajusta el MIME según el tipo real
    const mimeType = "image/png"; // o "image/webp"
    const src = `data:${mimeType};base64,${cleanBase64}`;

    setFlyerToShow(src);
    setFlyerModalOpen(true);
  };


  const closeFlyerModal = () => {
    setFlyerModalOpen(false);
    setFlyerToShow(null);
  };

  const filteredEventos = eventos.filter((e) =>
    e.nombreEvento.toLowerCase().includes(search.toLowerCase())
  );

  const resetForm = () => {
    setEditingEvento(null);
    setEmpresaId("");
    setNombreEvento("");
    setUbicacionEvento("");
    setImagenFlyer(null);
    setImagenFlyerPreview(null);
  };


  return (
    <>
      <Sidebar />
      <main className={styles.main}>
        <h1
          style={{
            fontSize: "1.8rem",
            fontWeight: 600,
            marginBottom: "24px",
            color: "#2c3e50",
          }}
        >
          Gestión de Eventos
        </h1>

        <div className={styles.actions}>
          <div className={styles.searchBox}>
            <input
              type="text"
              placeholder="Buscar evento..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span className="material-symbols-outlined">search</span>
          </div>
          <button
            className={styles.addButton}
            onClick={() => {
              resetForm();
              setModalOpen(true);
              setEditingEvento(null);
              setImagenFlyerPreview(null);
            }}
          >
            <span className="material-symbols-outlined">add_circle</span>
            Nuevo Evento
          </button>
        </div>

        {/* Tabla de eventos */}
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Ubicación</th>
              <th>Fecha Registro</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredEventos.map((evento, idx) => (
              <tr key={evento.idEvento ?? idx}>
                <td>{evento.nombreEvento}</td>
                <td>{evento.ubicacionEvento}</td>
                <td>
                  {new Date(evento.fechaRegistro).toLocaleDateString("es-ES")}
                </td>
                <td className={styles.actionsCell}>
                  <button
                    title="Editar"
                    className={styles.iconButton}
                    onClick={() => openEditModal(evento)}
                  >
                    <span className="material-symbols-outlined">edit</span>
                  </button>
                  <button
                    title="Eliminar"
                    className={styles.iconButton}
                    onClick={() => openDeleteModal(evento)}
                  >
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 🖼 Modal solo con el flyer */}
        {flyerModalOpen && flyerToShow && (
          <div className={styles.flyerOverlay} onClick={closeFlyerModal}>
            <img
              src={flyerToShow}
              alt="Flyer"
              className={styles.flyerImage}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}

        {/* Modal Crear/Editar */}
        {modalOpen && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <h2 className={styles.modalTitle}>
                {editingEvento ? "Editar Evento" : "Registrar Nuevo Evento"}
              </h2>
              <form onSubmit={handleSubmit} className={styles.form}>
                <label className={styles.inputLabel}>
                  Empresa
                  <select
                    value={empresaId}
                    onChange={(e) => setEmpresaId(Number(e.target.value))}
                    className={styles.inputText}
                    required
                  >
                    <option value="">Seleccione empresa</option>
                    {empresas.map((empresa, idx) => (
                      <option key={empresa.idEmpresa ?? idx} value={empresa.idEmpresa}>
                        {empresa.nombreEmpresa}
                      </option>
                    ))}
                  </select>
                </label>

                <label className={styles.inputLabel}>
                  Nombre del Evento
                  <input
                    type="text"
                    value={nombreEvento}
                    onChange={(e) => setNombreEvento(e.target.value)}
                    className={styles.inputText}
                    required
                  />
                </label>

                <label className={styles.inputLabel}>
                  Ubicación del Evento
                  <input
                    type="text"
                    value={ubicacionEvento}
                    onChange={(e) => setUbicacionEvento(e.target.value)}
                    className={styles.inputText}
                    required
                  />
                </label>

                <label className={styles.inputLabel}>
                  Flyer
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className={styles.inputText}
                  />
                </label>

                <div className={styles.modalActions}>
                  <button
                    type="submit"
                    className={`${styles.btn} ${styles.saveButton}`}
                  >
                    {editingEvento ? "Actualizar" : "Guardar"}
                  </button>
                  <button
                    type="button"
                    className={`${styles.btn} ${styles.cancelButton}`}
                    onClick={() => {
                      setModalOpen(false);
                      setEditingEvento(null);
                      setImagenFlyerPreview(null);
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Confirmación Eliminación */}
        {deleteModalOpen && eventoToDelete && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <h2 className={styles.modalTitle}>Eliminar Evento</h2>
              <p>
                ¿Seguro que deseas eliminar el evento{" "}
                <b>{eventoToDelete.nombreEvento}</b>?
              </p>
              <div className={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => {
                    setDeleteModalOpen(false);
                    setEventoToDelete(null);
                  }}
                  className={`${styles.btn} ${styles.cancelButton}`}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
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
