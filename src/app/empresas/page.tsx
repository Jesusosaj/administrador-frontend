"use client";

import { useState, useEffect } from "react";
import Sidebar from "../components/Header";
import styles from "./page.module.css";

const API_URL = "http://148.230.72.52:8080/v1/azzar/empresas-afiliadas";
const API_URL_INSERT = "http://148.230.72.52:8080/v1/azzar/empresas-afiliadas/registrar";
const API_URL_UPDATE = "http://148.230.72.52:8080/v1/azzar/empresas-afiliadas";
const API_URL_DELETE = "http://148.230.72.52:8080/v1/azzar/empresas-afiliadas";

export default function EmpresasPage() {
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingEmpresa, setEditingEmpresa] = useState<any>(null);

  // Modal de confirmación de eliminación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [empresaToDelete, setEmpresaToDelete] = useState<any>(null);

  const [empresaForm, setEmpresaForm] = useState({
    nombre: "",
    fechaDesde: "",
    fechaHasta: ""
  });

  useEffect(() => {
    fetchEmpresas();
  }, []);

  const fetchEmpresas = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      setEmpresas(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEmpresaForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const empresaBody = {
        nombreEmpresa: empresaForm.nombre,
        fechaDesdeAlquiler: empresaForm.fechaDesde,
        fechaHastaAlquiler: empresaForm.fechaHasta,
      };

      const url = editingEmpresa ? `${API_URL_UPDATE}/${editingEmpresa.idEmpresa}` : API_URL_INSERT;
      const method = editingEmpresa ? "PUT" : "POST";

      const resEmpresa = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(empresaBody),
      });

      if (!resEmpresa.ok) throw new Error(editingEmpresa ? "Error al actualizar la empresa" : "Error al registrar la empresa");

      await fetchEmpresas();

      setShowModal(false);
      setEditingEmpresa(null);
      setEmpresaForm({
        nombre: "",
        fechaDesde: "",
        fechaHasta: ""
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!empresaToDelete) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL_DELETE}/${empresaToDelete.idEmpresa}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar la empresa");
      await fetchEmpresas();
      setShowDeleteModal(false);
      setEmpresaToDelete(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmpresas = empresas.filter((e) => {
    const nombre = e.nombreEmpresa || "";
    const id = e.idEmpresa?.toString() || "";
    return nombre.toLowerCase().includes(search.toLowerCase()) || id.includes(search);
  });

  return (
    <>
      <Sidebar />
      <main
        style={{
          marginLeft: "240px",
          padding: "32px",
          minHeight: "100vh",
          backgroundColor: "#f9fafb",
          fontFamily: "var(--font-poppins)",
        }}
      >
        <h1 style={{ fontSize: "1.8rem", fontWeight: 600, marginBottom: "24px", color: "#2c3e50" }}>
          Gestión de Empresas
        </h1>

        {/* Filtros y acciones */}
        <div className={styles.filters}>
          <div className={styles.searchBox} style={{ width: "30%" }}>
            <input
              type="text"
              placeholder="Buscar empresa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <button className={styles.addButton} onClick={() => { setShowModal(true); setEditingEmpresa(null); }}>
            <span className="material-symbols-outlined">add_circle</span> Nueva Empresa
          </button>
        </div>

        {/* Tabla */}
        {loading ? (
          <div style={{ textAlign: "center", marginTop: "40px" }}>
            <div className={styles.loader}></div>
            <p style={{ color: "#7f8c8d" }}>Cargando empresas...</p>
          </div>
        ) : error ? (
          <p style={{ color: "red" }}>⚠️ {error}</p>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Alquiler desde</th>
                  <th>Alquiler hasta</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmpresas.length ? (
                  filteredEmpresas.map((e) => (
                    <tr key={e.idEmpresa}>
                      <td>{e.idEmpresa}</td>
                      <td>{e.nombreEmpresa}</td>
                      <td>{new Date(e.fechaDesdeAlquiler).toLocaleDateString("es-ES")}</td>
                      <td>{new Date(e.fechaHastaAlquiler).toLocaleDateString("es-ES")}</td>
                      <td className={styles.actionsCell}>
                        <button
                          title="Editar"
                          className={styles.iconButton}
                          onClick={() => {
                            setEditingEmpresa(e);
                            setEmpresaForm({
                              nombre: e.nombreEmpresa,
                              fechaDesde: e.fechaDesdeAlquiler.slice(0, 10),
                              fechaHasta: e.fechaHastaAlquiler.slice(0, 10)
                            });
                            setShowModal(true);
                          }}
                        >
                          <span className="material-symbols-outlined">edit</span>
                        </button>
                        <button
                          title="Eliminar"
                          className={styles.iconButton}
                          onClick={() => {
                            setEmpresaToDelete(e);
                            setShowDeleteModal(true);
                          }}
                        >
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", color: "#7f8c8d" }}>
                      No se encontraron empresas
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal Crear/Editar */}
        {showModal && !loading && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <h2 className={styles.modalTitle}>
                {editingEmpresa ? "Editar Empresa" : "Nueva Empresa"}
              </h2>
              <form onSubmit={handleSubmit} className={styles.form}>
                <label className={styles.inputLabel}>
                  Nombre de la Empresa
                  <input
                    type="text"
                    name="nombre"
                    placeholder="Nombre de la empresa"
                    value={empresaForm.nombre}
                    onChange={handleChange}
                    className={styles.inputText}
                    required
                  />
                </label>

                <label className={styles.inputLabel}>
                  Fecha desde alquiler
                  <input
                    type="date"
                    name="fechaDesde"
                    value={empresaForm.fechaDesde}
                    onChange={handleChange}
                    className={styles.inputText}
                    required
                  />
                </label>

                <label className={styles.inputLabel}>
                  Fecha hasta alquiler
                  <input
                    type="date"
                    name="fechaHasta"
                    value={empresaForm.fechaHasta}
                    onChange={handleChange}
                    className={styles.inputText}
                    required
                  />
                </label>

                <div className={styles.modalActions}>
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); setEditingEmpresa(null); }}
                    className={`${styles.btn} ${styles.cancelButton}`}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className={`${styles.btn} ${styles.saveButton}`}
                  >
                    {editingEmpresa ? "Actualizar" : "Registrar"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Confirmación Eliminación */}
        {showDeleteModal && empresaToDelete && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <h2 className={styles.modalTitle}>Eliminar Empresa</h2>
              <p>¿Seguro que deseas eliminar la empresa <b>{empresaToDelete.nombreEmpresa}</b>?</p>
              <div className={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => { setShowDeleteModal(false); setEmpresaToDelete(null); }}
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
