import "./globals.css";
import { ReactNode } from "react";
import AuthProvider from "@/context/AuthProvider";
// import { SessionProvider } from "@/components/session-provider" // Uncomment and use your actual session provider if needed

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <AuthProvider>
        <body>
        {/* <SessionProvider> */}
          {children}
        {/* </SessionProvider> */}
      </body>
      </AuthProvider>
      
    </html>
  );
}
