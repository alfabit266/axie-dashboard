"use client";
import React, { useEffect, useState } from "react";

export default function Home() {
  const [apiUrl, setApiUrl] = useState(
    "http://104.248.210.141:3000/api/accounts/performance"
  );
  const [inputUrl, setInputUrl] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function load(url) {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/proxy?url=${encodeURIComponent(url)}`);
      const raw = await res.json();

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
      setError("Erro ao carregar API: " + e.message);
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

  const totalSLP = accounts.reduce(
    (s, a) => s + (a.rewards?.slp || a.totalSlp || 0),
    0
  );
  const totalWins = accounts.reduce(
    (s, a) => s + (a.fights?.win || a.wins || 0),
    0
  );
  const totalLosses = accounts.reduce(
    (s, a) => s + (a.fights?.loss || a.losses || 0),
    0
  );

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard Axie Infinity</h1>

      {/* Banner de erro, se existir */}
      {error && (
        <div className="p-3 rounded-xl bg-red-100 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Campo para trocar URL */}
      <div className="flex gap-2">
        <input
          className="border rounded-xl p-2 w-full"
          placeholder="Cole aqui a URL da API..."
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
        />
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-xl"
          onClick={() => inputUrl.trim() && setApiUrl(inputUrl.trim())}
        >
          Carregar
        </button>
      </div>

      <p className="text-sm text-gray-500">
        Atualizando automaticamente a cada 1 minuto…
      </p>

      {loading && <div className="text-lg">Carregando dados...</div>}

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white shadow rounded-2xl">
          <h2 className="font-semibold">Total SLP Farmado</h2>
          <p className="text-2xl font-bold">{totalSLP}</p>
        </div>
        <div className="p-4 bg-white shadow rounded-2xl">
          <h2 className="font-semibold">Vitórias Totais</h2>
          <p className="text-2xl font-bold">{totalWins}</p>
        </div>
        <div className="p-4 bg-white shadow rounded-2xl">
          <h2 className="font-semibold">Derrotas Totais</h2>
          <p className="text-2xl font-bold">{totalLosses}</p>
        </div>
      </div>

      {/* Tabela de contas */}
      <div className="bg-white shadow rounded-2xl p-4 overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="p-2">Conta</th>
              <th className="p-2">SLP</th>
              <th className="p-2">Vitórias</th>
              <th className="p-2">Derrotas</th>
              <th className="p-2">Winrate</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((acc, i) => {
              const win = acc.fights?.win || acc.wins || 0;
              const loss = acc.fights?.loss || acc.losses || 0;
              const slp = acc.rewards?.slp || acc.totalSlp || 0;
              const wr =
                win + loss > 0 ? ((win / (win + loss)) * 100).toFixed(1) : 0;

              return (
                <tr key={i} className="border-b hover:bg-gray-100">
                  <td className="p-2">
                    {acc.accountNumber ?? acc.account ?? "-"}
                  </td>
                  <td className="p-2">{slp}</td>
                  <td className="p-2 text-green-600">{win}</td>
                  <td className="p-2 text-red-600">{loss}</td>
                  <td className="p-2">{wr}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
