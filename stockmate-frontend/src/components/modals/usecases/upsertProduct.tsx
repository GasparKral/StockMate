import type { Category } from "@/types/categories"
import type { Product } from "@/types/product"

import Modal from "@/components/generics/modal"

import { API } from "@/utils/apiCall"
import { useState, useEffect } from "react"

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface ProductForm {
	sku: string
	name: string
	description: string
	unitPrice: string
	unit: string
	category: string
	minStock: string
}

const EMPTY_FORM: ProductForm = {
	sku: "",
	name: "",
	description: "",
	unitPrice: "",
	unit: "unidades",
	category: "",
	minStock: "0",
}

function productToForm(p: Product, categories: Category[]): ProductForm {
	const cat = categories.find((c) => c.name === p.category)
	return {
		sku: p.sku,
		name: p.name,
		description: p.description ?? "",
		unitPrice: String(p.unitPrice),
		unit: p.unit,
		category: cat ? String(cat.id) : "",
		minStock: String(p.minStock),
	}
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface UpsertProductModalProps {
	isOpen: boolean
	onClose: () => void
	onSuccess: (product: Product) => void
	/** Si se pasa, el modal funciona en modo edición */
	product?: Product
}

// ─── Componente ───────────────────────────────────────────────────────────────

const UpsertProductModal = ({
	isOpen,
	onClose,
	onSuccess,
	product,
}: UpsertProductModalProps) => {
	const isEditing = product !== undefined
	const [form, setForm] = useState<ProductForm>(EMPTY_FORM)
	const [categories, setCategories] = useState<Category[]>([])
	const [errors, setErrors] = useState<Partial<ProductForm>>({})
	const [submitting, setSubmitting] = useState(false)
	const [serverError, setServerError] = useState<string | null>(null)

	// Cargar categorías una sola vez
	useEffect(() => {
		fetch(API("categories"))
			.then((r) => r.json())
			.then(setCategories)
	}, [])

	// Sincronizar formulario al abrir
	useEffect(() => {
		if (isOpen) {
			setForm(product ? productToForm(product, categories) : EMPTY_FORM)
			setErrors({})
			setServerError(null)
		}
	}, [isOpen, product, categories])

	const set = (field: keyof ProductForm) => (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
	) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

	// ─── Validación ───────────────────────────────────────────────────────────

	const validate = (): boolean => {
		const e: Partial<ProductForm> = {}
		if (!form.sku.trim()) e.sku = "Obligatorio"
		if (!/^[A-Z0-9\-]+$/.test(form.sku)) e.sku = "Solo mayúsculas, números y guiones"
		if (!form.name.trim()) e.name = "Obligatorio"
		if (!form.category) e.category = "Selecciona una categoría"
		if (isNaN(Number(form.unitPrice)) || Number(form.unitPrice) < 0) e.unitPrice = "Precio no válido"
		if (isNaN(Number(form.minStock)) || Number(form.minStock) < 0) e.minStock = "Debe ser ≥ 0"
		if (!form.unit.trim()) e.unit = "Obligatorio"
		setErrors(e)
		return Object.keys(e).length === 0
	}

	// ─── Submit ───────────────────────────────────────────────────────────────

	const handleSubmit = async () => {
		if (!validate()) return
		setSubmitting(true)
		setServerError(null)

		const body = {
			sku: form.sku.trim().toUpperCase(),
			name: form.name.trim(),
			description: form.description.trim() || null,
			unitPrice: Number(form.unitPrice),
			unit: form.unit.trim(),
			categoryId: Number(form.category),
			minStock: Number(form.minStock),
		}

		try {
			const res = await fetch(
				isEditing ? API(`products/${product!.id}`) : API("products"),
				{
					method: isEditing ? "PUT" : "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(body),
				}
			)

			if (!res.ok) {
				const data = await res.json().catch(() => ({}))
				setServerError(data.message ?? "Error al guardar el producto")
				return
			}

			const saved: Product = await res.json()
			onSuccess(saved)
			onClose()
		} catch {
			setServerError("No se pudo conectar con el servidor")
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<Modal
			title={isEditing ? "Editar producto" : "Nuevo producto"}
			isOpen={isOpen}
			onClose={onClose}
			onAccept={handleSubmit}
			acceptLabel={submitting ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear producto"}
		>
			<div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>

				{/* SKU + Unidad */}
				<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
					<div className="form-group">
						<label className="form-label">
							SKU <span style={{ color: "var(--color-exit)" }}>*</span>
						</label>
						<input
							className={`input${errors.sku ? " is-error" : ""}`}
							value={form.sku}
							onChange={set("sku")}
							placeholder="ELEC-0001"
							disabled={isEditing} // SKU inmutable tras creación
							style={isEditing ? { opacity: 0.6, cursor: "not-allowed" } : undefined}
						/>
						{errors.sku && <span className="form-error">{errors.sku}</span>}
						{isEditing && <span className="form-hint">El SKU no se puede modificar</span>}
					</div>
					<div className="form-group">
						<label className="form-label">
							Unidad <span style={{ color: "var(--color-exit)" }}>*</span>
						</label>
						<input
							className={`input${errors.unit ? " is-error" : ""}`}
							value={form.unit}
							onChange={set("unit")}
							placeholder="unidades, kg, litros…"
						/>
						{errors.unit && <span className="form-error">{errors.unit}</span>}
					</div>
				</div>

				{/* Nombre */}
				<div className="form-group">
					<label className="form-label">
						Nombre <span style={{ color: "var(--color-exit)" }}>*</span>
					</label>
					<input
						className={`input${errors.name ? " is-error" : ""}`}
						value={form.name}
						onChange={set("name")}
						placeholder="Nombre del producto"
						autoFocus={!isEditing}
					/>
					{errors.name && <span className="form-error">{errors.name}</span>}
				</div>

				{/* Descripción */}
				<div className="form-group">
					<label className="form-label">
						Descripción{" "}
						<span style={{ color: "var(--color-text-hint)", fontWeight: 400 }}>(opcional)</span>
					</label>
					<textarea
						className="textarea"
						value={form.description}
						onChange={set("description")}
						placeholder="Descripción del producto"
						rows={2}
					/>
				</div>

				{/* Categoría + Precio */}
				<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
					<div className="form-group">
						<label className="form-label">
							Categoría <span style={{ color: "var(--color-exit)" }}>*</span>
						</label>
						<select
							className={`select${errors.category ? " is-error" : ""}`}
							value={form.category}
							onChange={set("category")}
						>
							<option value="">Seleccionar…</option>
							{categories.map((c) => (
								<option key={c.id} value={c.name}>{c.name}</option>
							))}
						</select>
						{errors.category && <span className="form-error">{errors.category}</span>}
					</div>
					<div className="form-group">
						<label className="form-label">
							Precio unitario <span style={{ color: "var(--color-exit)" }}>*</span>
						</label>
						<input
							className={`input${errors.unitPrice ? " is-error" : ""}`}
							type="number"
							min="0"
							step="0.01"
							value={form.unitPrice}
							onChange={set("unitPrice")}
							placeholder="0,00"
						/>
						{errors.unitPrice && <span className="form-error">{errors.unitPrice}</span>}
					</div>
				</div>

				{/* Stock mínimo */}
				<div className="form-group">
					<label className="form-label">Stock mínimo</label>
					<input
						className={`input${errors.minStock ? " is-error" : ""}`}
						type="number"
						min="0"
						value={form.minStock}
						onChange={set("minStock")}
						placeholder="0"
					/>
					<span className="form-hint">
						Se generará una alerta cuando el stock baje de este valor
					</span>
					{errors.minStock && <span className="form-error">{errors.minStock}</span>}
				</div>

				{serverError && (
					<div className="alert-bar alert-bar-danger">{serverError}</div>
				)}
			</div>
		</Modal>
	)
}

export default UpsertProductModal
