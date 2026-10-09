import type { Metadata } from "next";
import "@/app/globals.css"
import Header from "@/app/components/customer/Header";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "FlightBooking",
  description: "FlightBooking",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html className="h-full">
      <body className="flex min-h-full flex-col bg-slate-50 text-slate-900 antialiased">
        <Header />
        <main className="flex flex-1 flex-col">{children}</main>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
