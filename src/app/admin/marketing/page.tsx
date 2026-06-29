import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import MarketingClient from "./MarketingClient";

export const dynamic = 'force-dynamic';

export default async function MarketingPage() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin") redirect("/");

  const now = new Date();
  const thisMonth = now.getMonth();
  const nextMonth = (thisMonth + 1) % 12;
  const nextMonthYear = thisMonth === 11 ? now.getFullYear() + 1 : now.getFullYear();
  const dias60 = new Date(now); dias60.setDate(dias60.getDate() - 60);

  const [
    gastosMarketing, campanhas, cupons,
    topClientsRaw, clientNames,
    aniversariantesEste, aniversariantesProximo,
    inativos, tryOnStats,
  ] = await Promise.all([
    // Gastos marketing
    prisma.expense.findMany({
      where: { category: "marketing" },
      orderBy: { date: "desc" },
      include: { supplier: { select: { name: true } } },
    }),
    // Campanhas
    prisma.campaign.findMany({ orderBy: { startDate: "desc" } }),
    // Cupons
    prisma.coupon.findMany({ orderBy: { createdAt: "desc" } }),
    // Top clientes (raw query)
    prisma.$queryRaw<Array<{userId: string, total_gasto: number, num_pedidos: number}>>`
      SELECT "userId", SUM(total) as total_gasto, COUNT(id) as num_pedidos
      FROM "Order" WHERE status != 'cancelled'
      GROUP BY "userId" ORDER BY total_gasto DESC LIMIT 15
    `,
    // Nomes dos top clientes
    prisma.user.findMany({
      where: { role: "customer" },
      select: { id: true, name: true, phone: true, birthDate: true },
    }),
    // Aniversariantes este mês
    prisma.user.findMany({
      where: { role: "customer", birthDate: { not: null } },
      select: { id: true, name: true, phone: true, birthDate: true },
    }),
    // (mesmo dataset, filtro no client)
    Promise.resolve([]),
    // Clientes inativos (sem compra há 60+ dias)
    prisma.$queryRaw<Array<{userId: string, ultima_compra: Date}>>`
      SELECT "userId", MAX("createdAt") as ultima_compra
      FROM "Order" WHERE status != 'cancelled'
      GROUP BY "userId"
      HAVING MAX("createdAt") < ${dias60}
    `,
    // Home Try-On stats
    prisma.order.groupBy({
      by: ["status"],
      where: { status: { in: ["try-on", "delivered", "cancelled"] } },
      _count: { id: true },
    }),
  ]);

  const totalMarketing = gastosMarketing.reduce((s, e) => s + e.amount, 0);

  // Top clientes com nomes
  const nameMap = Object.fromEntries(clientNames.map(c => [c.id, { name: c.name, phone: c.phone }]));
  const topClientes = topClientsRaw.map(c => ({
    id: c.userId,
    name: nameMap[c.userId]?.name || "—",
    phone: nameMap[c.userId]?.phone || null,
    totalGasto: Number(c.total_gasto),
    numPedidos: Number(c.num_pedidos),
  }));

  // Aniversariantes
  const todos = clientNames.filter(c => c.birthDate);
  const anivEste = todos.filter(c => new Date(c.birthDate!).getMonth() === thisMonth);
  const anivProximo = todos.filter(c => new Date(c.birthDate!).getMonth() === nextMonth);

  // Clientes inativos com nomes
  const inativosComNome = (inativos as any[]).map(i => ({
    name: nameMap[i.userId]?.name || "—",
    phone: nameMap[i.userId]?.phone || null,
    ultimaCompra: i.ultima_compra,
    diasSemCompra: Math.floor((now.getTime() - new Date(i.ultima_compra).getTime()) / (1000 * 60 * 60 * 24)),
  })).sort((a, b) => b.diasSemCompra - a.diasSemCompra);

  // Home Try-On
  const tryOnEmAndamento = tryOnStats.find(s => s.status === "try-on")?._count.id || 0;
  const tryOnTotal = tryOnStats.reduce((s, t) => s + t._count.id, 0);

  return (
    <div style={{ backgroundColor: "#FAF6EE", minHeight: "100vh" }}>
      <MarketingClient
        gastosMarketing={gastosMarketing.map(g => ({ ...g, date: g.date.toISOString(), supplier: g.supplier }))}
        totalMarketing={totalMarketing}
        campanhas={campanhas.map(c => ({ ...c, startDate: c.startDate.toISOString(), endDate: c.endDate?.toISOString() || null, createdAt: c.createdAt.toISOString(), updatedAt: c.updatedAt.toISOString() }))}
        cupons={cupons.map(c => ({ ...c, expiresAt: c.expiresAt?.toISOString() || null, createdAt: c.createdAt.toISOString() }))}
        topClientes={topClientes}
        anivEste={anivEste.map(c => ({ ...c, birthDate: c.birthDate?.toISOString() || null }))}
        anivProximo={anivProximo.map(c => ({ ...c, birthDate: c.birthDate?.toISOString() || null }))}
        inativos={inativosComNome}
        tryOnEmAndamento={tryOnEmAndamento}
        tryOnTotal={tryOnTotal}
        mesAtual={["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"][thisMonth]}
        mesProximo={["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"][nextMonth]}
      />
    </div>
  );
}
