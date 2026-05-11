import type { AuthStore, AuthStoreActions, User } from "@/stores/auth"
import { useAuthStore } from "@/stores/auth"
import { API } from "@/utils/apiCall"
import React, { use, useState, useEffect, useRef, type ReactNode } from "react"
import { NavLink, useNavigate } from "react-router"
import Modal from "@/components/generics/modal"

// ─── Iconos inline ────────────────────────────────────────────────────────────

const IconDashboard = () => (
	<svg width="14" height="14" viewBox="0 0 14 14" fill="none">
		<rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" />
		<rect x="8" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" />
		<rect x="1" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" />
		<rect x="8" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" />
	</svg>
)

const IconMovements = () => (
	<svg width="14" height="14" viewBox="0 0 14 14" fill="none">
		<path d="M1 3h12M1 7h12M1 11h12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
	</svg>
)

const IconBox = () => (
	<svg width="14" height="14" viewBox="0 0 14 14" fill="none">
		<path d="M1 4.5L7 1.5L13 4.5V9.5L7 12.5L1 9.5V4.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
		<path d="M7 1.5V12.5M1 4.5L13 4.5" stroke="currentColor" strokeWidth="1.2" />
	</svg>
)

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface SidebarProps {
	extra?: ReactNode
	user?: User
	alertCount?: number
}

interface GroupProps {
	label: string
	className?: string
	children: ReactNode
}

interface ElementProps {
	to: string
	icon?: ReactNode
	label: string
	badge?: number
	className?: string
}

type SidebarComponent = React.FC<SidebarProps> & {
	Group: React.FC<GroupProps>
	Element: React.FC<ElementProps>
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

const Group: React.FC<GroupProps> = ({ label, className = "", children }) => (
	<div className={`sidebar__group ${className}`}>
		<span className="sidebar__group-label">{label}</span>
		<div className="sidebar__group-items">{children}</div>
	</div>
)

const Element: React.FC<ElementProps> = ({ to, icon, label, badge, className = "" }) => (
	<NavLink
		to={to}
		className={({ isActive }) =>
			`sidebar__item${isActive ? " sidebar__item--active" : ""} ${className}`
		}
	>
		{icon && <span className="sidebar__item-icon">{icon}</span>}
		<span className="sidebar__item-label">{label}</span>
		{badge !== undefined && badge > 0 && (
			<span className="sidebar__item-badge">{badge}</span>
		)}
	</NavLink>
)

// ─── Iniciales ────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
	return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()
}

// ─── User dropdown ────────────────────────────────────────────────────────────

