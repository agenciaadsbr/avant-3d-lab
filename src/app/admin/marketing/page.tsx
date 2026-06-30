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
  const dias60 = new Date(now); dias60.setDate(dias60.getDate() - 60);
  const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    gastosMarketing, campanhas, cupons,
    topClientsRaw, allClients,
    inativos, tryOnStats,
    depoimentos, listasEspera, indicacoes,
    instagramMetrics, metaMes,
    receitaMes,
    vendasTotalMes,
  ] = await Promise.all([
    prisma.expense.findMany({ where: { category: "marketing" }, orderBy: { date: "desc" }, include: { supplier: { select: { name: true } } } }),
    prisma.campaign.findMany({ orderBy: { startDate: "desc" } }),
    prisma.coupon.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.$queryRaw<Array<{userId: string, total_gasto: number, num_pedidos: number}>>`
      SELECT "userId", SUM(total) as total_gasto, COUNT(id) as num_pedidos
      FROM "Order" WHERE status != 'cancelled'
      GROUP BY "userId" ORDER BY total_gasto DESC LIMIT 15
    `,
    prisma.user.findMany({ where: { role: "customer" }, select: { id: true, name: true, phone: true, birthDate: true } }),
    prisma.$queryRaw<Array<{userId: string, ultima_compra: Date}>>`
      SELECT "userId", MAX("createdAt") as ultima_compra FROM "Order"
      WHERE status != 'cancelled' GROUP BY "userId" HAVING MAX("createdAt") < ${dias60}
    `,
    prisma.order.groupBy({ by: ["status"], where: { status: { in: ["try-on", "delivered", "cancelled"] } }, _count: { id: true } }),
    prisma.testimonial.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.waitlist.findMany({ include: { product: { select: { name: true, sku: true, stock: true } } }, orderBy: { createdAt: "desc" } }),
    prisma.referral.findMany({ include: { referrer: { select: { name: true, phone: true } }, referred: { select: { name: true, phone: true } } }, orderBy: { createdAt: "desc" } }),
    prisma.instagramMetric.findMany({ orderBy: { date: "desc" }, take: 12 }),
    prisma.goal.findFirst({ where: { month: thisMonth + 1, year: now.getFullYear() } }),
    prisma.order.aggregate({ _sum: { amountPaid: true }, where: { status: { not: "cancelled" }, createdAt: { gte: startMonth } } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { status: { not: "cancelled" }, createdAt: { gte: startMonth } } }),
  ]);

  const statsMap = await prisma.$queryRaw<Array<{couponCode: string, uses: number, revenue: number}>>`
    SELECT "couponCode", COUNT(id) as uses, SUM(total) as revenue FROM "Order"
    WHERE "couponCode" IS NOT NULL AND status != 'cancelled' GROUP BY "couponCode"
  `;
  const statsMapObj = Object.fromEntries(statsMap.map(s => [s.couponCode, { uses: Number(s.uses), revenue: Number(s.revenue) }]));
  const cuponsComStats = cupons.map(c => ({ ...c, usesReal: statsMapObj[c.code]?.uses || 0, revenueGerada: statsMapObj[c.code]?.revenue || 0 }));

  const totalMarketing = gastosMarketing.reduce((s, e) => s + e.amount, 0);
  const nameMap = Object.fromEntries(allClients.map(c => [c.id, { name: c.name, phone: c.phone, birthDate: c.birthDate }]));

  const topClientes = (topClientsRaw as any[]).map(c => ({
    id: c.userId, name: nameMap[c.userId]?.name || "—", phone: nameMap[c.userId]?.phone || null,
    totalGasto: Number(c.total_gasto), numPedidos: Number(c.num_pedidos),
  }));

  const anivEste = allClients.filter(c => c.birthDate && new Date(c.birthDate).getMonth() === thisMonth);
  const anivProximo = allClients.filter(c => c.birthDate && new Date(c.birthDate).getMonth() === nextMonth);

  const inativosComNome = (inativos as any[]).map(i => ({
    name: nameMap[i.userId]?.name || "—", phone: nameMap[i.userId]?.phone || null,
    ultimaCompra: i.ultima_compra,
    diasSemCompra: Math.floor((now.getTime() - new Date(i.ultima_compra).getTime()) / (1000 * 60 * 60 * 24)),
  })).sort((a, b) => b.diasSemCompra - a.diasSemCompra);

  const tryOnEmAndamento = tryOnStats.find(s => s.status === "try-on")?._count.id || 0;
  const tryOnTotal = tryOnStats.reduce((s, t) => s + t._count.id, 0);
  const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

  const serialize = (obj: any): any => {
    if (obj === null || obj === undefined) return obj;
    if (obj instanceof Date) return obj.toISOString();
    if (Array.isArray(obj)) return obj.map(serialize);
    if (typeof obj === 'object') return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, serialize(v)]));
    return obj;
  };

  return (
    <div style={{ backgroundColor: "#FAF6EE", minHeight: "100vh" }}>
      <MarketingClient
        gastosMarketing={serialize(gastosMarketing)}
        totalMarketing={totalMarketing}
        campanhas={serialize(campanhas)}
        cupons={serialize(cuponsComStats)}
        topClientes={topClientes}
        anivEste={serialize(anivEste)}
        anivProximo={serialize(anivProximo)}
        inativos={inativosComNome.map(i => ({ ...i, ultimaCompra: new Date(i.ultimaCompra).toISOString() }))}
        tryOnEmAndamento={tryOnEmAndamento}
        tryOnTotal={tryOnTotal}
        mesAtual={MESES[thisMonth]}
        mesProximo={MESES[nextMonth]}
        depoimentos={serialize(depoimentos)}
        listaEspera={serialize(listasEspera)}
        indicacoes={serialize(indicacoes)}
        instagramMetrics={serialize(instagramMetrics)}
        metaMes={metaMes ? { ...metaMes } : null}
        receitaMes={receitaMes._sum.amountPaid || 0}
        vendasTotalMes={vendasTotalMes._sum.total || 0}
        mesAtualNum={thisMonth + 1}
        anoAtual={now.getFullYear()}
        allClients={allClients.map(c => ({ id: c.id, name: c.name, phone: c.phone }))}
      />
    </div>
  );
}
