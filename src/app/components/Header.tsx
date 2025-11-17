"use client";

import { useAuth } from "../context/AuthContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  // 🟢 Estado para guardar el id del token
  const [adminId, setAdminId] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split(".")[1])); // decodifica JWT
      console.log(payload);
      setAdminId(payload.idEmpresa); // 🟢 Guardamos el ID del token
    } catch (e) {
      console.error("Token inválido:", e);
    }
  }, []);

  const menuItems = [
    { href: "/panel", label: "Panel de Inicio", icon: "dashboard" },
    { href: "/ventas", label: "Ventas", icon: "attach_money" },
    { href: "/empresas", label: "Empresas", icon: "cases" },
    { href: "/eventos", label: "Eventos", icon: "celebration" },
    { href: "/premios", label: "Premios", icon: "featured_seasonal_and_gifts" },
    { href: "/sortear", label: "Sortear", icon: "casino" },
  ];

  return (
    <aside
      style={{
        width: "240px",
        height: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
        backgroundColor: "#2c3e50",
        color: "#ecf0f1",
        padding: "20px 0",
        boxShadow: "2px 0 10px rgba(0,0,0,0.1)",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "0 24px",
          marginBottom: "30px",
          borderBottom: "1px solid #34495e",
          paddingBottom: "14px",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: "1rem",
            fontWeight: 600,
            color: "#fff",
          }}
        >
          Azzar Administrador
        </h2>
      </div>

      {/* Menú */}
      <nav style={{ flex: 1, padding: "0 16px" }}>
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {menuItems
            .filter((item) => {
              // 🛑 Solo mostrar "Empresas" si el ID es -99
              if (item.href === "/empresas" && adminId !== -99) return false;
              return true;
            })
            .map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href} style={{ marginBottom: "4px" }}>
                  <Link
                    href={item.href}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "10px 16px",
                      borderRadius: "8px",
                      color: "#ecf0f1",
                      textDecoration: "none",
                      fontWeight: 500,
                      borderBottom: isActive
                        ? "2px solid #1abc9c"
                        : "2px solid transparent",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{
                        fontSize: "20px",
                        color: isActive ? "#1abc9c" : "#ecf0f1",
                      }}
                    >
                      {item.icon}
                    </span>
                    {item.label}
                  </Link>
                </li>
              );
            })}
        </ul>
      </nav>

      {/* Usuario y Logout */}
      {user && (
        <div
          style={{
            borderTop: "1px solid #34495e",
            paddingTop: "16px",
            padding: "16px 24px",
            marginTop: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
              account_circle
            </span>
            <strong style={{ fontSize: "14px", color: "#bdc3c7" }}>
              {user.username}
            </strong>
          </div>

          <button
            onClick={logout}
            style={{
              width: "100%",
              padding: "8px",
              background: "#e74c3c",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </aside>
  );
}