const UserDropdown = ({ user }: { user: User }) => {
	const [open, setOpen] = useState(false)
	const [changePasswordOpen, setChangePasswordOpen] = useState(false)
	const [currentPassword, setCurrentPassword] = useState("")
	const [newPassword, setNewPassword] = useState("")
	const [confirmPassword, setConfirmPassword] = useState("")
	const [pwError, setPwError] = useState<string | null>(null)
	const [pwSubmitting, setPwSubmitting] = useState(false)
	const wrapperRef = useRef<HTMLDivElement>(null)
	const navigate = useNavigate()
	const setUser: AuthStoreActions['setUser'] = useAuthStore.getState().setUser
	// Cerrar al hacer click fuera
	useEffect(() => {
		const handle = (e: MouseEvent) => {
			if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
				setOpen(false)
			}
		}
		document.addEventListener("mousedown", handle)
		return () => document.removeEventListener("mousedown", handle)
	}, [])

	// Cerrar con Escape
	useEffect(() => {
		const handle = (e: KeyboardEvent) => {
			if (e.key === "Escape") setOpen(false)
		}
		document.addEventListener("keydown", handle)
		return () => document.removeEventListener("keydown", handle)
	}, [])

	const handleLogout = () => {
		setUser(undefined)
		localStorage.clear();
		navigate("/login", { replace: true })
	}

	const handleChangePassword = async () => {
		setPwError(null)
		if (!currentPassword || !newPassword || !confirmPassword) {
			setPwError("Rellena todos los campos")
			return
		}
		if (newPassword !== confirmPassword) {
			setPwError("Las contraseñas no coinciden")
			return
		}
		if (newPassword.length < 8) {
			setPwError("La nueva contraseña debe tener al menos 8 caracteres")
			return
		}

		setPwSubmitting(true)
		try {
			const res = await fetch(API(`users/${user.userId}/password`), {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ currentPassword, newPassword }),
			})
			if (!res.ok) {
				const body = await res.json().catch(() => ({}))
				setPwError(body.message ?? "Contraseña actual incorrecta")
				return
			}
			setChangePasswordOpen(false)
			setCurrentPassword("")
			setNewPassword("")
			setConfirmPassword("")
		} catch {
			setPwError("No se pudo conectar con el servidor")
		} finally {
			setPwSubmitting(false)
		}
	}

	const handleClosePasswordModal = () => {
		setChangePasswordOpen(false)
		setCurrentPassword("")
		setNewPassword("")
		setConfirmPassword("")
		setPwError(null)
	}

	return (
		<div ref={wrapperRef} style={{ position: "relative" }}>
			{/* Botón footer */}
			<button
				className="sidebar__user"
				onClick={() => setOpen((prev) => !prev)}
				style={{ width: "100%", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
			>
				<div className="sidebar__avatar">{getInitials(user.username)}</div>
				<div className="sidebar__user-info">
					<span className="sidebar__user-name">{user.username}</span>
					<span className="sidebar__user-role">{user.role}</span>
				</div>
				{/* Chevron */}
				<svg
					width="12" height="12" viewBox="0 0 12 12" fill="none"
					style={{
						flexShrink: 0,
						opacity: 0.4,
						transform: open ? "rotate(180deg)" : "rotate(0deg)",
						transition: "transform 0.15s ease",
					}}
				>
					<path d="M2 4.5L6 8.5L10 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
				</svg>
			</button>

			{/* Dropdown */}
			{open && (
				<div style={{
					position: "absolute",
					bottom: "calc(100% + 6px)",
					left: 0,
					right: 0,
					background: "var(--color-bg-surface)",
					border: "1px solid var(--color-border)",
					borderRadius: "var(--radius-lg)",
					boxShadow: "var(--shadow-dropdown)",
					overflow: "hidden",
					zIndex: 50,
				}}>
					{/* Info del usuario */}
					<div style={{
						padding: "0.75rem 0.875rem",
						borderBottom: "1px solid var(--color-border)",
					}}>
						<div style={{ fontSize: "var(--text-sm)", fontWeight: 500, color: "var(--color-text-primary)" }}>
							{user.username}
						</div>
						<div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-secondary)", marginTop: 2 }}>
							{user.role}
						</div>
					</div>

					{/* Acciones */}
					<div style={{ padding: "0.375rem" }}>
						<button
							className="sidebar__item"
							style={{ width: "100%" }}
							onClick={() => { setOpen(false); setChangePasswordOpen(true) }}
						>
							<span className="sidebar__item-icon">
								<svg width="14" height="14" viewBox="0 0 14 14" fill="none">
									<rect x="3" y="6" width="8" height="7" rx="1" stroke="currentColor" strokeWidth="1.2" />
									<path d="M5 6V4a2 2 0 014 0v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
									<circle cx="7" cy="9.5" r="1" fill="currentColor" />
								</svg>
							</span>
							<span className="sidebar__item-label">Cambiar contraseña</span>
						</button>

						<div style={{ height: 1, background: "var(--color-border)", margin: "0.25rem 0" }} />

						<button
							className="sidebar__item"
							style={{ width: "100%", color: "var(--color-exit-dark)" }}
							onClick={handleLogout}
						>
							<span className="sidebar__item-icon">
								<svg width="14" height="14" viewBox="0 0 14 14" fill="none">
									<path d="M5 2H2a1 1 0 00-1 1v8a1 1 0 001 1h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
									<path d="M9 10l3-3-3-3M12 7H5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
								</svg>
							</span>
							<span className="sidebar__item-label">Cerrar sesión</span>
						</button>
					</div>
				</div>
			)}

			{/* Modal cambiar contraseña */}
			<Modal
				title="Cambiar contraseña"
				isOpen={changePasswordOpen}
				onClose={handleClosePasswordModal}
				onAccept={handleChangePassword}
				acceptLabel={pwSubmitting ? "Guardando..." : "Guardar"}
			>
				<div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
					<div className="form-group">
						<label className="form-label">Contraseña actual</label>
						<input
							className="input"
							type="password"
							value={currentPassword}
							onChange={(e) => setCurrentPassword(e.target.value)}
							autoFocus
						/>
					</div>
					<div className="form-group">
						<label className="form-label">Nueva contraseña</label>
						<input
							className="input"
							type="password"
							value={newPassword}
							onChange={(e) => setNewPassword(e.target.value)}
						/>
						<span className="form-hint">Mínimo 8 caracteres</span>
					</div>
					<div className="form-group">
						<label className="form-label">Confirmar nueva contraseña</label>
						<input
							className={`input${confirmPassword && confirmPassword !== newPassword ? " is-error" : ""}`}
							type="password"
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
						/>
					</div>
					{pwError && (
						<div className="alert-bar alert-bar-danger">{pwError}</div>
					)}
				</div>
			</Modal>
		</div>
	)
}

