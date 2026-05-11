import { useEffect, useState } from "react"
import Layout from "@/layouts/layout"
import { TopBar } from "@/layouts/topbar"
import { API } from "@/utils/apiCall"
import type { Product } from "@/types/product"
import CreateMovement from "@/components/modals/usecases/createMovement"

// ─── Severidad ────────────────────────────────────────────────────────────────

type Severity = "empty" | "critical" | "low"
type Filter = "all" | Severity

const getSeverity = (stock: number, minStock: number): Severity => {
	if (stock === 0) return "empty"
	if (stock / minStock < 0.25) return "critical"
	return "low"
}

// ─── Mini barra de nivel ──────────────────────────────────────────────────────

const StockLevelBar = ({ stock, minStock }: { stock: number; minStock: number }) => {
	const pct = Math.min(Math.round((stock / minStock) * 100), 100)
	const color = pct < 25 ? "var(--color-exit)" : "var(--color-alert)"

	if (stock === 0) {
		return <span className="badge badge-exit" style={{ fontSize: 10 }}>Sin stock</span>
	}

	return (
		<div style={{ display: "flex", alignItems: "center", gap: 6 }}>
			<div style={{
				display: "inline-block",
				width: 48,
				height: 4,
				borderRadius: 2,
				background: "var(--color-bg-muted)",
				position: "relative",
				overflow: "hidden",
			}}>
				<div style={{
					position: "absolute",
					left: 0,
					top: 0,
					height: "100%",
					width: `${pct}%`,
					borderRadius: 2,
					background: color,
				}} />
			</div>
			<span style={{ fontSize: 10, color: "var(--color-alert-dark)" }}>{pct}%</span>
		</div>
	)
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const RowSkeleton = () => (
	<tr>
		{Array.from({ length: 7 }).map((_, i) => (
			<td key={i} style={{ padding: "10px" }}>
				<div className="skeleton" style={{ height: 12, borderRadius: 4, width: i === 1 ? "80%" : "60%" }} />
			</td>
		))}
	</tr>
)

// ─── Página ───────────────────────────────────────────────────────────────────

type LoadState = "loading" | "error" | "ok"

const Alerts = () => {
	const [products, setProducts] = useState<Product[]>([])
	const [loadState, setLoadState] = useState<LoadState>("loading")
	const [filter, setFilter] = useState<Filter>("all")
	const [movementTarget, setMovementTarget] = useState<Product | null>(null)

	const fetchAlerts = () => {
		setLoadState("loading")
		fetch(API("products/alerts"))
			.then((r) => {
				if (!r.ok) throw new Error()
				return r.json()
			})
			.then((data: Product[]) => {
				const sorted = [...data].sort(
					(a, b) => (a.stock - a.minStock) - (b.stock - b.minStock)
				)
				setProducts(sorted)
				setLoadState("ok")
			})
			.catch(() => setLoadState("error"))
	}

	useEffect(() => { fetchAlerts() }, [])

	// ─── Métricas ──────────────────────────────────────────────────────────────

	const empty = products.filter((p) => p.stock === 0)
	const critical = products.filter((p) => p.stock > 0 && getSeverity(p.stock, p.minStock) === "critical")
	const low = products.filter((p) => getSeverity(p.stock, p.minStock) === "low")

	const visible = filter === "all"
		? products
		: products.filter((p) => getSeverity(p.stock, p.minStock) === filter)

	// ─── Topbar ────────────────────────────────────────────────────────────────

	const topbar = (
		<TopBar.Title
			text="Alertas de stock"
			description={
				loadState === "ok"
					? `${products.length} producto${products.length !== 1 ? "s" : ""} ${products.length !== 1 ? "requieren" : "requiere"} atención`
					: "Productos por debajo del stock mínimo"
			}
		/>
	)

	// ─── Loading ───────────────────────────────────────────────────────────────

	if (loadState === "loading") {
		return (
			<Layout topbar={topbar}>
				<div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8, marginBottom: "1.25rem" }}>
					{Array.from({ length: 3 }).map((_, i) => (
						<div key={i} className="metric-card">
							<div className="skeleton" style={{ height: 10, width: "50%", borderRadius: 4, marginBottom: 8 }} />
							<div className="skeleton" style={{ height: 22, width: "30%", borderRadius: 4 }} />
						</div>
					))}
				</div>
				<div className="table-wrapper">
					<table className="table">
						<tbody>{Array.from({ length: 5 }).map((_, i) => <RowSkeleton key={i} />)}</tbody>
					</table>
				</div>
			</Layout>
		)
	}

	// ─── Error ─────────────────────────────────────────────────────────────────

	if (loadState === "error") {
		return (
			<Layout topbar={topbar}>
				<div className="alert-bar alert-bar-warning">
					Hubo un problema al cargar las alertas. Intenta recargar la página.
				</div>
			</Layout>
		)
	}

	// ─── Empty state ───────────────────────────────────────────────────────────

	if (products.length === 0) {
		return (
			<Layout topbar={topbar}>
				<div className="empty-state">
					<svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ opacity: 0.3 }}>
						<path d="M16 4L28 26H4L16 4Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
						<line x1="16" y1="13" x2="16" y2="20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
						<circle cx="16" cy="23" r="1" fill="currentColor" />
					</svg>
					<span className="empty-state__title">Sin alertas activas</span>
					<span className="empty-state__description">
						Todos los productos están por encima de su stock mínimo.
					</span>
				</div>
			</Layout>
		)
	}

	// ─── Vista ─────────────────────────────────────────────────────────────────

	const filterLabels: Record<Filter, string> = {
		all: `Todos (${products.length})`,
		empty: `Sin stock (${empty.length})`,
		critical: `Crítico (${critical.length})`,
		low: `Bajo (${low.length})`,
	}

	return (
		<Layout topbar={topbar}>
			{/* Métricas — clicables para filtrar */}
			<div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8, marginBottom: "1.25rem" }}>
				<div
					className="metric-card"
					style={{ cursor: "pointer", outline: filter === "empty" ? "2px solid var(--color-exit)" : "none", borderRadius: "var(--radius-lg)" }}
					onClick={() => setFilter(filter === "empty" ? "all" : "empty")}
				>
					<div className="metric-card__label">Sin stock</div>
					<div className="metric-card__value" style={{ color: "var(--color-exit-dark)" }}>{empty.length}</div>
					<div className="metric-card__sub">Stock = 0</div>
				</div>
				<div
					className="metric-card"
					style={{ cursor: "pointer", outline: filter === "critical" ? "2px solid var(--color-alert)" : "none", borderRadius: "var(--radius-lg)" }}
					onClick={() => setFilter(filter === "critical" ? "all" : "critical")}
				>
					<div className="metric-card__label">Crítico</div>
					<div className="metric-card__value" style={{ color: "var(--color-alert-dark)" }}>{critical.length}</div>
					<div className="metric-card__sub">Menos del 25% del mínimo</div>
				</div>
				<div
					className="metric-card"
					style={{ cursor: "pointer", outline: filter === "low" ? "2px solid var(--color-border-strong)" : "none", borderRadius: "var(--radius-lg)" }}
					onClick={() => setFilter(filter === "low" ? "all" : "low")}
				>
					<div className="metric-card__label">Stock bajo</div>
					<div className="metric-card__value">{low.length}</div>
					<div className="metric-card__sub">Por debajo del mínimo</div>
				</div>
			</div>

			{/* Toolbar */}
			<div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "0.75rem" }}>
				<div style={{ display: "flex", border: "0.5px solid var(--color-border)", borderRadius: 6, overflow: "hidden" }}>
					{(["all", "empty", "critical", "low"] as Filter[]).map((f) => (
						<button
							key={f}
							onClick={() => setFilter(f)}
							style={{
								padding: "4px 10px",
								fontSize: 11,
								fontWeight: 500,
								background: filter === f ? "var(--color-bg-muted)" : "transparent",
								border: "none",
								borderRight: "0.5px solid var(--color-border)",
								cursor: "pointer",
								color: filter === f ? "var(--color-text-primary)" : "var(--color-text-secondary)",
							}}
						>
							{filterLabels[f]}
						</button>
					))}
				</div>
				<span style={{ marginLeft: "auto", fontSize: 11, color: "var(--color-text-secondary)" }}>
					Ordenado por déficit ↓
				</span>
			</div>

			{/* Tabla */}
			<div className="table-wrapper">
				<table className="table">
					<thead>
						<tr>
							<th style={{ width: 88 }}>SKU</th>
							<th>Producto</th>
							<th style={{ width: 90 }}>Categoría</th>
							<th style={{ width: 70, textAlign: "right" }}>Stock</th>
							<th style={{ width: 56, textAlign: "right" }}>Mín.</th>
							<th style={{ width: 64, textAlign: "right" }}>Déficit</th>
							<th style={{ width: 100 }}>Nivel</th>
							<th style={{ width: 130 }} />
						</tr>
					</thead>
					<tbody>
						{visible.map((product) => {
							const severity = getSeverity(product.stock, product.minStock)
							const deficit = product.stock - product.minStock

							return (
								<tr key={product.id}>
									<td><span className="sku">{product.sku}</span></td>
									<td style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 160 }}>
										{product.name}
									</td>
									<td>
										<span className="badge badge-admin" style={{ fontSize: 10 }}>
											{product.category}
										</span>
									</td>
									<td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
										<span className={`stock-value ${severity === "low" ? "is-low" : "is-empty"}`}>
											{product.stock}
										</span>
									</td>
									<td style={{ textAlign: "right", color: "var(--color-text-secondary)", fontVariantNumeric: "tabular-nums" }}>
										{product.minStock}
									</td>
									<td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
										<span style={{
											fontWeight: 500,
											color: severity === "low" ? "var(--color-alert-dark)" : "var(--color-exit-dark)",
										}}>
											{deficit}
										</span>
									</td>
									<td>
										<StockLevelBar stock={product.stock} minStock={product.minStock} />
									</td>
									<td style={{ textAlign: "right" }}>
										<button
											className="btn btn-secondary btn-sm"
											onClick={() => setMovementTarget(product)}
										>
											+ Registrar entrada
										</button>
									</td>
								</tr>
							)
						})}
					</tbody>
				</table>
			</div>

			{/* Modal de movimiento — preselecciona el producto y fija tipo ENTRY */}
			<CreateMovement
				isOpen={movementTarget !== null}
				onClose={() => setMovementTarget(null)}
				initialProduct={movementTarget ?? undefined}
				initialType="ENTRY"
				onSuccess={() => {
					setMovementTarget(null)
					fetchAlerts() // Refresca la lista tras registrar
				}}
			/>
		</Layout>
	)
}

export default Alerts
