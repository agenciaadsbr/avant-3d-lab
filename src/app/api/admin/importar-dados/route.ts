export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function excelDateToJS(serial: number): Date {
  const utc_days = Math.floor(serial - 25569);
  return new Date(utc_days * 86400 * 1000);
}

function slugify(text: string): string {
  return text.toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const CATEGORY_MAP: Record<string, string> = {
  "SHORTS": "Shorts", "TOPS": "Tops", "MACAQUINHOS": "Macaquinhos",
  "LEGGINS": "Leggings", "LEGGINS ": "Leggings", "JAQUETAS": "Jaquetas",
  "CONJUNTOS": "Conjuntos", "CAMISETAS BÁSICAS": "Camisetas básicas",
  "Camisetas Básicas": "Camisetas básicas", "MACACÃO": "Macacão",
};

const SKU_PREFIX: Record<string, string> = {
  "Shorts": "SH", "Tops": "TP", "Macaquinhos": "MQ",
  "Leggings": "LG", "Jaquetas": "JQ", "Conjuntos": "CF",
  "Camisetas básicas": "CB", "Macacão": "MC", "Vendas Manuais": "VM",
};

const PRODUCTS_DATA = [
  { name: "Bermuda Bicolor Marrom", size: "ÚNICO", cat: "SHORTS", qty: 1, cost: 42.5, price: 79, supplier: "LISS FITNESS", supplierCode: null },
  { name: "Top Vermelho promo", size: "ÚNICO", cat: "TOPS", qty: 1, cost: 25, price: 59, supplier: "LISS FITNESS", supplierCode: null },
  { name: "Short Vermelho promo", size: "ÚNICO", cat: "SHORTS", qty: 1, cost: 25, price: 59, supplier: "LISS FITNESS", supplierCode: null },
  { name: "Bermuda Vermelha", size: "ÚNICO", cat: "SHORTS", qty: 1, cost: 40, price: 79, supplier: "LISS FITNESS", supplierCode: null },
  { name: "Top Slim Preto", size: "ÚNICO", cat: "TOPS", qty: 1, cost: 26, price: 50, supplier: "LISS FITNESS", supplierCode: null },
  { name: "Macaquinho Fabi Bicolor", size: "ÚNICO", cat: "MACAQUINHOS", qty: 1, cost: 95, price: 129, supplier: "LISS FITNESS", supplierCode: null },
  { name: "Bermuda rosa claro", size: "ÚNICO", cat: "SHORTS", qty: 1, cost: 25, price: 69, supplier: "LISS FITNESS", supplierCode: null },
  { name: "Top rosa claro", size: "ÚNICO", cat: "TOPS", qty: 1, cost: 25, price: 59, supplier: "LISS FITNESS", supplierCode: null },
  { name: "Bermuda bege", size: "ÚNICO", cat: "SHORTS", qty: 1, cost: 25, price: 69, supplier: "LISS FITNESS", supplierCode: null },
  { name: "Top bege", size: "ÚNICO", cat: "TOPS", qty: 1, cost: 25, price: 59, supplier: "LISS FITNESS", supplierCode: null },
  { name: "Legging Rosa", size: "ÚNICO", cat: "LEGGINS", qty: 1, cost: 37.5, price: 89, supplier: "LISS FITNESS", supplierCode: null },
  { name: "Top Rosa", size: "ÚNICO", cat: "TOPS", qty: 1, cost: 37.5, price: 69, supplier: "LISS FITNESS", supplierCode: null },
  { name: "Top preto Aline", size: "ÚNICO", cat: "TOPS", qty: 1, cost: 37.5, price: 69, supplier: "LISS FITNESS", supplierCode: null },
  { name: "Top marrom plus", size: "ÚNICO", cat: "TOPS", qty: 1, cost: 45, price: 90, supplier: "LISS FITNESS", supplierCode: null },
  { name: "Bermuda marrom plus", size: "GG", cat: "SHORTS", qty: 1, cost: 45, price: 90, supplier: "LISS FITNESS", supplierCode: null },
  { name: "Macaquinho Agatha Rosa", size: "ÚNICO", cat: "MACAQUINHOS", qty: 1, cost: 80, price: 149, supplier: "LISS FITNESS", supplierCode: null },
  { name: "Short Roxo Bicolor", size: "ÚNICO", cat: "SHORTS", qty: 1, cost: 25, price: 69, supplier: "LISS FITNESS", supplierCode: null },
  { name: "Top Roxo Bicolor", size: "ÚNICO", cat: "TOPS", qty: 1, cost: 25, price: 59, supplier: "LISS FITNESS", supplierCode: null },
  { name: "Top Preto Cintia", size: "ÚNICO", cat: "TOPS", qty: 1, cost: 37.5, price: 69, supplier: "LISS FITNESS", supplierCode: null },
  { name: "Casaco Icebraker marrom", size: "P/M", cat: "JAQUETAS", qty: 1, cost: 150, price: 299, supplier: "MISS BLESSED", supplierCode: null },
  { name: "Casaco slim curto Cinza", size: "P/M", cat: "JAQUETAS", qty: 1, cost: 60, price: 149, supplier: "MISS BLESSED", supplierCode: null },
  { name: "Macaquinho costa nua preto", size: "P/M", cat: "MACAQUINHOS", qty: 1, cost: 70, price: 140, supplier: "MISS BLESSED", supplierCode: null },
  { name: "Leggin Cinza fit stream listra", size: "P/M", cat: "LEGGINS", qty: 1, cost: 40, price: 90, supplier: "MISS BLESSED", supplierCode: null },
  { name: "Leggin Preto fit stream listra", size: "P/M", cat: "LEGGINS", qty: 1, cost: 40, price: 90, supplier: "MISS BLESSED", supplierCode: null },
  { name: "Macaquinho Bordô canelado C/Ziper", size: "P/M", cat: "MACAQUINHOS", qty: 1, cost: 50, price: 140, supplier: "MISS BLESSED", supplierCode: null },
  { name: "Macaquinho Marrom Canelado Aberto", size: "G/GG", cat: "MACAQUINHOS", qty: 1, cost: 50, price: 140, supplier: "MISS BLESSED", supplierCode: null },
  { name: "Macaquinho Zíper Bordô", size: "P/M", cat: "MACAQUINHOS", qty: 1, cost: 50, price: 140, supplier: "MISS BLESSED", supplierCode: null },
  { name: "Calça Cozy balance", size: "G/GG", cat: "CONJUNTOS", qty: 1, cost: 60, price: 109, supplier: "MISS BLESSED", supplierCode: null },
  { name: "Conjunto Flare Cropped Cinza", size: "ÚNICO", cat: "CONJUNTOS", qty: 1, cost: 105, price: 199, supplier: null, supplierCode: null },
  { name: "Conjunto Flare betina Nude", size: "ÚNICO", cat: "CONJUNTOS", qty: 1, cost: 105, price: 199, supplier: "BF FITNESS", supplierCode: null },
  { name: "Jaqueta Duo Preto M", size: "M", cat: "JAQUETAS", qty: 1, cost: 120, price: 299, supplier: "BF FITNESS", supplierCode: "HJ-28-183" },
  { name: "Jaqueta Duo Preto G", size: "G", cat: "JAQUETAS", qty: 1, cost: 120, price: 299, supplier: "MISS BLESSED", supplierCode: "HJ-28-183" },
  { name: "Calça Legging Elite Fit 2.0 Preto GG", size: "G/GG", cat: "LEGGINS", qty: 1, cost: 45, price: 109, supplier: "MISS BLESSED", supplierCode: "MN-2541" },
  { name: "Calça Elite Prime 2.0 Marrom", size: "P/M", cat: "LEGGINS", qty: 1, cost: 45, price: 109.9, supplier: "MISS BLESSED", supplierCode: "A-116" },
  { name: "Calça Elite Prime 2.0 Verde", size: "P/M", cat: "LEGGINS", qty: 1, cost: 45, price: 109.9, supplier: "MISS BLESSED", supplierCode: "A-116" },
  { name: "Calça Elite Prime 2.0 Preto", size: "G/GG", cat: "LEGGINS", qty: 1, cost: 45, price: 109.9, supplier: "MISS BLESSED", supplierCode: "A-116" },
  { name: "Camiseta Manga Longa Basic Azul Marinho PM", size: "P/M", cat: "Camisetas Básicas", qty: 2, cost: 50, price: 99.9, supplier: "MISS BLESSED", supplierCode: "K-836" },
  { name: "Camiseta Manga Longa Basic Azul Bebê", size: "P/M", cat: "Camisetas Básicas", qty: 1, cost: 50, price: 99.9, supplier: "MISS BLESSED", supplierCode: "K-836" },
  { name: "Camiseta Manga Longa Basic Cinza", size: "G/GG", cat: "Camisetas Básicas", qty: 2, cost: 50, price: 99.9, supplier: "MISS BLESSED", supplierCode: "K-836" },
  { name: "Camiseta Manga Longa Basic Azul Marinho GG", size: "G/GG", cat: "Camisetas Básicas", qty: 1, cost: 50, price: 99.9, supplier: "MISS BLESSED", supplierCode: "K-836" },
  { name: "Top Hype Preto", size: "G/GG", cat: "TOPS", qty: 1, cost: 40, price: 99.9, supplier: "MISS BLESSED", supplierCode: "MN-2587" },
  { name: "Top Shape Branco", size: "G/GG", cat: "TOPS", qty: 1, cost: 45, price: 99.9, supplier: "MISS BLESSED", supplierCode: "MN-2551" },
  { name: "Jaqueta Hype Fit 2.0 Preto", size: "P/M", cat: "JAQUETAS", qty: 2, cost: 60, price: 149, supplier: "MISS BLESSED", supplierCode: "WT-333" },
  { name: "Jaqueta Hype Fit 2.0 Of-White", size: "P/M", cat: "JAQUETAS", qty: 2, cost: 60, price: 149, supplier: "MISS BLESSED", supplierCode: "WT-333" },
  { name: "Conjunto Legging Urban Sculpt Rosa", size: "G/GG", cat: "CONJUNTOS", qty: 1, cost: 60, price: 139, supplier: "MISS BLESSED", supplierCode: "MN-9307" },
  { name: "Jaqueta Urban Azul Marinho", size: "P/M", cat: "JAQUETAS", qty: 1, cost: 70, price: 149, supplier: "MISS BLESSED", supplierCode: "MN-2558" },
  { name: "Macacão Fit Princess Lilás", size: "P/M", cat: "MACACÃO", qty: 1, cost: 70, price: 159.9, supplier: "MISS BLESSED", supplierCode: "L-658" },
  { name: "Zip Back Sculpt Vinho", size: "P/M", cat: "MACACÃO", qty: 1, cost: 70, price: 149.9, supplier: "MISS BLESSED", supplierCode: "L-653" },
  { name: "Zip Back Sculpt Preto", size: "P/M", cat: "MACACÃO", qty: 1, cost: 70, price: 149, supplier: "MISS BLESSED", supplierCode: "L-653" },
  { name: "Conj Clássico top TATI PRETO", size: "ÚNICO", cat: "CONJUNTOS", qty: 3, cost: 89.9, price: 159.9, supplier: "LISS FITNESS", supplierCode: null },
  { name: "Conj Clássico top TATI BRANCO", size: "ÚNICO", cat: "CONJUNTOS", qty: 1, cost: 89.9, price: 159.9, supplier: "LISS FITNESS", supplierCode: null },
  { name: "Conj Clássico top TATI AZUL", size: "ÚNICO", cat: "CONJUNTOS", qty: 1, cost: 89.9, price: 159.9, supplier: "LISS FITNESS", supplierCode: null },
  { name: "Conj Clássico top TATI BORDÔ", size: "ÚNICO", cat: "CONJUNTOS", qty: 1, cost: 89.9, price: 159.9, supplier: "LISS FITNESS", supplierCode: null },
  { name: "Conj Clássico top TATI MARROM", size: "ÚNICO", cat: "CONJUNTOS", qty: 1, cost: 89.9, price: 159.9, supplier: "LISS FITNESS", supplierCode: null },
];

const EXPENSES_DATA = [
  { date: 46163, desc: "Espelho de Chão", supplier: "MERCADO LIVRE", method: "cartao", cat: "outros", value: 137, fatura: "JUL" },
  { date: 46174, desc: "Arara de roupa de madeira", supplier: "MERCADO LIVRE", method: "cartao", cat: "outros", value: 104.9, fatura: "JUL/AGO" },
  { date: 46178, desc: "Vaso Cesto para decorar", supplier: "MERCADO LIVRE", method: "cartao", cat: "outros", value: 55.46, fatura: "JUL" },
  { date: 46175, desc: "Tapete redondo", supplier: "MERCADO LIVRE", method: "cartao", cat: "outros", value: 89.68, fatura: "JUL" },
  { date: 46180, desc: "Letreiro Luminoso", supplier: "MERCADO LIVRE", method: "cartao", cat: "marketing", value: 78.9, fatura: "JUL" },
  { date: 46178, desc: "Fita de Led", supplier: "MERCADO LIVRE", method: "cartao", cat: "outros", value: 37.34, fatura: "JUL" },
  { date: 46180, desc: "Papel Seda", supplier: "MERCADO LIVRE", method: "cartao", cat: "outros", value: 25.9, fatura: "JUL" },
  { date: 46180, desc: "Fonte para Led", supplier: "MERCADO LIVRE", method: "cartao", cat: "outros", value: 19, fatura: "JUL" },
  { date: 46180, desc: "Lacres Roupas", supplier: "MERCADO LIVRE", method: "cartao", cat: "outros", value: 26.97, fatura: "JUL" },
  { date: 46178, desc: "Etiquetas para Roupas", supplier: "MERCADO LIVRE", method: "cartao", cat: "outros", value: 112.42, fatura: "JUL" },
  { date: 46178, desc: "Pedido Liss Fitness", supplier: "LISS FITNESS", method: "pix", cat: "outros", value: 757.93, fatura: null },
  { date: 46178, desc: "Pedido Miss Blessed", supplier: "MISS BLESSED", method: "pix", cat: "outros", value: 2194.19, fatura: null },
  { date: 46183, desc: "Pedido Liss Fitness", supplier: "LISS FITNESS", method: "pix", cat: "outros", value: 650.93, fatura: null },
  { date: 46187, desc: "Pedido Liss Fitness", supplier: "LISS FITNESS", method: "pix", cat: "outros", value: 729.84, fatura: null },
  { date: 46191, desc: "Pedido Miss Blessed", supplier: "MISS BLESSED", method: "pix", cat: "outros", value: 1502.92, fatura: null },
  { date: 46193, desc: "Pedido Boneca de Ferro", supplier: "BONECA DE FERRO", method: "pix", cat: "outros", value: 435, fatura: null },
];

const SALES_DATA = [
  { date: 46086, client: "Eduarda Yago", product: "top", total: 50, method: "pix", status: "paid", received: 50, balance: 0 },
  { date: 46086, client: "Ingrid Bandeira", product: "Conjunto azul", total: 99, method: "pix", status: "paid", received: 99, balance: 0 },
  { date: 46086, client: "Gabriela Becker", product: "Macaquinho", total: 129, method: "pix", status: "paid", received: 129, balance: 0 },
  { date: 46086, client: "Gabriela Becker", product: "Macaquinho", total: 129, method: "pix", status: "paid", received: 129, balance: 0 },
  { date: 46086, client: "Ingrid Bandeira", product: "Macaquinho", total: 129, method: "pix", status: "paid", received: 129, balance: 0 },
  { date: 46096, client: "Daniela Faszank", product: "Short Rosa", total: 40, method: "pix", status: "paid", received: 40, balance: 0 },
  { date: 46096, client: "Daniela Faszank", product: "Conjunto Cinza", total: 95, method: "pix", status: "paid", received: 95, balance: 0 },
  { date: 46096, client: "Daniela Faszank", product: "Conjunto Verde", total: 95, method: "pix", status: "paid", received: 95, balance: 0 },
  { date: 46096, client: "Daniela Faszank", product: "Top Bicolor", total: 45, method: "pix", status: "paid", received: 45, balance: 0 },
  { date: 46096, client: "Daniela Faszank", product: "Top alça única Marrom", total: 40, method: "pix", status: "paid", received: 40, balance: 0 },
  { date: 46096, client: "Daniela Faszank", product: "Conjunto Branco/Preto", total: 150, method: "pix", status: "paid", received: 150, balance: 0 },
  { date: 46097, client: "Ingrid Bandeira", product: "Macaquinho", total: 130, method: "pix", status: "paid", received: 130, balance: 0 },
  { date: 46097, client: "Stefani Biviaschi", product: "Conjunto", total: 95, method: "pix", status: "paid", received: 95, balance: 0 },
  { date: 46097, client: "Ingrid Bandeira", product: "Top", total: 50, method: "pix", status: "paid", received: 50, balance: 0 },
  { date: 46097, client: "Franciele Nunes", product: "Short", total: 50, method: "pix", status: "paid", received: 50, balance: 0 },
  { date: 46097, client: "Eliana Borges", product: "Tops", total: 50, method: "pix", status: "paid", received: 50, balance: 0 },
  { date: 46098, client: "Eliana Borges", product: "Tops", total: 50, method: "pix", status: "paid", received: 50, balance: 0 },
  { date: 46097, client: "Aline Coach", product: "Conjunto", total: 99, method: "pix", status: "paid", received: 99, balance: 0 },
  { date: 46101, client: "Eduarda Yago", product: "Short", total: 50, method: "pix", status: "paid", received: 50, balance: 0 },
  { date: 46112, client: "Mari Feijó", product: "Short Marrom", total: 50, method: "pix", status: "paid", received: 50, balance: 0 },
  { date: 46112, client: "Mari Feijó", product: "Top costas nuas marrom", total: 50, method: "pix", status: "paid", received: 50, balance: 0 },
  { date: 46118, client: "Daniela Faszank", product: "Short Marrom", total: 50, method: "pix", status: "paid", received: 50, balance: 0 },
  { date: 46118, client: "Daniela Faszank", product: "Top tiras marrom", total: 50, method: "pix", status: "paid", received: 50, balance: 0 },
  { date: 46119, client: "Gabriela Osório", product: "Conj. Aline Leg", total: 139, method: "pix", status: "paid", received: 139, balance: 0 },
  { date: 46119, client: "Daniela Faszank", product: "Conj bicolor café", total: 99, method: "pix", status: "paid", received: 99, balance: 0 },
  { date: 46119, client: "Denise Jorge", product: "Leg Cintia Plus", total: 95, method: "pix", status: "paid", received: 95, balance: 0 },
  { date: 46119, client: "Denise Jorge", product: "Conj. Lorena Plus", total: 189, method: "pix", status: "paid", received: 189, balance: 0 },
  { date: 46119, client: "Denise Jorge", product: "Macaquinho Plus", total: 189, method: "pix", status: "paid", received: 189, balance: 0 },
  { date: 46126, client: "Fernanda", product: "Macacão Luna Bicolor Bege", total: 199, method: "pix", status: "paid", received: 199, balance: 0 },
  { date: 46126, client: "Fernanda", product: "Macacão Amanda marrom", total: 179, method: "pix", status: "paid", received: 179, balance: 0 },
  { date: 46126, client: "Fernanda", product: "Macaquinho Rosa", total: 149, method: "pix", status: "paid", received: 149, balance: 0 },
  { date: 46126, client: "Fernanda", product: "Conj. Promoção Uva", total: 99, method: "pix", status: "paid", received: 99, balance: 0 },
  { date: 46126, client: "Fernanda", product: "Macaquinho Fabi Bicolor", total: 129, method: "pix", status: "paid", received: 129, balance: 0 },
  { date: 46126, client: "Daniela Faszank", product: "Macaquinho Areia", total: 99, method: "pix", status: "paid", received: 99, balance: 0 },
  { date: 46126, client: "Daniela Faszank", product: "Macaquinho Fabi Bicolor", total: 129, method: "pix", status: "paid", received: 129, balance: 0 },
  { date: 46126, client: "Jéssica Rodzinski", product: "Macaquinho Fabi Bicolor AZUL", total: 129, method: "pix", status: "paid", received: 129, balance: 0 },
  { date: 46135, client: "Mari Feijó", product: "Conj. Promoção Amarelo", total: 99, method: "pix", status: "paid", received: 99, balance: 0 },
  { date: 46138, client: "Gabriela Becker", product: "Macaquinho Fabi Bicolor marrom", total: 129, method: "pix", status: "paid", received: 129, balance: 0 },
  { date: 46138, client: "Franciele Nunes", product: "Top Cintia Plus", total: 90, method: "pix", status: "paid", received: 90, balance: 0 },
  { date: 46138, client: "Presente / Sem cadastro", product: "Macaquinho Fabi MARINHO", total: 129, method: "pix", status: "paid", received: 129, balance: 0 },
  { date: 46138, client: "Heidy", product: "Macacão Amanda Compressão Preto", total: 179, method: "pix", status: "paid", received: 179, balance: 0 },
  { date: 46144, client: "Ingrid Bandeira", product: "Legging Preta", total: 89, method: "pix", status: "paid", received: 89, balance: 0 },
  { date: 46145, client: "Ingrid Bandeira", product: "Top Uills preto", total: 59, method: "pix", status: "paid", received: 59, balance: 0 },
  // Daniela Faszank linhas 48-51: 1 pedido com desconto, total 400
  { date: 46149, client: "Daniela Faszank", product: "Macaquinho Cinza c/Rosa + Top Side + Macacão Amanda + Legging Preta", total: 400, method: "pix", status: "paid", received: 400, balance: 0, notes: "Pedido com 4 itens (437 - desconto 37 = 400)" },
  { date: 46158, client: "Fernanda Brusque", product: "Conj Fernanda Laranja", total: 179, method: "pix", status: "paid", received: 179, balance: 0 },
  { date: 46158, client: "Fernanda Brusque", product: "Conj Fernanda Azul", total: 179, method: "pix", status: "paid", received: 179, balance: 0 },
  { date: 46156, client: "Eduarda Vargas", product: "Conj Aline Vermelho", total: 149, method: "pix", status: "paid", received: 149, balance: 0 },
  { date: 46156, client: "Eduarda Vargas", product: "Conj turquesa", total: 149, method: "pix", status: "paid", received: 149, balance: 0 },
  { date: 46160, client: "Franciele Nunes", product: "Macacão Flare Azul", total: 199, method: "pix", status: "partial", received: 99.5, balance: 99.5 },
  { date: 46162, client: "Débora Brasil", product: "Macacão Flare Bege", total: 199, method: "pix", status: "partial", received: 100, balance: 99 },
  { date: 46162, client: "Luiza Costa", product: "Macacão Flare Cinza", total: 199, method: "pix", status: "paid", received: 199, balance: 0 },
  { date: 46162, client: "Eduarda Vargas", product: "Macacão Flare Verde", total: 199, method: "pix", status: "paid", received: 199, balance: 0 },
  { date: 46162, client: "Jo Borin", product: "Conj legg e top Jasmin ROSE", total: 170, method: "pix", status: "partial", received: 100, balance: 70 },
  { date: 46172, client: "Eduarda Yago", product: "Conj shorts duplo ziper e top BEGE", total: 160, method: "pix", status: "partial", received: 80, balance: 80 },
  { date: 46172, client: "Fran Pablo", product: "Casaco Slim C/ capuz Verde", total: 149, method: "pix", status: "paid", received: 149, balance: 0 },
  { date: 46172, client: "Fran Pablo", product: "Conjunto Marrom Top grande", total: 170, method: "pix", status: "paid", received: 170, balance: 0 },
  { date: 46172, client: "Jade Rodrigues", product: "Conjunto Flare Marrom", total: 199, method: "pix", status: "paid", received: 199, balance: 0 },
  { date: 46172, client: "Jade Rodrigues", product: "Casaco Slim Longo Preto P/M", total: 149, method: "pix", status: "paid", received: 149, balance: 0 },
  { date: 46172, client: "Jade Rodrigues", product: "Conjunto Shorts Preto+Top", total: 100, method: "pix", status: "paid", received: 100, balance: 0 },
  { date: 46172, client: "Luiza Costa", product: "Casaco Plush Off white", total: 299, method: "pix", status: "paid", received: 299, balance: 0 },
  { date: 46172, client: "Luiza Costa", product: "Casaco slim curto Marrom", total: 149, method: "pix", status: "paid", received: 149, balance: 0 },
  { date: 46172, client: "Virginia", product: "Conj reverse cut Preto", total: 119, method: "pix", status: "paid", received: 119, balance: 0 },
  { date: 46172, client: "Virginia", product: "Casaquinho", total: 149, method: "pix", status: "paid", received: 149, balance: 0 },
  { date: 46172, client: "Daniela Faszank", product: "Casaco Slim curto Preto", total: 149, method: "caderno", status: "pending", received: 0, balance: 149 },
  { date: 46172, client: "Daniela Faszank", product: "Macacão Open Back Azul", total: 150, method: "caderno", status: "pending", received: 0, balance: 150 },
  { date: 46172, client: "Daniela Faszank", product: "Macaquinho Preto Canelado", total: 100, method: "caderno", status: "pending", received: 0, balance: 100 },
  { date: 46172, client: "Camila", product: "Macacão Rib fit canelado Azul", total: 140, method: "pix", status: "paid", received: 140, balance: 0 },
  { date: 46172, client: "Camila", product: "Conj Rosa Canelado", total: 120, method: "pix", status: "paid", received: 120, balance: 0 },
  { date: 46179, client: "Karen RH", product: "Casaco Slim longo Branco", total: 149, method: "pix", status: "paid", received: 149, balance: 0 },
  { date: 46179, client: "Karen RH", product: "Casaco Slim longo Cinza", total: 149, method: "pix", status: "paid", received: 149, balance: 0 },
  { date: 46179, client: "Karen RH", product: "Top Tela Poliamida Cinza", total: 75, method: "pix", status: "paid", received: 75, balance: 0 },
  { date: 46179, client: "Julia Heffner", product: "Casaco Slim curto Azul", total: 149, method: "link", status: "paid", received: 141.58, balance: 0, notes: "Venda por link de pagamento - taxa descontada" },
  { date: 46184, client: "Fernanda Brusque", product: "Conjunto Flare Zara Azul", total: 199, method: "caderno", status: "pending", received: 0, balance: 199, notes: "vai pagar em 2x" },
  { date: 46184, client: "Fernanda Brusque", product: "Conjunto Flare Zara Verde", total: 199, method: "caderno", status: "pending", received: 0, balance: 199 },
  { date: 46184, client: "Fernanda Brusque", product: "Conjunto Flare Zara Nude", total: 199, method: "caderno", status: "pending", received: 0, balance: 199 },
  { date: 46188, client: "Débora Brasil", product: "Conjunto Flare Verde", total: 199, method: "caderno", status: "pending", received: 0, balance: 199, notes: "vai pagar em 2x - vai pagar 200 dia 05/07" },
  { date: 46190, client: "Stephanie Daitx", product: "Legging Poliamida Cinza", total: 110, method: "pix", status: "paid", received: 110, balance: 0 },
  { date: 46190, client: "Stephanie Daitx", product: "Jaqueta Jessi", total: 149, method: "pix", status: "paid", received: 149, balance: 0 },
  { date: 46190, client: "Luciana", product: "Macacão Open Back Verde militar", total: 75, method: "pix", status: "paid", received: 75, balance: 0 },
  { date: 46190, client: "Luciana", product: "Calça Legging Elite Fit 2.0 Off white", total: 109, method: "pix", status: "paid", received: 109, balance: 0 },
  { date: 46190, client: "Helen", product: "Conjunto Flare Azul", total: 189, method: "link", status: "paid", received: 189, balance: 0 },
  { date: 46190, client: "Francine Pablo", product: "Macacão Open Back Bordô", total: 150, method: "caderno", status: "partial", received: 0, balance: 150 },
  { date: 46190, client: "Gabriela Becker", product: "Zip Back Sculpt Preto", total: 150, method: "caderno", status: "partial", received: 75, balance: 75 },
  { date: 46191, client: "Maria Eduarda Pereira", product: "Calça Legging Elite Fit 2.0 Preto", total: 119, method: "pix", status: "paid", received: 119, balance: 0 },
  { date: 46191, client: "Mari Feijó", product: "Calça Elite Prime 2.0 Preto", total: 109, method: "pix", status: "paid", received: 109, balance: 0 },
  { date: 46191, client: "Denise Jorge", product: "Jaqueta Cozy Balance", total: 120, method: "pix", status: "pending", received: 0, balance: 120, notes: "PENDENTE DE CONFIRMAÇÃO" },
  { date: 46191, client: "Denise Jorge", product: "Jaqueta Duo Preta G", total: 299, method: "pix", status: "pending", received: 0, balance: 299, notes: "PENDENTE DE CONFIRMAÇÃO" },
  { date: 46191, client: "Thame Melo", product: "Legging bolso faca", total: 100, method: "pix", status: "pending", received: 0, balance: 100, notes: "PENDENTE DE CONFIRMAÇÃO" },
  { date: 46191, client: "Thame Melo", product: "Macaquinho Zíper Preto", total: 140, method: "pix", status: "pending", received: 0, balance: 140, notes: "PENDENTE DE CONFIRMAÇÃO" },
];

export async function POST(req: Request) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin")
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const results = { products: 0, expenses: 0, sales: 0, clients: 0, errors: [] as string[] };

  try {
    // ── 1. CATEGORIAS ──
    const catNames = [...new Set(PRODUCTS_DATA.map(p => CATEGORY_MAP[p.cat] || p.cat))];
    for (const name of catNames) {
      const slug = slugify(name);
      await prisma.category.upsert({
        where: { slug },
        update: {},
        create: { name, slug },
      });
    }

    // ── 2. FORNECEDOR "Venda Manual" ──
    await prisma.product.upsert({
      where: { slug: "venda-manual" },
      update: {},
      create: {
        name: "Venda Manual", slug: "venda-manual", price: 0, stock: 999, active: false,
        category: { connect: { slug: slugify(catNames[0]) } },
      },
    });

    // ── 3. PRODUTOS ──
    let skuCounter = 1;
    for (const p of PRODUCTS_DATA) {
      const catName = CATEGORY_MAP[p.cat] || p.cat;
      const prefix = SKU_PREFIX[catName] || "XX";
      const sku = `${prefix}${String(skuCounter).padStart(3, "0")}`;
      skuCounter++;

      const slug = slugify(`${p.name}-${p.size}`);
      const sizes = p.size && p.size !== "ÚNICO" ? JSON.stringify([p.size]) : JSON.stringify([]);

      try {
        await prisma.product.upsert({
          where: { slug },
          update: {
            price: p.price, costPrice: p.cost, stock: p.qty,
            sizes, active: true, sku, supplierCode: p.supplierCode,
          },
          create: {
            name: p.name, slug, price: p.price, costPrice: p.cost,
            stock: p.qty, sizes, active: true, sku, supplierCode: p.supplierCode,
            category: { connect: { slug: slugify(catName) } },
          },
        });
        results.products++;
      } catch (e: any) {
        results.errors.push(`Produto "${p.name}": ${e.message}`);
      }
    }

    // ── 4. GASTOS ──
    for (const e of EXPENSES_DATA) {
      const date = excelDateToJS(e.date);
      const notes = e.fatura ? `Fatura cartão: ${e.fatura}` : undefined;

      let supplier = null;
      if (e.supplier) {
        supplier = await prisma.supplier.upsert({
          where: { name: e.supplier },
          update: {},
          create: { name: e.supplier },
        });
      }

      await prisma.expense.create({
        data: {
          date, description: e.desc,
          amount: e.value, category: e.cat,
          paymentMethod: e.method,
          supplierId: supplier?.id || null,
          notes: notes || null,
        },
      });
      results.expenses++;
    }

    // ── 5. VENDAS ──
    const vendaManual = await prisma.product.findFirst({ where: { name: "Venda Manual" } });

    for (const s of SALES_DATA) {
      const date = excelDateToJS(s.date);

      // Buscar ou criar cliente
      let clientName = s.client.trim();
      let user = await prisma.user.findFirst({
        where: { name: { equals: clientName, mode: "insensitive" }, role: "customer" },
      });

      if (!user) {
        const email = `${slugify(clientName)}.${Date.now()}@cliente.accessfit.com.br`;
        user = await prisma.user.create({
          data: { name: clientName, email, role: "customer" },
        });
        results.clients++;
      }

      const payStatus = s.status === "paid" ? "paid" : s.status === "partial" ? "partial" : "pending";

      await prisma.order.create({
        data: {
          userId: user.id,
          status: "delivered",
          paymentMethod: s.method,
          paymentStatus: payStatus,
          amountPaid: s.received || 0,
          total: s.total,
          subtotal: s.total,
          shipping: 0,
          discount: 0,
          notes: (s as any).notes || null,
          createdAt: date,
          installmentCount: 1,
          items: {
            create: [{
              productId: vendaManual!.id,
              quantity: 1,
              price: s.total,
              size: s.product,
            }],
          },
        },
      });
      results.sales++;
    }

    return NextResponse.json({ ok: true, ...results });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, results }, { status: 500 });
  }
}
