import type { Metadata } from "next";
import "@/app/globals.css";
import Header from "@/app/components/manager/Header";
import { ManagerAuthGuard } from "@/app/components/manager/ManagerAuthGuard";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "FlightBooking Management",
  description: "FlightBooking Management",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className="h-full">
      <body className="flex min-h-full flex-col bg-slate-50 text-slate-900 antialiased">
        <Header />
        <main className="flex flex-1 flex-col">
          <ManagerAuthGuard>{children}</ManagerAuthGuard>
        </main>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}