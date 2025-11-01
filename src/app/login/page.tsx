"use client";

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import styles from "./page.module.css";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";

const API_URL = "http://localhost:8080/v1/azzar/admin/login";

export default function LoginPage() {
    const { login } = useAuth();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async () => {
        setLoading(true);
        setMensaje("");
        try {
            const dataJson = JSON.stringify({
                usuario: username.trim(),
                contrasena: password,
            });

            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: dataJson,
            });

            const data = await response.text();

            if (!response.ok) {
                return;
            }

            localStorage.setItem("token", data);

            const decoded = jwtDecode(data);

            await login({
                id: decoded.idUsuario,
                username: decoded.nombre,
            });

            router.push("/panel");
        } catch (err) {
            console.error("Error en login:", err);
            console.log("response: ", err);
        } finally {
            setLoading(false);
        }
    };
    const modalStyle: React.CSSProperties = {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
    };

    const modalContentStyle: React.CSSProperties = {
        backgroundColor: "#fff",
        padding: "24px",
        borderRadius: "12px",
        width: "90%",
        maxWidth: "400px",
        textAlign: "center",
        boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
    };

    const spinnerStyle: React.CSSProperties = {
        borderTop: "4px solid #0070f3",
        borderRight: "4px solid transparent",
        borderBottom: "4px solid transparent",
        borderLeft: "4px solid transparent",
        borderRadius: "50%",
        width: "30px",
        height: "30px",
        animation: "spin 1s linear infinite",
        margin: "0 auto 12px",
    };
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            margin: 0,
            padding: '20px',
            boxSizing: 'border-box',
            minHeight: '100vh',
        }}>
            <div className={styles.loginContainer}>
                <h1>Login</h1>
                <input
                    className={styles.inputs}
                    placeholder="Usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={loading}
                />
                <input
                    className={styles.inputs}
                    placeholder="Contraseña"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                />
                <button
                    className={styles.button}
                    onClick={handleLogin}
                    disabled={loading}
                >
                    {loading ? "Cargando..." : "Entrar"}
                </button>

                {mensaje && !loading && (
                    <div style={modalStyle}>
                        <div style={{
                            ...modalContentStyle,
                            border: mensaje.includes("✅") ? "2px solid #28a745" : "2px solid #dc3545"
                        }}>
                            <p style={{ margin: "0", fontSize: "16px", whiteSpace: "pre-line", lineHeight: "1.6", fontWeight: "bold" }}>{mensaje}</p>
                            <button
                                onClick={() => {
                                    setMensaje("");
                                }}
                                style={{
                                    marginTop: "16px",
                                    padding: "8px 16px",
                                    background: "#0070f3",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                }}
                            >
                                Aceptar
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}