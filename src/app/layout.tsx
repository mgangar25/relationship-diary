import "./globals.css";
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedLayout from "@/components/ProtectedLayout";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-black dark:bg-gray-900 dark:text-gray-100 transition-colors">
        <ThemeProvider>
          <AuthProvider>
            <ProtectedLayout>
              <Navbar />
              {children}
            </ProtectedLayout>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
