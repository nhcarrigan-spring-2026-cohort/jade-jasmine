export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="flex h-dvh">
          <nav className="min-w-60 h-full border-r-2 p-4 flex flex-col justify-between">
            <div className="flex flex-col gap-4">
              <p>Foodbank Account Name</p>
              <p>Dashboard</p>
              <p>Inventory</p>
            </div>
            <div className="flex flex-col gap-4 mb-12">
              <p>Sign Out</p>
            </div>
          </nav>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
