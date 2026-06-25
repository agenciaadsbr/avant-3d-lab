export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { items, total, couponCode, couponDiscount } = await req.json();

  if (!items || items.length === 0)
    return NextResponse.json({ error: "Carrinho vazio" }, { status: 400 });

  // Cria um "rascunho" de pedido com status "preview"
  const order = await prisma.order.create({
    data: {
      status: "preview",
      paymentStatus: "pending",
      paymentMethod: "whatsapp",
      total,
      couponCode: couponCode || undefined,
      couponDiscount,
      items: {
        create: items.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
      },
    },
    include: { items: { include: { product: true } } },
  });

  return NextResponse.json({
    previewToken: order.id,
    shareUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/pedido-preview/${order.id}`
  });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("id");

  if (!orderId)
    return NextResponse.json({ error: "ID não informado" }, { status: 400 });

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } } },
  });

  if (!order || order.status !== "preview")
    return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });

  return NextResponse.json(order);
}
