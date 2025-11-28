export const metadata = {
  title: "Axie Dashboard",
  description: "Painel de estatísticas das contas Axie Infinity",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br">
      <body className="bg-gray-100 text-gray-900">
        {children}
      </body>
    </html>
  );
}
