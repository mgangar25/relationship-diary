import "./globals.css";

export const metadata = {
  title: "Our Diary",
  description: "A private shared diary",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-black text-white">
        {/* App shell */}
        <header className="border-b border-white/10">
          <nav className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
            <h1 className="text-lg font-semibold">Our Diary</h1>

            <div className="flex gap-6 text-sm text-white/80">
              <span>Home</span>
              <span>Diary</span>
              <span>Memories</span>
              <span>Letters</span>
            </div>
          </nav>
        </header>

        <main className="mx-auto max-w-5xl px-6 py-12">
          {children}
        </main>
      </body>
    </html>
  );
}
