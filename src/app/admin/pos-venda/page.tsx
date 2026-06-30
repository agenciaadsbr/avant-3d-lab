import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import PosVendaClient from "./PosVendaClient";

export const dynamic = 'force-dynamic';

export default async function PosVendaPage() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin") redirect("/");

  return <PosVendaClient />;
}
