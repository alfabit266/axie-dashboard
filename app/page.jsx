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

      // Tenta descobrir onde está a lista de contas
      let list = [];

      if (Array.isArray(raw)) {
        list = raw;
      } else if (Array.isArray(raw.accounts)) {
        list = raw.accounts;
      } else if (raw.data && Array.isArray(raw.data.accounts)) {
        list = raw.data.accounts;
      }

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

  // Aplica filtros em memória
  const filteredAccounts = useMemo(() => {
    return accounts.filter((acc) => {
      const accNumber = Number(acc.accountNumber || acc.account || 0);
      const slp = acc.rewards?.slp || acc.totalSlp || 0;
      const win = acc.fights?.win || acc.wins || 0;
      const loss = acc.fights?.loss || acc.losses || 0;
      const winrate = win + loss > 0 ? (win / (win + loss)) * 100 : 0;

      if (minAccount && accNumber < Number(minAccount)) return false;
      if (maxAccount && accNumber > Number(maxAccount)) return false;
      if (minSlp && slp < Number(minSlp)) return false;
      if (minWinrate && winrate < Number(minWinrate)) return false;
      if (onlyConnected && acc.isConnected === false) return false;
      if (onlyFighting && acc.isFighting === false) return false;

      return true;
    });
  }, [accounts, minAccount, maxAccount, minSlp, minWinrate, onlyConnected, onlyFighting]);

  // Totais (do filtro)
  const totalSLP = filteredAccounts.reduce(
    (s, a) => s + (a.rewards?.slp || a.totalSlp || 0),
    0
  );
  const totalWins = filteredAccounts.reduce(
    (s, a) => s + (a.fights?.win || a.wins || 0),
    0
  );
  const totalLosses = filteredAccounts.reduce(
    (s, a) => s + (a.fights?.loss || a.losses || 0),
    0
  );

  const totalAccounts = accounts.length;
  const filteredCount = filteredAccounts.length;

  const summary = rawData?.data?.summary || rawData?.summary || null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Cabeçalho */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-sky-400">
              Axie Infinity – Painel de Contas
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Estatísticas em tempo real das suas contas. Atualiza a cada 1 minuto.
            </p>
          </div>
          <div className="flex gap-2">
            <input
              className="border border-slate-700 bg-slate-900/70 rounded-xl px-3 py-2 text-sm w-64 outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Cole aqui a URL da API..."
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
            />
            <button
              className="px-4 py-2 text-sm font-semibold rounded-xl bg-sky-600 hover:bg-sky-500 transition"
              onClick={() => inputUrl.trim() && setApiUrl(inputUrl.trim())}
            >
              Trocar API
            </button>
          </div>
        </header>

        {/* Banner de erro */}
        {error && (
          <div className="p-3 rounded-xl bg-red-900/40 border border-red-700 text-sm text-red-200">
            {error}
          </div>
        )}

        {/* Resumo geral (dados vindo do summary da API) */}
        {summary && (
          <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <InfoCard
              title="Contas Totais"
              value={summary.totalAccounts}
              subtitle={`Conectadas: ${summary.connectedAccounts}`}
            />
            <InfoCard
              title="Contas em Luta"
              value={summary.fightingAccounts}
              subtitle={`Fila: ${summary.queuedAccounts}`}
            />
            <InfoCard
              title="Total SLP (Geral)"
              value={summary.overallStats?.totalSlp ?? "-"}
              subtitle={`Winrate médio: ${
                summary.overallStats?.winRate
                  ? `${summary.overallStats.winRate}%`
                  : "-"
              }`}
            />
            <InfoCard
              title="Contas filtradas"
              value={filteredCount}
              subtitle={`de ${totalAccounts} contas`}
            />
          </section>
        )}

        {/* Cards resumo do filtro atual */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard label="Total SLP (Filtro)" value={totalSLP} />
          <StatCard label="Vitórias (Filtro)" value={totalWins} />
          <StatCard label="Derrotas (Filtro)" value={totalLosses} />
        </section>

        {/* Filtros */}
        <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h2 className="text-sm font-semibold text-slate-200">
              Filtros rápidos
            </h2>
            <button
              onClick={() => {
                setMinAccount("");
                setMaxAccount("");
                setMinSlp("");
                setMinWinrate("");
                setOnlyConnected(false);
                setOnlyFighting(false);
              }}
              className="text-xs text-slate-400 hover:text-sky-400"
            >
              Limpar filtros
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
            <div className="space-y-1">
              <label className="text-slate-400 text-xs">Conta mínima</label>
              <input
                type="number"
                value={minAccount}
                onChange={(e) => setMinAccount(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-1.5 outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="ex: 1000"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400 text-xs">Conta máxima</label>
              <input
                type="number"
                value={maxAccount}
                onChange={(e) => setMaxAccount(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-1.5 outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="ex: 2000"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400 text-xs">SLP mínimo</label>
              <input
                type="number"
                value={minSlp}
                onChange={(e) => setMinSlp(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-1.5 outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="ex: 100"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400 text-xs">Winrate mínimo (%)</label>
              <input
                type="number"
                value={minWinrate}
                onChange={(e) => setMinWinrate(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-1.5 outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="ex: 60"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-xs text-slate-300 mt-1">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyConnected}
                onChange={(e) => setOnlyConnected(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900"
              />
              Mostrar apenas contas conectadas
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyFighting}
                onChange={(e) => setOnlyFighting(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900"
              />
              Mostrar apenas contas em luta
            </label>
          </div>
        </section>

        {/* Tabela */}
        <section className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 overflow-x-auto">
          <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
            <span>
              Mostrando <span className="text-sky-400">{filteredCount}</span> contas
              filtradas
            </span>
            {loading && <span>Atualizando dados...</span>}
          </div>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="p-2">Conta</th>
                <th className="p-2">SLP</th>
                <th className="p-2">Vitórias</th>
                <th className="p-2">Derrotas</th>
                <th className="p-2">Winrate</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredAccounts.map((acc, i) => {
                const win = acc.fights?.win || acc.wins || 0;
                const loss = acc.fights?.loss || acc.losses || 0;
                const slp = acc.rewards?.slp || acc.totalSlp || 0;
                const wr = win + loss > 0 ? (win / (win + loss)) * 100 : 0;

                let wrColor = "text-slate-100";
                if (wr >= 70) wrColor = "text-emerald-400";
                else if (wr >= 50) wrColor = "text-yellow-300";
                else if (wr > 0) wrColor = "text-red-400";

                return (
                  <tr
                    key={i}
                    className="border-b border-slate-800 hover:bg-slate-800/60 transition"
                  >
                    <td className="p-2 font-medium text-slate-100">
                      {acc.accountNumber ?? acc.account ?? "-"}
                    </td>
                    <td className="p-2">{slp}</td>
                    <td className="p-2 text-emerald-400">{win}</td>
                    <td className="p-2 text-red-400">{loss}</td>
                    <td className={`p-2 ${wrColor}`}>
                      {win + loss > 0 ? wr.toFixed(1) + "%" : "-"}
                    </td>
                    <td className="p-2 text-xs text-slate-300">
                      {acc.isBanned
                        ? "❌ Banida"
                        : acc.isFighting
                        ? "⚔️ Em luta"
                        : acc.isConnected
                        ? "🟢 Conectada"
                        : "🔴 Offline"}
                    </td>
                  </tr>
                );
              })}

              {filteredAccounts.length === 0 && !loading && (
                <tr>
                  <td
                    colSpan={6}
                    className="p-4 text-center text-slate-400 text-sm"
                  >
                    Nenhuma conta encontrada com esses filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}

// Componentes auxiliares

function InfoCard({ title, value, subtitle }) {
  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
      <p className="text-xs text-slate-400">{title}</p>
      <p className="text-2xl font-bold text-sky-400 mt-1">
        {value ?? "-"}
      </p>
      {subtitle && (
        <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
      )}
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-2xl font-bold text-sky-300 mt-1">{value}</p>
    </div>
  );
}
