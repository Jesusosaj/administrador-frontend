// app/layout.tsx
import type { Metadata } from "next";
import { Poppins, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";

// Importar la fuente Poppins con peso y estilos deseados
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"], // puedes ajustar los pesos según necesites
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Azzar - Administrador",
  description: "Sistema de gestión de productos",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${poppins.variable} ${geistMono.variable}`}
        style={{ margin: 0, backgroundColor: "#f9fafb", fontFamily: "var(--font-poppins)" }}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
