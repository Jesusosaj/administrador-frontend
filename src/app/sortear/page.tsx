"use client";

import { useEffect, useState, useRef } from "react";
import Sidebar from "../components/Header";
import styles from "./page.module.css";

const API_VENTAS = "http://148.230.72.52:8080/v1/azzar/ventas/reporte-por-premio";
const API_PREMIOS = "http://148.230.72.52:8080/v1/azzar/premios";
const API_SORTEO = "http://148.230.72.52:8080/v1/azzar/agente/sorteo";

export default function SorteoPage() {
  const [selectedPremio, setSelectedPremio] = useState<number | null>(null);
  const [ventas, setVentas] = useState<any[]>([]);
  const [premios, setPremios] = useState<any[]>([]);
  const [ganador, setGanador] = useState<any | null>(null);
  const [isSorteando, setIsSorteando] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [indiceVisual, setIndiceVisual] = useState(0);
  const [agenteActivo, setAgenteActivo] = useState(false);

  const ruletaInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchPremios();
  }, []);

  const fetchPremios = async () => {
    try {
      const res = await fetch(API_PREMIOS);
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      setPremios(data);
    } catch (err: any) {
      console.error("Error cargando premios:", err);
      setError(err.message);
    }
  };

  const fetchVentas = async (premioId: number) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_VENTAS}/${premioId}`);
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();

      const mapped = data.map((v: any, index: number) => ({
        uid: `${v.idRifa}-${v.numeroRifa}-${index}`,
        id: v.idRifa,
        ticket: v.numeroRifa,
        comprador: v.nombreCliente,
        sexo: v.sexo,
        estado: v.estadoVenta,
      }));

      setVentas(mapped);
      setGanador(null);
      setIndiceVisual(0);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleAgente = () => setAgenteActivo(prev => !prev);

  const handleStartSorteo = async () => {
    if (!selectedPremio || ventas.length === 0) return;

    const activos = ventas.filter(v => v.estado === 2);
    if (activos.length === 0) {
      alert("No hay tickets activos para sortear.");
      return;
    }

    setIsSorteando(true);
    setGanador(null);

    ruletaInterval.current = setInterval(() => {
      setIndiceVisual(prev => (prev + 1) % ventas.length);
    }, 80);

    try {
      const res = await fetch(`${API_SORTEO}/${selectedPremio}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "agenteHabilitado": agenteActivo.toString(),
        },
      });

      const data = await res.json();
      const normalize = (t: string) => t.replace(/^0+/, "");

      const ganadorReal =
        ventas.find(
          v => normalize(v.ticket) === normalize(data.numeroRifa.toString())
        ) || {
          uid: `nuevo-${data.idRifa}-${Date.now()}`,
          id: data.idRifa,
          ticket: data.numeroRifa,
          comprador: data.nombreCliente,
        };

      setTimeout(() => handleStopSorteo(ganadorReal), 3000);
    } catch {
      handleStopSorteo(null);
    }
  };

  const handleStopSorteo = (ganadorData: any | null) => {
    if (ruletaInterval.current) clearInterval(ruletaInterval.current);

    setIsSorteando(false);

    if (ganadorData) {
      const normalize = (t: string) => t.replace(/^0+/, "");

      const index = ventas.findIndex(
        v => normalize(v.ticket) === normalize(ganadorData.ticket.toString())
      );

      setIndiceVisual(index >= 0 ? index : ventas.length);
      setGanador(ganadorData);
    }
  };

  const getVisibleIndices = () => {
    if (ventas.length === 0) return [];
    const center = indiceVisual;
    return [-2, -1, 0, 1, 2].map(offset => (center + offset + ventas.length) % ventas.length);
  };

  const nombrePremio = selectedPremio
    ? premios.find(p => p.idPremio === selectedPremio)?.nombrePremio
    : "";

  return (
    <>
      <Sidebar />

      <div className={styles.mainContent}>
        {/* ------- LISTA IZQUIERDA DE PREMIOS ------- */}
        <aside className={styles.sidebarPremios}>
          <button
            onClick={toggleAgente}
            className={`${styles.toggleBtn} ${agenteActivo ? styles.active : styles.inactive}`}
          >
            <span className="material-symbols-outlined">
              {agenteActivo ? "toggle_on" : "toggle_off"}
            </span>
            Agente Inteligente
          </button>
          <h3 className={styles.sidebarTitle}>Premios</h3>

          <div className={styles.premiosList}>
            {premios.map((p) => (
              <div
                key={p.idPremio}
                className={`${styles.premioItem} ${selectedPremio === p.idPremio ? styles.premioItemActivo : ""}`}
                onClick={() => {
                  if (selectedPremio === p.idPremio) {
                    // 🔹 Deseleccionar
                    setSelectedPremio(null);
                    setVentas([]);
                    setGanador(null);
                  } else {
                    // 🔹 Seleccionar
                    setSelectedPremio(p.idPremio);
                    fetchVentas(p.idPremio);
                  }
                }}
              >
                {p.nombrePremio}
              </div>
            ))}
          </div>
        </aside>

        {/* ------- SORTEO A LA DERECHA ------- */}
        <main className={styles.mainRight}>
          {selectedPremio && <h2 className={styles.premioTitle}>{nombrePremio}</h2>}

          {loading && <div className={styles.loading}>Cargando ventas...</div>}
          {error && <div className={styles.error}>{error}</div>}

          {ventas.length > 0 && (
            <>
              {/* Ruleta */}
              <div className={styles.ruletaContainer}>
                {getVisibleIndices().map((idx, position) => {
                  const venta = ventas[idx];
                  const pos = position - 2;
                  const isCenter = pos === 0;
                  const isGanador = ganador && ganador.ticket === venta.ticket;

                  return (
                    <div
                      key={`${venta.uid}-${position}-${indiceVisual}`}
                      className={`${styles.ruletaItem} ${isGanador ? styles.ganadorItem : ""}`}
                      style={{
                        transform: `scale(${isCenter ? 1.1 : pos === 1 || pos === -1 ? 0.9 : 0.75})`,
                        opacity: isCenter ? 1 : 0.6,
                        backgroundColor: isGanador
                          ? "#00b894"
                          : isCenter
                          ? "#dfe6e9"
                          : "#f1f2f6",
                      }}
                    >
                      {venta.ticket} - {venta.comprador}
                    </div>
                  );
                })}
              </div>

              <div className={styles.buttonsContainer}>
                <button
                  onClick={handleStartSorteo}
                  disabled={isSorteando}
                  className={styles.sortearBtn}
                >
                  Sortear
                </button>
                <button
                  onClick={() => handleStopSorteo(ganador)}
                  disabled={!isSorteando}
                  className={styles.sortearBtn}
                >
                  Parar
                </button>
              </div>

              {ganador && !isSorteando && (
                <div className={styles.ganador}>
                  <strong>{ganador.comprador}</strong> ganó con el ticket{" "}
                  <strong>#{ganador.ticket}</strong>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </>
  );
}
