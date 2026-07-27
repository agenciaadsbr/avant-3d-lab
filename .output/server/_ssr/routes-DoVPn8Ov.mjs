import { a as __toESM } from "../_runtime.mjs";
import { t as motion } from "../_libs/framer-motion.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { a as Shield, c as Lightbulb, d as ChevronDown, f as CalendarDays, i as ShoppingBag, l as Flag, m as ArrowUp, n as Truck, o as MessageCircle, p as Award, r as Sparkles, s as MapPin, t as Utensils, u as Cog } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DoVPn8Ov.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var WA = "5551993196828";
var products = [
	{
		id: "diorama-kfc",
		name: "Diorama KFC",
		price: "R$ 59,90",
		waMsg: "Olá AVANT 3D LAB! Tenho interesse: *Diorama KFC* Quantidade: 1 Valor: R$ 59,90",
		Icon: Utensils
	},
	{
		id: "f1-garage-2026",
		name: "F1 Garage 2026",
		price: "R$ 29,90",
		waMsg: "Olá AVANT 3D LAB! Tenho interesse: *F1 Garage 2026* Quantidade: 1 Valor: R$ 29,90",
		Icon: Flag
	},
	{
		id: "f1-calendario-2026",
		name: "F1 Calendário 2026",
		price: "R$ 29,90",
		waMsg: "Olá AVANT 3D LAB! Tenho interesse: *F1 Calendário 2026* Quantidade: 1 Valor: R$ 29,90",
		Icon: CalendarDays
	},
	{
		id: "turbocharger",
		name: "Turbocharger",
		price: "R$ 29,90",
		waMsg: "Olá AVANT 3D LAB! Tenho interesse: *Turbocharger* Quantidade: 1 Valor: R$ 29,90",
		Icon: Cog
	},
	{
		id: "turbocharger-led",
		name: "Turbocharger LED",
		price: "R$ 29,90",
		waMsg: "Olá AVANT 3D LAB! Tenho interesse: *Turbocharger LED* Quantidade: 1 Valor: R$ 29,90",
		Icon: Lightbulb
	}
];
var waHref = (msg) => `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`;
var fadeUp = {
	hidden: {
		opacity: 0,
		y: 24
	},
	show: (i = 0) => ({
		opacity: 1,
		y: 0,
		transition: {
			duration: .6,
			delay: i * .1,
			ease: [
				.22,
				1,
				.36,
				1
			]
		}
	})
};
function Index() {
	const [scrolled, setScrolled] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const onScroll = () => setScrolled(window.scrollY > 100);
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);
	const scrollTo = (id) => {
		document.getElementById(id)?.scrollIntoView({
			behavior: "smooth",
			block: "start"
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen overflow-x-hidden bg-background font-sans text-foreground antialiased selection:bg-primary/40",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pointer-events-none fixed inset-0 -z-10 overflow-hidden",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/15 blur-[140px]" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute top-1/3 -right-40 h-[500px] w-[500px] rounded-full bg-brand-blue/10 blur-[140px]" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute bottom-0 -left-40 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[140px]" })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: `fixed inset-x-0 top-0 z-40 transition-all duration-300 ${scrolled ? "border-b border-white/10 bg-black/80 backdrop-blur-xl" : "border-b border-transparent"}`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex max-w-6xl items-center justify-between px-6 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => scrollTo("hero"),
						className: "flex items-center gap-2",
						"aria-label": "Ir ao topo",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-brand-blue shadow-[0_0_20px_-4px_var(--primary)]",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "h-4 w-4 text-white" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm font-bold tracking-wide",
							children: "AVANT 3D LAB"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => scrollTo("produtos"),
						className: "rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary transition hover:bg-primary/20",
						children: "Ver Produtos"
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				id: "hero",
				className: "relative flex min-h-screen flex-col items-center justify-center px-6 pt-24 pb-16 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
						initial: "hidden",
						animate: "show",
						variants: fadeUp,
						className: "mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-primary to-brand-blue shadow-[0_0_40px_-8px_var(--primary)]",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, {
							className: "h-8 w-8 text-white",
							strokeWidth: 2.2
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
						initial: "hidden",
						animate: "show",
						variants: fadeUp,
						custom: 1,
						className: "mt-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-xs font-medium text-white/70 backdrop-blur-xl",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-3.5 w-3.5 text-primary" }), "Impressão 3D de alta precisão"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.h1, {
						initial: "hidden",
						animate: "show",
						variants: fadeUp,
						custom: 2,
						className: "mt-6 text-4xl font-black tracking-tight sm:text-6xl md:text-7xl",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-gradient-brand",
							children: "AVANT 3D LAB"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.p, {
						initial: "hidden",
						animate: "show",
						variants: fadeUp,
						custom: 3,
						className: "mt-5 max-w-xl text-base text-white/70 sm:text-lg",
						children: "Miniaturas 3D Exclusivas"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.button, {
						initial: "hidden",
						animate: "show",
						variants: fadeUp,
						custom: 4,
						onClick: () => scrollTo("produtos"),
						className: "mt-10 inline-flex min-h-12 items-center gap-2 rounded-full bg-primary px-8 py-4 text-sm font-semibold text-primary-foreground shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all hover:scale-[1.03] hover:shadow-[0_0_35px_rgba(139,92,246,0.65)]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingBag, { className: "h-5 w-5" }), "Ver Produtos"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.button, {
						onClick: () => scrollTo("produtos"),
						"aria-label": "Rolar para produtos",
						initial: { opacity: 0 },
						animate: {
							opacity: 1,
							y: [
								0,
								8,
								0
							]
						},
						transition: {
							opacity: {
								delay: 1,
								duration: .6
							},
							y: {
								repeat: Infinity,
								duration: 1.8,
								ease: "easeInOut"
							}
						},
						className: "absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40 hover:text-white/70",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "h-6 w-6" })
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				id: "produtos",
				className: "px-6 py-24",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto max-w-6xl",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
						initial: "hidden",
						whileInView: "show",
						viewport: {
							once: true,
							amount: .4
						},
						variants: fadeUp,
						className: "mb-14 text-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
							className: "text-3xl font-bold sm:text-5xl",
							children: ["Nossa ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-gradient-brand",
								children: "Coleção"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-white/50",
							children: "Peças únicas impressas sob demanda"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3",
						children: products.map((p, i) => {
							const Icon = p.Icon;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.article, {
								initial: "hidden",
								whileInView: "show",
								viewport: {
									once: true,
									amount: .2
								},
								variants: fadeUp,
								custom: i,
								className: "group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:border-primary/40 hover:shadow-[0_0_30px_rgba(139,92,246,0.15)]",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "relative flex aspect-square items-center justify-center overflow-hidden bg-gradient-to-br from-purple-900/20 to-blue-900/20",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
										className: "h-24 w-24 text-white/80 transition-transform duration-500 group-hover:scale-110",
										strokeWidth: 1.4
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.5)_100%)]" })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-1 flex-col p-5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
											className: "text-lg font-semibold text-white",
											children: p.name
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 text-2xl font-bold text-brand-price",
											children: p.price
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
											href: waHref(p.waMsg),
											target: "_blank",
											rel: "noopener noreferrer",
											className: "mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-whatsapp px-4 py-4 text-sm font-semibold text-black transition-all hover:bg-brand-whatsapp-hover hover:shadow-[0_0_25px_rgba(37,211,102,0.35)]",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "h-5 w-5" }), "Pedir no WhatsApp"]
										})
									]
								})]
							}, p.id);
						})
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "px-6 py-24",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto max-w-5xl",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
						initial: "hidden",
						whileInView: "show",
						viewport: {
							once: true,
							amount: .4
						},
						variants: fadeUp,
						className: "mb-14 text-center",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
							className: "text-3xl font-bold sm:text-5xl",
							children: ["Como ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-gradient-brand",
								children: "Funciona"
							})]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative grid grid-cols-1 gap-8 md:grid-cols-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							"aria-hidden": true,
							className: "pointer-events-none absolute left-0 right-0 top-8 hidden md:block",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mx-auto h-px w-2/3 border-t border-dashed border-white/15" })
						}), [
							{
								icon: ShoppingBag,
								title: "Escolha sua Miniatura",
								desc: "Explore nossa coleção exclusiva e escolha sua favorita."
							},
							{
								icon: MessageCircle,
								title: "Fale Conosco no WhatsApp",
								desc: "Envie sua mensagem e confirme o pedido com nossa equipe."
							},
							{
								icon: Truck,
								title: "Receba em Casa",
								desc: "Produzimos sob demanda e enviamos para todo o Brasil."
							}
						].map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
							initial: "hidden",
							whileInView: "show",
							viewport: {
								once: true,
								amount: .3
							},
							variants: fadeUp,
							custom: i,
							className: "relative flex flex-col items-center rounded-2xl border border-white/[0.06] bg-white/[0.03] p-8 text-center backdrop-blur-xl transition-all duration-300 hover:border-primary/40 hover:shadow-[0_0_30px_rgba(139,92,246,0.15)]",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "relative mb-5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "grid h-16 w-16 place-items-center rounded-full border-2 border-primary/60 bg-background text-primary shadow-[0_0_20px_rgba(139,92,246,0.35)]",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(s.icon, { className: "h-6 w-6" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground",
										children: i + 1
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "text-lg font-semibold",
									children: s.title
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm text-white/60",
									children: s.desc
								})
							]
						}, s.title))]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "px-6 py-24",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto max-w-3xl",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
						initial: "hidden",
						whileInView: "show",
						viewport: {
							once: true,
							amount: .3
						},
						variants: fadeUp,
						className: "rounded-3xl border border-white/[0.06] bg-white/[0.03] p-10 text-center backdrop-blur-xl sm:p-14",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-primary to-brand-blue shadow-[0_0_30px_-6px_var(--primary)]",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "h-7 w-7 text-white" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
								className: "mt-6 text-3xl font-bold sm:text-4xl",
								children: ["Sobre a ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-gradient-brand",
									children: "AVANT 3D LAB"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-6 text-white/70 leading-relaxed",
								children: "Somos apaixonados por impressão 3D de alta qualidade. Cada miniatura é produzida com resina premium, calibrada para revelar detalhes finos. Do design ao pós-processamento manual, cuidamos de cada etapa para entregar peças exclusivas que você não encontra em nenhum outro lugar."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-8 flex flex-wrap justify-center gap-3",
								children: [
									{
										icon: Sparkles,
										label: "Impressão de Alta Precisão"
									},
									{
										icon: Award,
										label: "Acabamento Premium"
									},
									{
										icon: MapPin,
										label: "Envio para Todo Brasil"
									}
								].map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-xs font-medium text-white/80 backdrop-blur-xl",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(b.icon, { className: "h-3.5 w-3.5 text-primary" }), b.label]
								}, b.label))
							})
						]
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
				className: "border-t border-white/10 px-6 py-12",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex max-w-5xl flex-col items-center gap-6 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-brand-blue shadow-[0_0_20px_-4px_var(--primary)]",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "h-5 w-5 text-white" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-lg font-bold text-gradient-brand",
								children: "AVANT 3D LAB"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center justify-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
								href: `https://wa.me/${WA}`,
								target: "_blank",
								rel: "noopener noreferrer",
								className: "inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-5 py-2.5 text-sm font-medium text-brand-whatsapp backdrop-blur-xl transition-all hover:border-brand-whatsapp/60 hover:shadow-[0_0_20px_rgba(37,211,102,0.25)]",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "h-4 w-4" }), "WhatsApp"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
								href: "https://shopee.com.br",
								target: "_blank",
								rel: "noopener noreferrer",
								className: "inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-5 py-2.5 text-sm font-medium text-brand-price backdrop-blur-xl transition-all hover:border-brand-price/60 hover:shadow-[0_0_20px_rgba(249,115,22,0.25)]",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingBag, { className: "h-4 w-4" }), "Shopee"]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-white/40",
							children: "© 2026 AVANT 3D LAB. Todos os direitos reservados."
						})
					]
				})
			}),
			scrolled && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: () => window.scrollTo({
					top: 0,
					behavior: "smooth"
				}),
				"aria-label": "Voltar ao topo",
				className: "fixed bottom-6 right-6 z-40 grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground shadow-[0_0_25px_rgba(139,92,246,0.5)] transition-all hover:scale-110 hover:shadow-[0_0_40px_rgba(139,92,246,0.75)]",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUp, { className: "h-5 w-5" })
			})
		]
	});
}
//#endregion
export { Index as component };
