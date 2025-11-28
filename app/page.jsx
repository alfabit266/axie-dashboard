"use client";
import React, { useEffect, useMemo, useState } from "react";

export default function Home() {
  const [apiUrl, setApiUrl] = useState(
    "http://104.248.210.141:3000/api/accounts/performance"
  );
  const [inputUrl, setInputUrl] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [rawData, setRawData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtros
  const [minAccount, setMinAccount] = useState("");
  const [maxAccount, setMaxAccount] = useState("");
  const [minSlp, setMinSlp] = useState("");
  const [minWinrate, setMinWinrate] = useState("");
  const [onlyConnected, setOnlyConnected] = useState(false);
  const [onlyFighting, setOnlyFighting] = useState(false);

  async function load(url) {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/proxy?url=${encodeURIComponent(url)}`);
      const raw = await res.json();
      setRawData(raw);

      let list = [];
      if (Array.isArray(raw)) list = raw;
      else if (Array.isArray(raw.accounts)) list = raw.accounts;
      else if (raw.data && Array.isArray(raw.data.accounts))
        list = raw.data.accounts;

      setAccounts(list);
    } catch (e) {
      console.error(e);
      setError("Erro ao carregar API");
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(apiUrl);
    const interval = setInterval(() => load(apiUrl), 60000);
    return () => clearInterval(interval);
  }, [apiUrl]);

  // Aplica filtros
  const filtered = useMemo(() => {
    return accounts.filter((acc) => {
      const accNum = Number(acc.accountNumber || acc.account || 0);
      const slp = acc.totalSlp || acc.rewards?.slp || 0;
      const wins = acc.wins || acc.fights?.win || 0;
      const losses = acc.losses || acc.fights?.loss || 0;
      const wr = wins + losses > 0 ? (wins / (wins + losses)) * 100 : 0;

      if (minAccount && accNum < Number(minAccount)) return false;
      if (maxAccount && accNum > Number(maxAccount)) return false;
      if (minSlp && slp < Number(minSlp)) return false;
      if (minWinrate && wr < Number(minWinrate)) return false;
      if (onlyConnected && acc.isConnected === false) return false;
      if (onlyFighting && acc.isFighting === false) return false;

      return true;
    });
  }, [
    accounts,
    minAccount,
    maxAccount,
    minSlp,
    minWinrate,
    onlyConnected,
    onlyFighting,
  ]);

  // Totais
  const totalSLP = filtered.reduce(
    (s, a) => s + (a.totalSlp || a.rewards?.slp || 0),
    0
  );
  const totalWins = filtered.reduce(
    (s, a) => s + (a.wins || a.fights?.win || 0),
    0
  );
  const totalLosses = filtered.reduce(
    (s, a) => s + (a.losses || a.fights?.loss || 0),
    0
  );
  const winrateGeral =
    totalWins + totalLosses > 0
      ? ((totalWins / (totalWins + totalLosses)) * 100).toFixed(2)
      : 0;

  return (
    <div>
      {/* Header */}
      <div className="header">
        <h1>Axie Infinity – Painel de Contas</h1>
        <p>Estatísticas em tempo real das suas contas. Atualiza a cada 1 minuto.</p>
      </div>

      {/* URL da API */}
      <div className="url-row">
        <input
          className="input"
          placeholder="Cole aqui a URL da API..."
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
        />
        <button
          className="btn-blue"
          onClick={() => inputUrl.trim() && setApiUrl(inputUrl.trim())}
        >
          Trocar API
        </button>
      </div>

      {loading && <p style={{ textAlign: "center", marginTop: 16 }}>Carregando…</p>}
      {error && (
        <p style={{ textAlign: "center", marginTop: 16, color: "red" }}>{error}</p>
      )}

      {/* Cards de resumo */}
      <div className="cards-grid">
        <div className="card">
          <div className="card-title">Contas filtradas</div>
          <div className="card-value">{filtered.length}</div>
        </div>

        <div className="card">
          <div className="card-title">Total SLP (Filtro)</div>
          <div className="card-value">{totalSLP}</div>
        </div>

        <div className="card">
          <div className="card-title">Vitórias (Filtro)</div>
          <div className="card-value" style={{ color: "#16a34a" }}>
            {totalWins}
          </div>
        </div>

        <div className="card">
          <div className="card-title">Winrate Geral</div>
          <div className="card-value" style={{ color: "#7c3aed" }}>
            {winrateGeral}%
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="card filters-card">
        <div className="card-title" style={{ marginBottom: 4 }}>
          Filtros rápidos
        </div>

        <div className="filters-grid">
          <input
            className="input"
            placeholder="Conta mínima ex: 1000"
            value={minAccount}
            onChange={(e) => setMinAccount(e.target.value)}
          />
          <input
            className="input"
            placeholder="Conta máxima ex: 2000"
            value={maxAccount}
            onChange={(e) => setMaxAccount(e.target.value)}
          />
          <input
            className="input"
            placeholder="SLP mínimo ex: 100"
            value={minSlp}
            onChange={(e) => setMinSlp(e.target.value)}
          />
          <input
            className="input"
            placeholder="Winrate mínimo (%) ex: 60"
            value={minWinrate}
            onChange={(e) => setMinWinrate(e.target.value)}
          />
        </div>

        <div className="filters-checkboxes">
          <label>
            <input
              type="checkbox"
              checked={onlyConnected}
              onChange={(e) => setOnlyConnected(e.target.checked)}
            />{" "}
            Mostrar apenas conectadas
          </label>

          <label>
            <input
              type="checkbox"
              checked={onlyFighting}
              onChange={(e) => setOnlyFighting(e.target.checked)}
            />{" "}
            Mostrar apenas em luta
          </label>

          <button
            className="btn-gray"
            onClick={() => {
              setMinAccount("");
              setMaxAccount("");
              setMinSlp("");
              setMinWinrate("");
              setOnlyConnected(false);
              setOnlyFighting(false);
            }}
          >
            Limpar filtros
          </button>
        </div>
      </div>

      {/* Tabela */}
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Conta</th>
              <th>SLP</th>
              <th>Vitórias</th>
              <th>Derrotas</th>
              <th>Winrate</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((acc, i) => {
              const wins = acc.wins || acc.fights?.win || 0;
              const losses = acc.losses || acc.fights?.loss || 0;
              const slp = acc.totalSlp || acc.rewards?.slp || 0;
              const wr =
                wins + losses > 0
                  ? ((wins / (wins + losses)) * 100).toFixed(1)
                  : 0;

              let statusClass = "status-offline";
              let statusLabel = "Offline";
              if (acc.isFighting) {
                statusClass = "status-fighting";
                statusLabel = "Lutando";
              } else if (acc.isConnected) {
                statusClass = "status-online";
                statusLabel = "Online";
              }

              return (
                <tr key={i}>
                  <td>{acc.accountNumber ?? acc.account ?? "-"}</td>
                  <td>{slp}</td>
                  <td style={{ color: "#16a34a" }}>{wins}</td>
                  <td style={{ color: "#dc2626" }}>{losses}</td>
                  <td>{wins + losses > 0 ? `${wr}%` : "-"}</td>
                  <td className={statusClass}>{statusLabel}</td>
                </tr>
              );
            })}

            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: 16, textAlign: "center" }}>
                  Nenhuma conta encontrada com esses filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
