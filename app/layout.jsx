import "./globals.css";

export const metadata = {
  title: "Axie Dashboard",
  description: "Painel de estatísticas das contas Axie Infinity – Atualizado em tempo real.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br">
      <body className="bg-[#f2f6fc] text-gray-900 min-h-screen">
        {/* NAVBAR TOP */}
        <nav className="w-full bg-blue-700 text-white shadow-lg">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <h1 className="text-xl font-bold tracking-wide">Axie Dashboard</h1>

            <div className="flex gap-6 text-sm">
              <a href="/" className="hover:text-blue-200">Painel</a>
              <a href="#" className="hover:text-blue-200">Contas</a>
              <a href="#" className="hover:text-blue-200">Filtros</a>
              <a href="#" className="hover:text-blue-200">Configurações</a>
            </div>
          </div>
        </nav>

        {/* MAIN CONTENT */}
        <main className="max-w-6xl mx-auto mt-8 p-4">
          {children}
        </main>

        {/* FOOTER */}
        <footer className="mt-12 w-full text-center text-sm text-gray-500 py-6">
          Desenvolvido por <span className="text-blue-700 font-semibold">Renan / AlfaBit26</span>
        </footer>
      </body>
    </html>
  );
}
