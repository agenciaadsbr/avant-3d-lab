import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminNav from "./AdminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin") redirect("/");

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#FAF6EE" }}>
      <AdminNav />
      <div style={{ paddingBottom: "5rem" }}>
        {children}
      </div>
    </div>
  );
}
