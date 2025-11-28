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
      const res = await fetch(url);
      const data = await res.json();
      setAccounts(data);
      setError(null);
    } catch (err) {
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

  if (loading) return <div className="p-6 text-xl">Carregando...</div>;
  if (error) return <div className="p-6 text-xl text-red-500">{error}</div>;

  const totalSLP = accounts.reduce((s,a)=>s+(a.totalSlp||0),0);
  const totalWins = accounts.reduce((s,a)=>s+(a.wins||0),0);
  const totalLosses = accounts.reduce((s,a)=>s+(a.losses||0),0);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard Axie Infinity</h1>

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

      <p className="text-sm text-gray-500">Atualizando automaticamente a cada 1 minuto…</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white shadow rounded-2xl">
          <h2>Total SLP Farmado</h2>
          <p className="text-2xl font-bold">{totalSLP}</p>
        </div>
        <div className="p-4 bg-white shadow rounded-2xl">
          <h2>Vitórias Totais</h2>
          <p className="text-2xl font-bold">{totalWins}</p>
        </div>
        <div className="p-4 bg-white shadow rounded-2xl">
          <h2>Derrotas Totais</h2>
          <p className="text-2xl font-bold">{totalLosses}</p>
        </div>
      </div>

      <div className="bg-white shadow rounded-2xl p-4 overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th>Conta</th><th>SLP</th><th>Vitórias</th><th>Derrotas</th><th>Winrate</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((acc, i) => {
              const wr = acc.wins+acc.losses>0 ? ((acc.wins/(acc.wins+acc.losses))*100).toFixed(1) : 0;
              return (
                <tr key={i} className="border-b hover:bg-gray-100">
                  <td>{acc.account}</td>
                  <td>{acc.totalSlp}</td>
                  <td className="text-green-600">{acc.wins}</td>
                  <td className="text-red-600">{acc.losses}</td>
                  <td>{wr}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
