import type { Category } from "@/types/categories";

import Layout from "@/layouts/layout";
import Modal from "@/components/generics/modal";

import { API } from "@/utils/apiCall";
import { useEffect, useState } from "react";
import { TopBar } from "@/layouts/topbar";

// ─── Estado de carga ──────────────────────────────────────────────────────────

type LoadState = "loading" | "error" | "ok"

// ─── Formulario de categoría (crear y editar) ─────────────────────────────────

type CategoryForm = { id: string, name: string; description: string }

const CategoryFormFields = ({
	value,
	onChange,
}: {
	value: CategoryForm
	onChange: (v: CategoryForm) => void
}) => (
	<div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
		<div className="form-group">
			<label className="form-label">
				Nombre <span style={{ color: "var(--color-exit)" }}>*</span>
			</label>
			<input
				className="input"
				type="text"
				value={value.name}
				onChange={(e) => onChange({ ...value, name: e.target.value })}
				placeholder="Ej: Electrónica"
				autoFocus
			/>
		</div>
		<div className="form-group">
			<label className="form-label">Descripción</label>
			<textarea
				className="textarea"
				value={value.description}
				onChange={(e) => onChange({ ...value, description: e.target.value })}
				placeholder="Descripción opcional de la categoría"
				rows={3}
			/>
		</div>
	</div>
)

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const CategoryCardSkeleton = () => (
	<div className="card" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
		<div className="skeleton" style={{ height: 14, width: "55%", borderRadius: 4 }} />
		<div className="skeleton" style={{ height: 11, width: "80%", borderRadius: 4 }} />
		<div className="skeleton" style={{ height: 11, width: "40%", borderRadius: 4 }} />
		<div style={{ display: "flex", gap: 6, marginTop: "auto" }}>
			<div className="skeleton" style={{ height: 28, flex: 1, borderRadius: 6 }} />
			<div className="skeleton" style={{ height: 28, flex: 1, borderRadius: 6 }} />
		</div>
	</div>
)

// ─── Tarjeta de categoría ─────────────────────────────────────────────────────

const CategoryCard = ({
	category,
	onEdit,
	onDelete,
}: {
	category: Category
	onEdit: (c: Category) => void
	onDelete: (c: Category) => void
}) => {
	const hasProducts = (category.productCount ?? 0) > 0

	return (
		<article className="card" style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
			<div className="card-header" style={{ paddingBottom: "0.625rem" }}>
				<h3 className="card-title" style={{ fontSize: "var(--text-md)" }}>
					{category.name}
				</h3>
			</div>

			{/* Descripción */}
			<p style={{
				fontSize: "var(--text-sm)",
				color: "var(--color-text-secondary)",
				flex: 1,
				lineHeight: 1.5,
				minHeight: "2.5rem",
			}}>
				{category.description || (
					<span style={{ fontStyle: "italic", opacity: 0.6 }}>Sin descripción</span>
				)}
			</p>

			{/* Contador de productos */}
			<div style={{
				fontSize: "var(--text-xs)",
				color: hasProducts ? "var(--color-text-secondary)" : "var(--color-text-hint)",
				paddingTop: "0.5rem",
				borderTop: "1px solid var(--color-border)",
			}}>
				{hasProducts
					? `${category.productCount} producto${category.productCount === 1 ? "" : "s"} asociado${category.productCount === 1 ? "" : "s"}`
					: "Sin productos asociados"
				}
			</div>

			{/* Acciones */}
			<div style={{ display: "flex", gap: 6 }}>
				<button
					className="btn btn-ghost btn-sm"
					style={{ flex: 1 }}
					onClick={() => onEdit(category)}
				>
					Editar
				</button>
				<button
					className="btn btn-sm"
					style={{ flex: 1 }}
					disabled={hasProducts}
					title={hasProducts ? "No se puede eliminar: tiene productos asociados" : "Eliminar categoría"}
					onClick={() => onDelete(category)}
					// Aplica btn-danger solo si no tiene productos
					{...(!hasProducts && { className: "btn btn-danger btn-sm" })}
				>
					Eliminar
				</button>
			</div>
		</article>
	)
}

// ─── Página principal ─────────────────────────────────────────────────────────

type ModalState =
	| { type: "create" }
	| { type: "edit"; category: Category }
	| { type: "delete"; category: Category }
	| null

const EMPTY_FORM: CategoryForm = { id: "", name: "", description: "" }

