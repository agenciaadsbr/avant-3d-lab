import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import AdminNav from "./AdminNav";
import { canAccess } from "@/lib/permissions";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin") redirect("/");

  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  const adminRole = (session.user as any)?.adminRole;

  // Gestão só para admin
  if (pathname.startsWith("/admin/gestao") && adminRole === "vendedor") redirect("/admin");

  // Verifica permissão para a rota atual
  if (pathname && !canAccess(adminRole, pathname)) redirect("/admin");

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#FAF6EE" }}>
      <AdminNav adminRole={adminRole} />
      <div style={{ paddingBottom: "5rem" }}>
        {children}
      </div>
    </div>
  );
}
