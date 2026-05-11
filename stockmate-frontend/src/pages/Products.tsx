import type { Resume } from "@/types/resume"
import type { Product } from "@/types/product"

import Layout from "@/layouts/layout"
import Pagination from "@/components/generics/pagination"
import DropdownInput from "@/components/generics/dropdownInput"
import UpsertProductModal from "@/components/modals/usecases/upsertProduct"
import DeleteProductModal from "@/components/modals/usecases/deleteProduct"

import { TopBar } from "@/layouts/topbar"
import { API } from "@/utils/apiCall"
import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router"

// ─── Filtros ──────────────────────────────────────────────────────────────────

interface Filter {
	name: string
	category: string
	disabled: string | null
	stock: string | null
}

const EMPTY_FILTER: Filter = { name: "", category: "", disabled: null, stock: null }

// ─── Estado de modales ────────────────────────────────────────────────────────

type ModalState =
	| { type: "create" }
	| { type: "edit"; product: Product }
	| { type: "delete"; product: Product }
	| null

// ─── Página ───────────────────────────────────────────────────────────────────

const Products = () => {
	const navigate = useNavigate()
	const [resume, setResume] = useState<Resume | null>(null)
	const [products, setProducts] = useState<Product[]>([])
	const [categories, setCategories] = useState<string[]>([])
	const [filter, setFilter] = useState<Filter>(EMPTY_FILTER)
	const [page, setPage] = useState(1)
	const [modal, setModal] = useState<ModalState>(null)
	const [deleteSubmitting, setDeleteSubmitting] = useState(false)
	const pageSize = 10

	// ─── Fetch inicial ────────────────────────────────────────────────────────

	useEffect(() => {
		fetch(API("products/resume"))
			.then((v) => v.json())
			.then(setResume)
		fetch(API("categories"))
			.then((v) => v.json())
			.then((c: { id: number; name: string }[]) => setCategories(c.map((v) => v.name)))
	}, [])

	// ─── Fetch productos con filtros ──────────────────────────────────────────

	const fetchProducts = useCallback(() => {
		fetch(API("products", { pageSize, page: page - 1, ...filter }))
			.then((v) => v.json())
			.then(setProducts)
	}, [page, filter])

	useEffect(() => { fetchProducts() }, [fetchProducts])

	// ─── Acciones de modal ────────────────────────────────────────────────────

	// Tras crear: añade al array y refresca el resume
	const handleCreated = (product: Product) => {
		setProducts((prev) => [product, ...prev])
		fetch(API("products/resume")).then((v) => v.json()).then(setResume)
	}

	// Tras editar: reemplaza en el array
	const handleEdited = (product: Product) => {
		setProducts((prev) => prev.map((p) => p.id === product.id ? product : p))
	}

	// Soft-delete
	const handleConfirmDelete = async () => {
		if (modal?.type !== "delete") return
		setDeleteSubmitting(true)
		try {
			await fetch(API(`products/${modal.product.id}`), { method: "DELETE" })
			setProducts((prev) =>
				prev.map((p) => p.id === modal.product.id ? { ...p, state: true } : p)
			)
			fetch(API("products/resume")).then((v) => v.json()).then(setResume)
			setModal(null)
		} finally {
			setDeleteSubmitting(false)
		}
	}

	// ─── Topbar ───────────────────────────────────────────────────────────────

	const description = resume
		? `${resume.totalProducts} productos activos · ${resume.alertCount} alertas de stock`
		: "Cargando…"

	const topbar = (
		<>
			<TopBar.Title text="Gestión de productos" description={description} />
			<TopBar.Element>
				<button className="btn btn-ghost" onClick={() => navigate("/admin/categories")}>
					Categorías
				</button>
			</TopBar.Element>
			<TopBar.Element>
				<button className="btn btn-primary" onClick={() => setModal({ type: "create" })}>
					<svg width="12" height="12" viewBox="0 0 12 12" fill="none">
						<path d="M6 1v10M1 6h10" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
					</svg>
					Nuevo producto
				</button>
			</TopBar.Element>
		</>
	)

	const totalPages = resume ? Math.ceil(resume.totalProducts / pageSize) : 1

	return (
		<Layout topbar={topbar}>
			<div className="table-wrapper">

				{/* Toolbar de filtros */}
				<div className="flex p-2 gap-2 items-center" style={{ borderBottom: "0.5px solid var(--color-border)" }}>
					<DropdownInput<Product>
						placeholder="Buscar producto…"
						onChange={(v) => setFilter((prev) => ({ ...prev, name: v.name }))}
						onSearch={(s) => fetch(API("products", { name: s })).then((r) => r.json())}
						getDisplayValue={(p) => `${p.name} [${p.sku}]`}
					/>
					<select
						className="select"
						style={{ maxWidth: 180 }}
						onChange={(e) => setFilter((prev) => ({ ...prev, category: e.target.value }))}
					>
						<option value="">Todas las categorías</option>
						{categories.map((c) => (
							<option key={c} value={c}>{c}</option>
						))}
					</select>
					<select
						className="select"
						style={{ maxWidth: 160 }}
						onChange={(e) => setFilter((prev) => ({ ...prev, disabled: e.target.value || null }))}
					>
						<option value="">Todos los estados</option>
						<option value="false">Activos</option>
						<option value="true">Eliminados</option>
					</select>
					<select
						className="select"
						style={{ maxWidth: 160 }}
						onChange={(e) => setFilter((prev) => ({ ...prev, stock: e.target.value || null }))}
					>
						<option value="">Stock: todos</option>
						<option value="low">Stock bajo</option>
						<option value="out">Sin stock</option>
					</select>
					<span style={{ marginLeft: "auto", fontSize: "var(--text-xs)", color: "var(--color-text-secondary)" }}>
						{products.length} resultados
					</span>
				</div>

				{/* Tabla */}
				<table className="table">
					<thead>
						<tr>
							<th>SKU</th>
							<th>Nombre</th>
							<th>Categoría</th>
							<th style={{ textAlign: "right" }}>Precio</th>
							<th style={{ textAlign: "right" }}>Stock</th>
							<th style={{ textAlign: "right" }}>Mín.</th>
							<th>Estado</th>
							<th />
						</tr>
					</thead>
					<tbody>
						{products.map((p) => (
							<tr key={p.sku}>
								<td><span className="sku">{p.sku}</span></td>
								<td style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 200 }}>
									{p.name}
								</td>
								<td>
									<span className="badge badge-admin" style={{ fontSize: 10 }}>{p.category}</span>
								</td>
								<td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
									{p.unitPrice.toFixed(2)} €
								</td>
								<td style={{ textAlign: "right" }}>
									<span className={`stock-value ${p.stock >= p.minStock ? "is-ok" : p.stock > 0 ? "is-low" : "is-empty"}`}>
										{p.stock}
									</span>
								</td>
								<td style={{ textAlign: "right", color: "var(--color-text-secondary)", fontVariantNumeric: "tabular-nums" }}>
									{p.minStock}
								</td>
								<td>
									<span className={`badge ${!p.state ? "badge-active" : "badge-disabled"}`}>
										{!p.state ? "Activo" : "Eliminado"}
									</span>
								</td>
								<td>
									<div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
										<button
											className="btn btn-ghost btn-sm"
											disabled={p.state}
											onClick={() => setModal({ type: "edit", product: p })}
										>
											Editar
										</button>
										<button
											className="btn btn-danger btn-sm"
											disabled={p.state}
											onClick={() => setModal({ type: "delete", product: p })}
										>
											Eliminar
										</button>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>

				{/* Paginación */}
				<div style={{
					padding: "0.5rem 1rem",
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					borderTop: "0.5px solid var(--color-border)",
				}}>
					<span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-secondary)" }}>
						Mostrando {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, resume?.totalProducts ?? 0)} de {resume?.totalProducts ?? 0}
					</span>
					<Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
				</div>
			</div>

			{/* Modales */}
			<UpsertProductModal
				isOpen={modal?.type === "create"}
				onClose={() => setModal(null)}
				onSuccess={handleCreated}
			/>
			<UpsertProductModal
				isOpen={modal?.type === "edit"}
				onClose={() => setModal(null)}
				onSuccess={handleEdited}
				product={modal?.type === "edit" ? modal.product : undefined}
			/>
			<DeleteProductModal
				isOpen={modal?.type === "delete"}
				onClose={() => setModal(null)}
				onConfirm={handleConfirmDelete}
				product={modal?.type === "delete" ? modal.product : undefined}
				submitting={deleteSubmitting}
			/>
		</Layout>
	)
}

export default Products
