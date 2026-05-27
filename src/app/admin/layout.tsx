import type { Metadata } from "next";
import { AdminLayoutContent } from "@/components/admin/AdminLayoutContent";
import { AdminAuthProvider } from "@/components/admin/AdminAuthProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";

import Script from "next/script";

export const metadata: Metadata = {
  title: "Admin Panel | biodata99.com",
  description: "Administrative console for managing matrimonial biodatas, users, and templates.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {/* Theme initialiser - must run before paint to avoid flash. 
          Placed here (server component) so Next.js emits it as real HTML. */}
      <Script
        id="admin-theme-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `(function(){try{var s=localStorage.getItem('admin-theme-storage');var dark=true;if(s){var p=JSON.parse(s);if(p&&p.state)dark=p.state.theme==='dark';}if(dark){document.documentElement.classList.add('dark');}else{document.documentElement.classList.remove('dark');}}catch(e){}})();`
        }}
      />
      <AdminAuthProvider>
        <QueryProvider>
          <AdminLayoutContent>{children}</AdminLayoutContent>
        </QueryProvider>
      </AdminAuthProvider>
    </>
  );
}