// ─── Alert query (Suspense) ───────────────────────────────────────────────────

const alertQuery = fetch(API("products/alerts")).then((a) => a.json())

// ─── Componente principal ─────────────────────────────────────────────────────

const SidebarBase: React.FC<SidebarProps> = ({ extra, user }) => {
	const isAdmin = user?.role === "ADMIN"
	const alertCount = use(alertQuery).length

	return (
		<nav className="sidebar col-start-1">
			{/* Header */}
			<div className="sidebar__header">
				<div className="sidebar__logo">
					<div className="sidebar__logo-icon">
						<IconBox />
					</div>
					<span className="sidebar__logo-text">StockMate</span>
				</div>
			</div>

			{/* Menú */}
			<menu className="sidebar__menu">
				<Group label="General">
					<Element to="/dashboard" icon={<IconDashboard />} label="Dashboard" />
					<Element to="/movements" icon={<IconMovements />} label="Movimientos" />
				</Group>

				{isAdmin && (
					<Group label="Backoffice">
						<Element to="/admin/products" icon={<IconBox />} label="Productos" />
						<Element
							to="/admin/alerts"
							icon={
								<svg width="14" height="14" viewBox="0 0 14 14" fill="none">
									<path d="M7 1L13 12H1L7 1Z" stroke="currentColor" strokeWidth="1.2" fill="none" />
									<line x1="7" y1="5" x2="7" y2="8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
									<circle cx="7" cy="10.5" r="0.6" fill="currentColor" />
								</svg>
							}
							label="Alertas"
							badge={alertCount}
						/>
						<Element
							to="/admin/users"
							icon={
								<svg width="14" height="14" viewBox="0 0 14 14" fill="none">
									<path d="M1 11c0-2.21 2.69-4 6-4s6 1.79 6 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
									<circle cx="7" cy="4.5" r="2.5" stroke="currentColor" strokeWidth="1.2" />
								</svg>
							}
							label="Usuarios"
						/>
						<Element
							to="/admin/categories"
							icon={
								<svg width="14" height="14" viewBox="0 0 14 14" fill="none">
									<path d="M2 4h10M4 4V2.5A.5.5 0 014.5 2h5a.5.5 0 01.5.5V4M3 4l.75 7.5h6.5L11 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
								</svg>
							}
							label="Categorías"
						/>
					</Group>
				)}

				{extra}
			</menu>

			{/* Footer — dropdown de usuario */}
			<footer className="sidebar__footer">
				{user
					? <UserDropdown user={user} />
					: null
				}
			</footer>
		</nav>
	)
}

export const Sidebar = SidebarBase as SidebarComponent
Sidebar.Group = Group
Sidebar.Element = Element
