import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { Package, User, MapPin } from "lucide-react";

export default async function ContaPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const orders = await prisma.order.findMany({
    where: { userId: session.user?.id },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const statusLabel: Record<string, string> = {
    pending: "Aguardando",
    confirmed: "Confirmado",
    shipped: "Enviado",
    delivered: "Entregue",
    cancelled: "Cancelado",
  };

  const statusColor: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    confirmed: "bg-blue-100 text-blue-700",
    shipped: "bg-purple-100 text-purple-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-black text-gray-900 mb-8">Minha Conta</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {[
          { icon: <User size={20} />, label: "Dados Pessoais", href: "/conta/perfil" },
          { icon: <Package size={20} />, label: "Meus Pedidos", href: "/conta/pedidos" },
          { icon: <MapPin size={20} />, label: "Endereços", href: "/conta/enderecos" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-2xl hover:border-pink-300 hover:shadow-sm transition-all"
          >
            <div className="p-2 bg-pink-100 text-pink-600 rounded-xl">
              {item.icon}
            </div>
            <span className="font-semibold text-gray-800">{item.label}</span>
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Pedidos Recentes</h2>
          <Link href="/conta/pedidos" className="text-sm text-pink-600 hover:underline">
            Ver todos
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl text-gray-400">
            <Package size={40} className="mx-auto mb-3 opacity-40" />
            <p>Você ainda não fez nenhum pedido.</p>
            <Link href="/produtos" className="mt-3 inline-block text-pink-600 font-semibold text-sm hover:underline">
              Começar a comprar
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order.id} className="bg-white border border-gray-100 rounded-2xl p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-gray-500">
                      Pedido #{order.id.slice(-8).toUpperCase()} •{" "}
                      {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                    <p className="font-bold text-gray-900 mt-0.5">
                      {formatCurrency(order.total)}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {order.items.length} ite{order.items.length > 1 ? "ns" : "m"}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      statusColor[order.status] || "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {statusLabel[order.status] || order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
