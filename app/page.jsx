"use client";
import React, { useEffect, useState, useMemo } from "react";

export default function Home() {
  const [apiUrl, setApiUrl] = useState(
    "http://104.248.210.141:3000/api/accounts/performance"
  );
  const [inputUrl, setInputUrl] = useState("");
  const [rawData, setRawData] = useState(null);
  const [accounts, setAccounts] = useState([]);
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

      setAccounts(list);
    } catch (e) {
      setError("Erro ao carregar API");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(apiUrl);
    const interval = setInterval(() => load(apiUrl), 60000);
    return () => clearInterval(interval);
  }, [apiUrl]);

  // Filtragem de dados
  const filtered = useMemo(() => {
    return accounts.filter((acc) => {
      const wr =
        acc.wins + acc.losses > 0
          ? (acc.wins / (acc.wins + acc.losses)) * 100
          : 0;

      if (minAccount && acc.accountNumber < +minAccount) return false;
      if (maxAccount && acc.accountNumber > +maxAccount) return false;
      if (minSlp && acc.totalSlp < +minSlp) return false;
      if (minWinrate && wr < +minWinrate) return false;
      if (onlyConnected && !acc.isConnected) return false;
      if (onlyFighting && !acc.isFighting) return false;

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
  const totalSLP = filtered.reduce((s, a) => s + (a.totalSlp || 0), 0);
  const totalWins = filtered.reduce((s, a) => s + (a.wins || 0), 0);
  const totalLosses = filtered.reduce((s, a) => s + (a.losses || 0), 0);
  const winrateGeral =
    totalWins + totalLosses > 0
      ? ((totalWins / (totalWins + totalLosses)) * 100).toFixed(2)
      : 0;

  return (
    <div className="space-y-10">

      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-blue-700">Axie Infinity – Painel de Contas</h1>
        <p className="text-gray-600 mt-2">Estatísticas em tempo real, atualizadas automaticamente</p>
      </div>

      {/* Input URL */}
      <div className="flex gap-2 max-w-xl mx-auto">
        <input
          className="input"
          placeholder="Cole aqui a URL da API..."
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
        />
        <button
          onClick={() => inputUrl.trim() && setApiUrl(inputUrl.trim())}
          className="btn-blue"
        >
          Trocar API
        </button>
      </div>

      {/* Loading / Erro */}
      {loading && <p className="text-center text-lg">Carregando...</p>}
      {error && <p className="text-center text-red-600 text-lg">{error}</p>}

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

        <div className="card">
          <h3 className="text-gray-600 text-sm">Total de Contas</h3>
          <p className="text-3xl font-bold text-blue-700">{filtered.length}</p>
        </div>

        <div className="card">
          <h3 className="text-gray-600 text-sm">Total SLP</h3>
          <p className="text-3xl font-bold text-blue-700">{totalSLP}</p>
        </div>

        <div className="card">
          <h3 className="text-gray-600 text-sm">Vitórias</h3>
          <p className="text-3xl font-bold text-green-600">{totalWins}</p>
        </div>

        <div className="card">
          <h3 className="text-gray-600 text-sm">Winrate Geral</h3>
          <p className="text-3xl font-bold text-purple-600">{winrateGeral}%</p>
        </div>
      </div>

      {/* FILTROS */}
      <div className="card space-y-4">
        <h2 className="text-xl font-semibold text-blue-700">Filtros</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input className="input" placeholder="Conta mínima" value={minAccount} onChange={(e) => setMinAccount(e.target.value)} />
          <input className="input" placeholder="Conta máxima" value={maxAccount} onChange={(e) => setMaxAccount(e.target.value)} />
          <input className="input" placeholder="SLP mínimo" value={minSlp} onChange={(e) => setMinSlp(e.target.value)} />
          <input className="input" placeholder="Winrate mínimo (%)" value={minWinrate} onChange={(e) => setMinWinrate(e.target.value)} />
        </div>

        <div className="flex gap-4 items-center">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={onlyConnected} onChange={() => setOnlyConnected(!onlyConnected)} />
            Somente Conectadas
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" checked={onlyFighting} onChange={() => setOnlyFighting(!onlyFighting)} />
            Somente em Luta
          </label>

          <button
            onClick={() => {
              setMinAccount("");
              setMaxAccount("");
              setMinSlp("");
              setMinWinrate("");
              setOnlyConnected(false);
              setOnlyFighting(false);
            }}
            className="btn-gray"
          >
            Limpar
          </button>
        </div>
      </div>

      {/* TABELA */}
      <div className="card overflow-auto">
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
              const wr =
                acc.wins + acc.losses > 0
                  ? ((acc.wins / (acc.wins + acc.losses)) * 100).toFixed(1)
                  : 0;

              return (
                <tr key={i}>
                  <td>{acc.account}</td>
                  <td>{acc.totalSlp}</td>
                  <td className="text-green-600">{acc.wins}</td>
                  <td className="text-red-600">{acc.losses}</td>
                  <td>{wr}%</td>
                  <td>
                    {acc.isFighting ? (
                      <span className="text-blue-700 font-semibold">Lutando</span>
                    ) : acc.isConnected ? (
                      <span className="text-green-700 font-semibold">Online</span>
                    ) : (
                      <span className="text-gray-500">Offline</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
