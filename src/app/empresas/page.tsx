"use client";

import { useState, useEffect } from "react";
import Sidebar from "../components/Header";
import styles from "./page.module.css";

const API_URL = "http://localhost:8080/v1/azzar/empresas-afiliadas";
const API_URL_INSERT = "http://localhost:8080/v1/azzar/empresas-afiliadas/registrar";
const API_URL_UPDATE = "http://localhost:8080/v1/azzar/empresas-afiliadas/actualizar";
const API_URL_DELETE = "http://localhost:8080/v1/azzar/empresas-afiliadas/eliminar";

export default function EmpresasPage() {
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingEmpresa, setEditingEmpresa] = useState<any>(null);

  const [empresaForm, setEmpresaForm] = useState({
    nombre: "",
    fechaDesde: "",
    fechaHasta: "",
    usuarioIngreso: "",
    passwordIngreso: ""
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
    try {
      const url = editingEmpresa ? API_URL_UPDATE : API_URL_INSERT;
      const method = editingEmpresa ? "PUT" : "POST";
      const body = {
        id: editingEmpresa?.ID_EMPRESA,
        nombre: empresaForm.nombre,
        fechaDesde: empresaForm.fechaDesde,
        fechaHasta: empresaForm.fechaHasta,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Error al guardar la empresa");

      await fetchEmpresas();
      setShowModal(false);
      setEditingEmpresa(null);
      setEmpresaForm({ nombre: "", fechaDesde: "", fechaHasta: "" });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (empresa: any) => {
    setEditingEmpresa(empresa);
    setEmpresaForm({
      nombre: empresa.nombreEmpresa,
      fechaDesde: new Date(empresa.fechaDesdeAlquiler).toISOString().split("T")[0],
      fechaHasta: new Date(empresa.echaHastaAlquiler).toISOString().split("T")[0],
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Seguro que deseas eliminar esta empresa?")) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL_DELETE}?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar la empresa");
      await fetchEmpresas();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmpresas = empresas.filter((e) => {
    const nombre = e.nombreEmpresa || ""; // <-- evita undefined
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
          <button className={styles.addButton} onClick={() => setShowModal(true)}>
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
                  <th>Desde</th>
                  <th>Hasta</th>
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
                        <button title="Editar" className={styles.iconButton}>
                            <span className="material-symbols-outlined">edit</span>
                        </button>
                        <button title="Eliminar" className={styles.iconButton}>
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

        {/* Modal */}
        {showModal && !loading && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <h2>{editingEmpresa ? "Editar Empresa" : "Nueva Empresa"}</h2>
              <form onSubmit={handleSubmit} className={styles.form}>
                <label className={styles.inputsLabel}>
                  <span className={styles.inputsSpan}>Nombre de la empresa</span>
                  <input
                    type="text"
                    name="nombre"
                    placeholder="Nombre de la empresa"
                    value={empresaForm.nombre}
                    onChange={handleChange}
                    required
                  />
                </label>
                <label className={styles.inputsLabel}>
                  <span className={styles.inputsSpan}>Fecha desde alquiler</span>
                  <input
                    type="date"
                    name="fechaDesde"
                    value={empresaForm.fechaDesde}
                    onChange={handleChange}
                    required
                  />
                </label>
                
                <label className={styles.inputsLabel}>
                  <span className={styles.inputsSpan}>Fecha hasta alquiler</span>
                  <input
                    type="date"
                    name="fechaHasta"
                    value={empresaForm.fechaHasta}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label className={styles.inputsLabel}>
                  <span className={styles.inputsSpan}>Usuario ingreso</span>
                  <input
                    placeholder="Usuario..."
                    type="text"
                    name="usuarioIngreso"
                    value={empresaForm.usuarioIngreso}
                    onChange={handleChange}
                    required
                  />
                </label>
                <label className={styles.inputsLabel}>
                  <span className={styles.inputsSpan}>Contraseña ingreso</span>
                  <input
                    placeholder="Contraseña..."
                    type="text"
                    name="passwordIngreso"
                    value={empresaForm.passwordIngreso}
                    onChange={handleChange}
                    required
                  />
                </label>
                <div className={styles.modalActions}>
                  <button type="button" onClick={() => {setShowModal(false); setEditingEmpresa(null)}} className={styles.cancelButton}>
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