const Categories = () => {
	const [categories, setCategories] = useState<Category[]>([])
	const [loadState, setLoadState] = useState<LoadState>("loading")
	const [modal, setModal] = useState<ModalState>(null)
	const [form, setForm] = useState<CategoryForm>(EMPTY_FORM)
	const [submitting, setSubmitting] = useState(false)

	useEffect(() => {
		setLoadState("loading")
		fetch(API("categories"))
			.then((r) => {
				if (!r.ok) throw new Error()
				return r.json()
			})
			.then((data) => {
				setCategories(data)
				setLoadState("ok")
			})
			.catch(() => setLoadState("error"))
	}, [])

	// Abrir modal de edición con los datos precargados
	const handleEdit = (category: Category) => {
		setForm({ id: category.id, name: category.name, description: category.description })
		setModal({ type: "edit", category })
	}

	// Abrir modal de creación con formulario limpio
	const handleCreate = () => {
		setForm(EMPTY_FORM)
		setModal({ type: "create" })
	}

	const handleDelete = (category: Category) => {
		setModal({ type: "delete", category })
	}

	const handleClose = () => {
		setModal(null)
		setForm(EMPTY_FORM)
	}

	const handleSubmitCreate = async () => {
		if (!form.name.trim()) return
		setSubmitting(true)
		try {
			const res = await fetch(API("categories", { name: form.name, description: form.description }, 'POST'))
			const created: Category = await res.json()
			setCategories((prev) => [...prev, { ...created, productCount: 0 }])
			handleClose()
		} finally {
			setSubmitting(false)
		}
	}

	const handleSubmitEdit = async () => {
		if (modal?.type !== "edit" || !form.name.trim()) return
		setSubmitting(true)
		try {
			const res = await fetch(API(`categories/${modal.category.id}`, { id: form.id, name: form.name, description: form.description }, 'PUT'))
			const updated: Category = await res.json()
			setCategories((prev) => prev.map((c) => c.id === updated.id ? { ...updated, productCount: c.productCount } : c))
			handleClose()
		} finally {
			setSubmitting(false)
		}
	}

	const handleConfirmDelete = async () => {
		if (modal?.type !== "delete") return
		setSubmitting(true)
		try {
			await fetch(API(`categories/${modal.category.id}`), { method: "DELETE" })
			setCategories((prev) => prev.filter((c) => c.id !== modal.category.id))
			handleClose()
		} finally {
			setSubmitting(false)
		}
	}

	// ─── Topbar ─────────────────────────────────────────────────────────────────

	const topbar = (
		<>
			<TopBar.Title
				text="Categorías"
				description={loadState === "ok" ? `${categories.length} categorías` : "Monitorea y ajusta las categorías"}
			/>
			<TopBar.Element>
				<button className="btn btn-primary" onClick={handleCreate}>
					<svg width="12" height="12" viewBox="0 0 12 12" fill="none">
						<path d="M6 1v10M1 6h10" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
					</svg>
					Nueva categoría
				</button>
			</TopBar.Element>
		</>
	)

	// ─── Skeleton ──────────────────────────────────────────────────────────────

	if (loadState === "loading") {
		return (
			<Layout topbar={topbar}>
				<div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "1.5rem" }}>
					{Array.from({ length: 6 }).map((_, i) => <CategoryCardSkeleton key={i} />)}
				</div>
			</Layout>
		)
	}

	// ─── Error ─────────────────────────────────────────────────────────────────

	if (loadState === "error") {
		return (
			<Layout topbar={topbar}>
				<div className="alert-bar alert-bar-warning">
					Hubo un problema al cargar las categorías. Intenta recargar la página.
				</div>
			</Layout>
		)
	}

	// ─── Vista ─────────────────────────────────────────────────────────────────

	return (
		<Layout topbar={topbar}>
			<section style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "1.5rem" }}>
				{categories.map((c) => (
					<CategoryCard
						key={c.id}
						category={c}
						onEdit={handleEdit}
						onDelete={handleDelete}
					/>
				))}

				{/* Tarjeta de nueva categoría */}
				<button
					onClick={handleCreate}
					style={{
						background: "transparent",
						border: "1px dashed var(--color-border)",
						borderRadius: "var(--radius-lg)",
						cursor: "pointer",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						gap: "0.5rem",
						minHeight: 120,
						color: "var(--color-text-secondary)",
						fontSize: "var(--text-sm)",
						transition: "border-color var(--transition-fast), color var(--transition-fast), background-color var(--transition-fast)",
					}}
					onMouseEnter={(e) => {
						e.currentTarget.style.borderColor = "var(--color-accent)"
						e.currentTarget.style.color = "var(--color-accent)"
						e.currentTarget.style.backgroundColor = "var(--color-accent-soft)"
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.borderColor = "var(--color-border)"
						e.currentTarget.style.color = "var(--color-text-secondary)"
						e.currentTarget.style.backgroundColor = "transparent"
					}}
				>
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
						<path d="M8 1v14M1 8h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
					</svg>
					Nueva categoría
				</button>
			</section>

			{/* Modal crear */}
			<Modal
				title="Nueva categoría"
				isOpen={modal?.type === "create"}
				onClose={handleClose}
				onAccept={handleSubmitCreate}
				acceptLabel={submitting ? "Creando..." : "Crear categoría"}
			>
				<CategoryFormFields value={form} onChange={setForm} />
			</Modal>

			{/* Modal editar */}
			<Modal
				title="Editar categoría"
				isOpen={modal?.type === "edit"}
				onClose={handleClose}
				onAccept={handleSubmitEdit}
				acceptLabel={submitting ? "Guardando..." : "Guardar cambios"}
			>
				<CategoryFormFields value={form} onChange={setForm} />
			</Modal>

			{/* Modal confirmar borrado */}
			<Modal
				title="Eliminar categoría"
				isOpen={modal?.type === "delete"}
				onClose={handleClose}
				onAccept={handleConfirmDelete}
				acceptLabel={submitting ? "Eliminando..." : "Eliminar"}
				acceptVariant="btn-danger"
			>
				<p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)" }}>
					¿Seguro que quieres eliminar la categoría{" "}
					<strong style={{ color: "var(--color-text-primary)" }}>
						{modal?.type === "delete" ? modal.category.name : ""}
					</strong>?
					Esta acción no se puede deshacer.
				</p>
			</Modal>
		</Layout>
	)
}

export default Categories
