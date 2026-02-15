import "./globals.css";
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { SettingsProvider } from "@/context/SettingsContext";
import ProtectedLayout from "@/components/ProtectedLayout";
import AppShell from "@/components/AppShell";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <AuthProvider>
            <SettingsProvider>
              <ProtectedLayout>
                <AppShell>
                  <Navbar />
                  <main className="max-w-6xl mx-auto px-6 py-8">
                    {children}
                  </main>
                </AppShell>
              </ProtectedLayout>
            </SettingsProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
