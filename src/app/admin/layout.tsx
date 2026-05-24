import type { Metadata } from "next";
import { AdminLayoutContent } from "@/components/admin/AdminLayoutContent";
import { AdminAuthProvider } from "@/components/admin/AdminAuthProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";

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
    <AdminAuthProvider>
      <QueryProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var themeStorage = localStorage.getItem('admin-theme-storage');
                  var isDark = true;
                  if (themeStorage) {
                    var parsed = JSON.parse(themeStorage);
                    if (parsed && parsed.state) {
                      isDark = parsed.state.theme === 'dark';
                    }
                  }
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `
          }}
        />
        <AdminLayoutContent>{children}</AdminLayoutContent>
      </QueryProvider>
    </AdminAuthProvider>
  );
}
