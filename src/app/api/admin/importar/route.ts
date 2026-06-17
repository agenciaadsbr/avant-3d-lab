import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";
import { slugify } from "@/lib/utils";

// Normaliza chave: remove acentos, minúsculo, trim
function norm(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

// Busca valor na row ignorando acentos e capitalização
function col(row: Record<string, unknown>, ...keys: string[]): string {
  const normRow: Record<string, unknown> = {};
  for (const k of Object.keys(row)) normRow[norm(k)] = row[k];
  for (const k of keys) {
    const v = normRow[norm(k)];
    if (v !== undefined && v !== null && String(v).trim() !== "") return String(v).trim();
  }
  return "";
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin")
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

  if (rows.length === 0)
    return NextResponse.json({ error: "Planilha vazia ou formato inválido." }, { status: 400 });

  const categories = await prisma.category.findMany();
  const catMap = Object.fromEntries(categories.map(c => [norm(c.name), c.id]));

  const results = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2;

    const nome = col(row, "Produto", "produto", "nome", "Nome");
    const categoria = col(row, "Categoria", "categoria");
    const precoRaw = col(row, "Preco venda", "Preço venda", "Preço Venda", "preco venda", "preco", "Preço", "Valor venda")
      .replace(/R\$\s*/g, "").replace(".", "").replace(",", ".");
    const preco = parseFloat(precoRaw);

    if (!nome) {
      results.push({ row: rowNum, name: "(vazio)", status: "erro", message: "Coluna 'Produto' obrigatória" });
      continue;
    }
    if (!categoria) {
      results.push({ row: rowNum, name: nome, status: "erro", message: "Coluna 'Categoria' obrigatória" });
      continue;
    }
    if (isNaN(preco) || preco <= 0) {
      // Debug: mostra o valor bruto que encontrou
      const rawDebug = col(row, "Preco venda", "Preço venda", "Preço Venda", "preco venda", "preco", "Preço", "Valor venda");
      results.push({ row: rowNum, name: nome, status: "erro", message: `Preço inválido: "${rawDebug || "(vazio)"}"` });
      continue;
    }

    const categoryId = catMap[norm(categoria)];
    if (!categoryId) {
      results.push({ row: rowNum, name: nome, status: "erro", message: `Categoria "${categoria}" não encontrada` });
      continue;
    }

    const tamanhoRaw = col(row, "Tamanho", "tamanho", "tamanhos", "Tamanhos") || "PP,P,M,G,GG";
    const tamanhos = tamanhoRaw.split(",").map(s => s.trim()).filter(Boolean);
    const estoque = parseInt(col(row, "Qtd Estoque", "qtd estoque", "Estoque", "estoque", "quantidade").replace(",", "")) || 0;
    const descricao = col(row, "Descricao", "Descrição", "descricao", "Observacao");
    const imagem = col(row, "imagem", "Imagem", "foto", "Foto");

    let slug = slugify(nome);
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now()}`;

    try {
      await prisma.product.create({
        data: {
          name: nome,
          slug,
          description: descricao || null,
          price: preco,
          compareAt: null,
          images: JSON.stringify(imagem ? [imagem] : []),
          sizes: JSON.stringify(tamanhos),
          colors: JSON.stringify([]),
          stock: estoque,
          featured: false,
          active: true,
          categoryId,
        },
      });
      results.push({ row: rowNum, name: nome, status: "ok" });
    } catch (e: any) {
      results.push({ row: rowNum, name: nome, status: "erro", message: e.message?.slice(0, 80) });
    }
  }

  return NextResponse.json({ results });
}
