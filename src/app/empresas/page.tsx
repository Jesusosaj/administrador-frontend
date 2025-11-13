"use client";

import { useState, useEffect } from "react";
import Sidebar from "../components/Header";
import styles from "./page.module.css";

const API_URL = "http://148.230.72.52:8080/v1/azzar/empresas-afiliadas";
const API_URL_INSERT = "http://148.230.72.52:8080/v1/azzar/empresas-afiliadas/registrar";
const API_URL_UPDATE = "http://148.230.72.52:8080/v1/azzar/empresas-afiliadas";
const API_URL_DELETE = "http://148.230.72.52:8080/v1/azzar/empresas-afiliadas";
const API_ADMIN = "http://148.230.72.52:8080/v1/azzar/admin";

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

  const obtenerUsuarioPorEmpresa = async (idEmpresa: number) => {
    try {
      const res = await fetch(`${API_ADMIN}/empresa/{idEmpresa}?idEmpresa=${idEmpresa}`);
      if (res.status === 404) return null; // no existe usuario
      if (!res.ok) throw new Error("Error consultando usuario");

      const data = await res.json();
      return data;
    } catch (err) {
      console.error("Error al obtener usuario de empresa", err);
      return null;
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


  // Estado para usuarios
  const [showUserCreateModal, setShowUserCreateModal] = useState(false);
  const [showUserEditModal, setShowUserEditModal] = useState(false);
  const [showUserDeleteModal, setShowUserDeleteModal] = useState(false);

  const [empresaUsuario, setEmpresaUsuario] = useState<any>(null);

  const [usuarioForm, setUsuarioForm] = useState({
    usuario: "",
    password: ""
  });

  const openCreateUserModal = (empresa: any) => {
    setEmpresaUsuario(empresa);
    setUsuarioForm({ usuario: "", password: "" });
    setShowUserCreateModal(true);
  };

  const openEditUserModal = async (empresa: any) => {
    setEmpresaUsuario(empresa);

    const usuario = await obtenerUsuarioPorEmpresa(empresa.idEmpresa);

    if (!usuario) {
      alert("Esta empresa NO tiene un usuario para editar.");
      return;
    }

    setUsuarioForm({
      usuario: usuario.usuario || "",
      password: ""
    });

    setShowUserEditModal(true);
  };

  const openDeleteUserModal = (empresa: any) => {
    setEmpresaUsuario(empresa);
    setShowUserDeleteModal(true);
  };

  const handleUserChange = (e: any) => {
    const { name, value } = e.target;
    setUsuarioForm(prev => ({ ...prev, [name]: value }));
  };

  const crearUsuarioAdmin = async (empresa: any) => {
    const usuarioExiste = await obtenerUsuarioPorEmpresa(empresa.idEmpresa);

    if (usuarioExiste) {
      alert("Esta empresa ya tiene un usuario. Usa editar.");
      return;
    }

    try {
      const body = {
        idEmpresa: empresa.idEmpresa,
        usuario: usuarioForm.usuario,
        contrasena: usuarioForm.password
      };

      const res = await fetch(`${API_ADMIN}/registrar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (!res.ok) throw new Error("Error al crear usuario");

      alert("Usuario creado correctamente");
      setShowUserCreateModal(false);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const editarUsuarioAdmin = async (empresa: any) => {
    const usuario = await obtenerUsuarioPorEmpresa(empresa.idEmpresa);

    if (!usuario) {
      alert("Esta empresa NO tiene un usuario para editar.");
      return;
    }

    try {
      const body = {
        usuario: usuarioForm.usuario,
        contrasena: usuarioForm.password.trim() === "" ? null : usuarioForm.password
      };

      const res = await fetch(`${API_ADMIN}/${usuario.idUsuario}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (!res.ok) throw new Error("Error al editar usuario");

      alert("Usuario actualizado correctamente");
      setShowUserEditModal(false);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const eliminarUsuarioAdmin = async (empresa: any) => {
    const usuario = await obtenerUsuarioPorEmpresa(empresa.idEmpresa);

    if (!usuario) {
      alert("⚠️ Esta empresa NO tiene usuario creado.");
      return;
    }

    try {
      const res = await fetch(`${API_ADMIN}/${usuario.idUsuario}`, {
        method: "DELETE"
      });

      if (!res.ok) throw new Error("Error al eliminar usuario");

      alert("Usuario eliminado correctamente");
      setShowUserDeleteModal(false);
    } catch (err: any) {
      alert(err.message);
    }
  };


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
                  <th>Usuario</th>
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
                      <td>
                        <button
                          title="Agregar usuario"
                          className={styles.iconButton}
                          onClick={() => openCreateUserModal(e)}
                        >
                          <span className="material-symbols-outlined">person_add</span>
                        </button>

                        <button
                          title="Editar usuario"
                          className={styles.iconButton}
                          onClick={() => openEditUserModal(e)}
                        >
                          <span className="material-symbols-outlined">edit_square</span>
                        </button>

                        <button
                          title="Eliminar usuario"
                          className={styles.iconButton}
                          onClick={() => openDeleteUserModal(e)}
                        >
                          <span className="material-symbols-outlined">person_remove</span>
                        </button>
                      </td>

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


        {showUserCreateModal && empresaUsuario && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <h2 className={styles.modalTitle}>Crear Usuario</h2>

              <form className={styles.form}>
                <label className={styles.inputLabel}>
                  Usuario
                  <input
                    type="text"
                    name="usuario"
                    value={usuarioForm.usuario}
                    onChange={handleUserChange}
                    className={styles.inputText}
                    required
                  />
                </label>

                <label className={styles.inputLabel}>
                  Contraseña
                  <input
                    type="password"
                    name="password"
                    value={usuarioForm.password}
                    onChange={handleUserChange}
                    className={styles.inputText}
                    required
                  />
                </label>

                <div className={styles.modalActions}>
                  <button
                    type="button"
                    onClick={() => { setShowUserCreateModal(false); }}
                    className={`${styles.btn} ${styles.cancelButton}`}
                  >
                    Cancelar
                  </button>

                  <button
                    type="button"
                    className={`${styles.btn} ${styles.saveButton}`}
                    onClick={() => crearUsuarioAdmin(empresaUsuario)}
                  >
                    Crear
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {showUserEditModal && empresaUsuario && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <h2 className={styles.modalTitle}>Editar Usuario</h2>

              <form className={styles.form}>
                <label className={styles.inputLabel}>
                  Usuario
                  <input
                    type="text"
                    name="usuario"
                    value={usuarioForm.usuario}
                    onChange={handleUserChange}
                    className={styles.inputText}
                    required
                  />
                </label>

                <label className={styles.inputLabel}>
                  Nueva contraseña (opcional)
                  <input
                    type="password"
                    name="password"
                    value={usuarioForm.password}
                    onChange={handleUserChange}
                    className={styles.inputText}
                  />
                </label>

                <div className={styles.modalActions}>
                  <button
                    type="button"
                    onClick={() => { setShowUserEditModal(false); }}
                    className={`${styles.btn} ${styles.cancelButton}`}
                  >
                    Cancelar
                  </button>

                  <button
                    type="button"
                    className={`${styles.btn} ${styles.saveButton}`}
                    onClick={() => editarUsuarioAdmin(empresaUsuario)}
                  >
                    Guardar Cambios
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showUserDeleteModal && empresaUsuario && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <h2 className={styles.modalTitle}>Eliminar Usuario</h2>

              <p>
                ¿Seguro que deseas eliminar el usuario de la empresa <b>{empresaUsuario.nombreEmpresa}</b>?
              </p>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => { setShowUserDeleteModal(false); }}
                  className={`${styles.btn} ${styles.cancelButton}`}
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={() => eliminarUsuarioAdmin(empresaUsuario)}
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
