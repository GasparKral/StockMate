import Modal from "@/components/generics/modal"
import type { Product } from "@/types/product"

interface DeleteProductModalProps {
	isOpen: boolean
	onClose: () => void
	onConfirm: () => void
	product?: Product
	submitting?: boolean
}

const DeleteProductModal = ({
	isOpen,
	onClose,
	onConfirm,
	product,
	submitting = false,
}: DeleteProductModalProps) => (
	<Modal
		title="Eliminar producto"
		isOpen={isOpen}
		onClose={onClose}
		onAccept={onConfirm}
		acceptLabel={submitting ? "Eliminando..." : "Eliminar"}
		acceptVariant="btn-danger"
	>
		<div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
			<p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)" }}>
				¿Seguro que quieres eliminar el producto{" "}
				<strong style={{ color: "var(--color-text-primary)" }}>
					{product?.name}
				</strong>
				?
			</p>
			{product && (
				<div style={{
					display: "flex",
					gap: 16,
					padding: "0.5rem 0.75rem",
					background: "var(--color-bg-muted)",
					borderRadius: "var(--radius-md)",
					fontSize: "var(--text-xs)",
					color: "var(--color-text-secondary)",
				}}>
					<span>SKU: <strong style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-mono)" }}>{product.sku}</strong></span>
					<span>Stock actual: <strong style={{ color: "var(--color-text-primary)" }}>{product.stock} {product.unit}</strong></span>
				</div>
			)}
			<p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-secondary)" }}>
				El producto quedará desactivado y no aparecerá en las listas activas,
				pero su historial de movimientos se conservará.
			</p>
		</div>
	</Modal>
)

export default DeleteProductModal
