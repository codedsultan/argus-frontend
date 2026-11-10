import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Operations",
    template: "%s · Argus Operations",
  },
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-[#070b0f] text-slate-100">{children}</div>
  );
}
