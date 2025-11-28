import "./globals.css";

export const metadata = {
  title: "Axie Dashboard",
  description: "Painel de estatísticas das contas Axie Infinity",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br">
      <body>

        <nav className="topbar">
          <div className="topbar-inner">
            <div className="topbar-title">Axie Dashboard</div>

            <div className="topbar-links">
              <span>Painel</span>
              <span>Contas</span>
              <span>Filtros</span>
            </div>
          </div>
        </nav>

        <main className="app-main">
          {children}
        </main>

        <footer className="app-footer">
          Desenvolvido por <strong>Renan / AlfaBit26</strong>
        </footer>

      </body>
    </html>
  );
}
