import { useEffect, type ReactNode } from "react"

interface ModalProps {
	title?: string
	isOpen: boolean
	onClose?: () => void
	onAccept?: () => void
	/** Texto del botón de confirmación. Por defecto "Aceptar" */
	acceptLabel?: string
	/** Texto del botón de cancelación. Por defecto "Cancelar" */
	cancelLabel?: string
	/** Variante del botón de confirmación. Por defecto "btn-primary" */
	acceptVariant?: "btn-primary" | "btn-danger"
	/** Reemplaza completamente los botones del footer */
	footerActions?: ReactNode
	/** Oculta el footer completo (útil para modales solo informativos) */
	hideFooter?: boolean
	className?: string
	children?: ReactNode
}

const Modal = ({
	title,
	isOpen,
	onClose,
	onAccept,
	acceptLabel = "Aceptar",
	cancelLabel = "Cancelar",
	acceptVariant = "btn-primary",
	footerActions,
	hideFooter = false,
	className,
	children,
}: ModalProps) => {
	// Cerrar con Escape
	useEffect(() => {
		if (!isOpen) return
		const handleKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose?.()
		}
		document.addEventListener("keydown", handleKey)
		return () => document.removeEventListener("keydown", handleKey)
	}, [isOpen, onClose])

	// Bloquear scroll del body mientras el modal está abierto
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = "hidden"
		} else {
			document.body.style.overflow = ""
		}
		return () => { document.body.style.overflow = "" }
	}, [isOpen])

	if (!isOpen) return null

	return (
		<div className="modal-backdrop" onClick={onClose}>
			<div className="modal" onClick={(e) => e.stopPropagation()}>

				{/* Header — solo título y botón X */}
				<div className="modal-header">
					{title && <h4 className="modal-title">{title}</h4>}
					{onClose && (
						<button
							className="btn-icon btn-ghost"
							onClick={onClose}
							aria-label="Cerrar"
						>
							<svg width="14" height="14" viewBox="0 0 14 14" fill="none">
								<path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
							</svg>
						</button>
					)}
				</div>

				{/* Contenido */}
				<div className={`modal-body${className ? ` ${className}` : ""}`}>
					{children}
				</div>

				{/* Footer */}
				{!hideFooter && (
					<div className="modal-footer">
						{footerActions ?? (
							<>
								{onClose && (
									<button className="btn btn-ghost" onClick={onClose}>
										{cancelLabel}
									</button>
								)}
								{onAccept && (
									<button className={`btn ${acceptVariant}`} onClick={onAccept}>
										{acceptLabel}
									</button>
								)}
							</>
						)}
					</div>
				)}
			</div>
		</div>
	)
}

export default Modal

// ─── Ejemplos de uso ──────────────────────────────────────────────────────────
//
// Formulario estándar:
//   <Modal title="Nuevo producto" isOpen={open} onClose={close} onAccept={submit}
//          acceptLabel="Crear producto">
//     <ProductForm />
//   </Modal>
//
// Confirmación de borrado:
//   <Modal title="Eliminar producto" isOpen={open} onClose={close} onAccept={del}
//          acceptLabel="Eliminar" acceptVariant="btn-danger">
//     <p>¿Seguro que quieres eliminar este producto? Esta acción no se puede deshacer.</p>
//   </Modal>
//
// Footer personalizado:
//   <Modal title="Detalles" isOpen={open} onClose={close}
//     footerActions={
//       <>
//         <button className="btn btn-ghost" onClick={close}>Cerrar</button>
//         <button className="btn btn-secondary" onClick={exportar}>Exportar</button>
//         <button className="btn btn-primary" onClick={guardar}>Guardar</button>
//       </>
//     }
//   >
//     ...
//   </Modal>
//
// Solo informativo (sin footer):
//   <Modal title="Aviso" isOpen={open} onClose={close} hideFooter>
//     <p>...</p>
//   </Modal>xport default Modal;
