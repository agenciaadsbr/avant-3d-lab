export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();
  const { items, total, subtotal, discount, paymentMethod, notes, couponCode, status } = body;

  if (!items?.length) return NextResponse.json({ error: "Nenhum item" }, { status: 400 });

  // Tenta pegar o usuário logado, senão usa um usuário genérico
  const session = await auth();
  let userId: string;

  if (session?.user?.email) {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    userId = user?.id || "";
  }

  // Se não logado, cria/busca usuário anônimo
  if (!userId!) {
    const guestEmail = "pedido.site@accessfit.com.br";
    const guest = await prisma.user.upsert({
      where: { email: guestEmail },
      update: {},
      create: { email: guestEmail, name: "Pedido Site", role: "customer" },
    });
    userId = guest.id;
  }

  const vendaManual = await prisma.product.findFirst({ where: { name: "Venda Manual" } });

  const order = await prisma.order.create({
    data: {
      userId,
      status: status || "pending",
      paymentStatus: "pending",
      paymentMethod: paymentMethod || "pix",
      amountPaid: 0,
      total: total || subtotal,
      subtotal: subtotal || total,
      discount: discount || 0,
      shipping: 0,
      notes: notes || null,
      couponCode: couponCode || null,
      items: {
        create: items.map((i: any) => ({
          productId: i.productId || vendaManual?.id,
          quantity: i.quantity,
          price: i.price,
          size: i.size || null,
        })),
      },
    },
  });

  // Incrementar usedCount do cupom
  if (couponCode) {
    await prisma.coupon.updateMany({
      where: { code: couponCode },
      data: { usedCount: { increment: 1 } },
    });
  }

  return NextResponse.json({ id: order.id });
}
