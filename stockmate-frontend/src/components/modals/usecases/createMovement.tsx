import type { Product } from "@/types/product"
import type { MovementType, MovementReason } from "@/types/movements"

import Modal from "@/components/generics/modal"
import DropdownInput from "@/components/generics/dropdownInput"

import { useState, useEffect, useCallback } from "react"
import { ErrorBoundary } from "@/components/generics/errorBounds"
import { API } from "@/utils/apiCall"

// ─── Razones válidas por tipo de movimiento ───────────────────────────────────

const REASONS_BY_TYPE: Record<MovementType, { value: MovementReason; label: string }[]> = {
	ENTRY: [
		{ value: "PURCHASE", label: "Compra" },
		{ value: "RETURN", label: "Devolución de cliente" },
		{ value: "ADJUSTMENT", label: "Ajuste de inventario" },
	],
	EXIT: [
		{ value: "SALE", label: "Venta" },
		{ value: "WASTE", label: "Merma / caducado" },
		{ value: "ADJUSTMENT_OUT", label: "Ajuste de inventario" },
	],
}

// ─── Query de productos ───────────────────────────────────────────────────────

const searchProducts = async (name: string): Promise<Product[]> => {
	try {
		const response = await fetch(API(`products`, { name, pageSize: 10, page: 0 }))
		return await response.json()
	} catch {
		return []
	}
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface CreateMovementProps {
	isOpen: boolean
	onClose: () => void
	onSuccess?: () => void
	/** Producto preseleccionado — usado desde la pantalla de Alertas */
	initialProduct?: Product
	/** Tipo preseleccionado — usado desde la pantalla de Alertas */
	initialType?: MovementType
}

// ─── Componente ───────────────────────────────────────────────────────────────

const CreateMovement = ({
	isOpen,
	onClose,
	onSuccess,
	initialProduct,
	initialType,
}: CreateMovementProps) => {
	const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(initialProduct)
	const [movementType, setMovementType] = useState<MovementType>(initialType ?? "ENTRY")
	const [reason, setReason] = useState<MovementReason>("PURCHASE")
	const [quantity, setQuantity] = useState(1)
	const [notes, setNotes] = useState("")
	const [submitting, setSubmitting] = useState(false)
	const [error, setError] = useState<string | null>(null)

	// Sincronizar props iniciales cuando el modal se abre
	useEffect(() => {
		if (isOpen) {
			setSelectedProduct(initialProduct)
			setMovementType(initialType ?? "ENTRY")
			setReason(initialType === "EXIT" ? "SALE" : "PURCHASE")
			setQuantity(1)
			setNotes("")
			setError(null)
		}
	}, [isOpen, initialProduct, initialType])

	// Al cambiar el tipo, resetear la razón a la primera válida del nuevo tipo
	const handleTypeChange = (type: MovementType) => {
		setMovementType(type)
		setReason(REASONS_BY_TYPE[type][0].value)
	}

	// useCallback para evitar bucle en DropdownInput
	const handleSearch = useCallback(searchProducts, [])

	const handleSave = async () => {
		if (!selectedProduct) {
			setError("Selecciona un producto")
			return
		}
		if (quantity < 1) {
			setError("La cantidad debe ser mayor que 0")
			return
		}

		setSubmitting(true)
		setError(null)

		try {
			const res = await fetch(API("movements", {
				productId: selectedProduct.id,
				type: movementType,
				reason,
				quantity,
				notes: notes.trim() || null,
			}, "POST"))

			if (!res.ok) {
				const body = await res.json().catch(() => ({}))
				// El backend devuelve 422 si el EXIT dejaría stock negativo
				setError(body.message ?? "Error al registrar el movimiento")
				return
			}

			onSuccess?.()
			onClose()
		} catch {
			setError("No se pudo conectar con el servidor")
		} finally {
			setSubmitting(false)
		}
	}

	const currentReasons = REASONS_BY_TYPE[movementType]

	return (
		<Modal
			title="Registrar movimiento"
			isOpen={isOpen}
			onClose={onClose}
			onAccept={handleSave}
			acceptLabel={submitting ? "Registrando..." : "Registrar"}
		>
			<div className="w-lg" style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>

				{/* Producto */}
				<ErrorBoundary
					fallback={<span className="form-hint">Error al cargar el buscador</span>}
					onError={(e) => <span className="form-error">{String(e)}</span>}
				>
					<DropdownInput<Product>
						label="Producto"
						placeholder="Buscar por nombre o SKU..."
						onSearch={handleSearch}
						onChange={setSelectedProduct}
						initialValue={selectedProduct}
						getDisplayValue={(p) => `${p.name} [${p.sku}]`}
					/>
				</ErrorBoundary>

				{/* Stock actual — solo si hay producto seleccionado */}
				{selectedProduct && (
					<div style={{
						display: "flex",
						gap: 12,
						padding: "0.5rem 0.75rem",
						background: "var(--color-bg-muted)",
						borderRadius: "var(--radius-md)",
						fontSize: "var(--text-xs)",
						color: "var(--color-text-secondary)",
					}}>
						<span>Stock actual: <strong style={{ color: "var(--color-text-primary)" }}>{selectedProduct.stock} {selectedProduct.unit}</strong></span>
						<span>Mínimo: <strong style={{ color: "var(--color-text-primary)" }}>{selectedProduct.minStock}</strong></span>
					</div>
				)}

				{/* Tipo — botones toggle */}
				<div className="form-group">
					<label className="form-label">Tipo</label>
					<div style={{ display: "flex", gap: 6 }}>
						{(["ENTRY", "EXIT"] as MovementType[]).map((type) => (
							<button
								key={type}
								type="button"
								onClick={() => handleTypeChange(type)}
								className={`btn btn-sm ${movementType === type
									? type === "ENTRY" ? "btn-primary" : "btn-danger"
									: "btn-ghost"
									}`}
								style={{ flex: 1 }}
							>
								{type === "ENTRY" ? "Entrada" : "Salida"}
							</button>
						))}
					</div>
				</div>

				{/* Razón — cambia según el tipo */}
				<div className="form-group">
					<label className="form-label">Motivo</label>
					<select
						className="select"
						value={reason}
						onChange={(e) => setReason(e.target.value as MovementReason)}
					>
						{currentReasons.map(({ value, label }) => (
							<option key={value} value={value}>{label}</option>
						))}
					</select>
				</div>

				{/* Cantidad */}
				<div className="form-group">
					<label className="form-label">Cantidad</label>
					<input
						className="input"
						type="number"
						min={1}
						value={quantity}
						onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
					/>
				</div>

				{/* Notas */}
				<div className="form-group">
					<label className="form-label">Notas <span style={{ color: "var(--color-text-hint)", fontWeight: 400 }}>(opcional)</span></label>
					<textarea
						className="textarea"
						value={notes}
						onChange={(e) => setNotes(e.target.value)}
						placeholder="Observaciones sobre este movimiento..."
						rows={2}
					/>
				</div>

				{/* Error */}
				{error && (
					<div className="alert-bar alert-bar-danger">
						{error}
					</div>
				)}
			</div>
		</Modal>
	)
}

export default CreateMovement
