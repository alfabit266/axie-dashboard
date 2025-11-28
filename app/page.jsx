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
      const res = await fetch(`/api/proxy?url=${encodeURIComponent(url)}`);
      const raw = await res.json();

      if (raw.error || !raw.data || !raw.data.accounts) {
        setError("Erro ao carregar API");
        return;
      }

      // 🔥 Agora usamos a lista correta:
      const list = raw.data.accounts;

      setAccounts(list);
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

  const totalSLP = accounts.reduce((s, a) => s + (a.rewards?.slp || 0), 0);
  const totalWins = accounts.reduce((s, a) => s + (a.fights?.win || 0), 0);
  const totalLosses = accounts.reduce((s, a) => s + (a.fights?.loss || 0), 0);

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
