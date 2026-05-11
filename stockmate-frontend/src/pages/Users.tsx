import type { UserInfo } from "@/types/userInfo";

import Layout from "@/layouts/layout";
import Modal from "@/components/generics/modal";

import { TopBar } from "@/layouts/topbar";
import { useEffect, useState } from "react";
import { API } from "@/utils/apiCall";

// ─── Estado de carga ──────────────────────────────────────────────────────────

type LoadState = "loading" | "error" | "ok"

// ─── Utilidades ───────────────────────────────────────────────────────────────

function getInitials(name: string): string {
	return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()
}

function formatDate(iso: string): string {
	return new Intl.DateTimeFormat("es-ES", { dateStyle: "medium" }).format(new Date(iso))
}

// ─── Skeleton de tarjeta ──────────────────────────────────────────────────────

const UserCardSkeleton = () => (
	<article className="card">
		<div className="card-header">
			<div className="skeleton" style={{ width: 32, height: 32, borderRadius: "50%" }} />
			<div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
				<div className="skeleton" style={{ height: 13, width: "60%", borderRadius: 4 }} />
				<div className="skeleton" style={{ height: 11, width: "40%", borderRadius: 4 }} />
			</div>
		</div>
	</article>
)

// ─── Tarjeta de usuario ───────────────────────────────────────────────────────

const UserCard = ({
	user,
	onChangeRole,
	onToggleStatus,
}: {
	user: UserInfo
	onChangeRole: (user: UserInfo) => void
	onToggleStatus: (user: UserInfo) => void
}) => {
	const isActive = user.status === "ACTIVE"
	const isAdmin = user.role === "ADMIN"

	return (
		<article className="card" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
			{/* Header: avatar + nombre + rol */}
			<header className="card-header" style={{ alignItems: "flex-start" }}>
				<div className="avatar mr-2" style={{ width: 36, height: 36, fontSize: 13, flexShrink: 0 }}>
					{getInitials(user.fullName)}
				</div>
				<div style={{ flex: 1, minWidth: 0 }}>
					<div style={{ display: "flex", alignItems: "center", gap: 6 }}>
						<span style={{ fontWeight: 500, fontSize: "var(--text-sm)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
							{user.fullName}
						</span>
						{/* Indicador de estado activo/inactivo */}
						<span
							title={isActive ? "Activo" : "Desactivado"}
							style={{
								width: 7,
								height: 7,
								borderRadius: "50%",
								flexShrink: 0,
								backgroundColor: isActive ? "var(--color-entry)" : "var(--color-text-hint)",
							}}
						/>
					</div>
					<span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-secondary)", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: "10px" }}>
						{user.email}
					</span>
				</div>
				<span className={`badge ${isAdmin ? "badge-admin" : "badge-operator"}`}>
					{user.role}
				</span>
			</header>

			{/* Fecha de alta */}
			<div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-secondary)" }}>
				Alta: {formatDate(user.createdAt)}
			</div>

			{/* Acciones */}
			<div style={{ display: "flex", gap: 6 }}>
				<button
					className="btn btn-ghost btn-sm"
					style={{ flex: 1 }}
					onClick={() => onChangeRole(user)}
				>
					{isAdmin ? "Quitar admin" : "Hacer admin"}
				</button>
				<button
					className={`btn btn-sm ${isActive ? "btn-danger" : "btn-secondary"}`}
					style={{ flex: 1 }}
					onClick={() => onToggleStatus(user)}
				>
					{isActive ? "Desactivar" : "Activar"}
				</button>
			</div>
		</article>
	)
}

const UsersTopbar = ({ onNew }: { onNew: () => void }) => (
	<>
		<TopBar.Title
			text="Usuarios"
			description="Controla permisos y acceso de los usuarios"
		/>
		<TopBar.Element>
			<button className="btn btn-primary" onClick={onNew}>
				<svg width="12" height="12" viewBox="0 0 12 12" fill="none">
					<path d="M6 1v10M1 6h10" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
				</svg>
				Nuevo usuario
			</button>
		</TopBar.Element>
	</>
)

const Users = () => {
	const [users, setUsers] = useState<UserInfo[]>([])
	const [loadState, setLoadState] = useState<LoadState>("loading")
	const [confirmModal, setConfirmModal] = useState<{
		type: "role" | "status"
		user: UserInfo
	} | null>(null)
	const [newUserModal, setNewUserModal] = useState(false)

	useEffect(() => {
		setLoadState("loading")
		fetch(API("users"))
			.then((r) => {
				if (!r.ok) throw new Error()
				return r.json()
			})
			.then((data) => {
				setUsers(data)
				setLoadState("ok")
			})
			.catch(() => setLoadState("error"))
	}, [])

	const handleChangeRole = (user: UserInfo) => setConfirmModal({ type: "role", user })
	const handleToggleStatus = (user: UserInfo) => setConfirmModal({ type: "status", user })

	const handleConfirm = () => {
		if (!confirmModal) return
		const { type, user } = confirmModal

		if (type === "role") {
			const newRole = user.role === "ADMIN" ? "OPERATOR" : "ADMIN"
			fetch(API(`users/${user.id}/role`, { role: newRole }, 'PATCH')).then(() => {
				setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, role: newRole } : u))
			})
		} else {
			const newStatus = user.status === "ACTIVE" ? "DISABLED" : "ACTIVE"
			fetch(API(`users/${user.id}/status`, { status: newStatus }, "PATCH")).then(() => {
				setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, status: newStatus } : u))
			})
		}

		setConfirmModal(null)
	}

	// ─── Estados de carga y error ────────────────────────────────────────────────

	if (loadState === "loading") {
		return (
			<Layout topbar={<UsersTopbar onNew={() => setNewUserModal(true)} />}>
				<div className="metrics-grid" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
					{Array.from({ length: 6 }).map((_, i) => <UserCardSkeleton key={i} />)}
				</div>
			</Layout>
		)
	}

	if (loadState === "error") {
		return (
			<Layout topbar={<UsersTopbar onNew={() => setNewUserModal(true)} />}>
				<div className="alert-bar alert-bar-warning">
					Hubo un problema al cargar los usuarios. Intenta recargar la página.
				</div>
			</Layout>
		)
	}

	// ─── Empty state ──────────────────────────────────────────────────────────────

	if (users.length === 0) {
		return (
			<Layout topbar={<UsersTopbar onNew={() => setNewUserModal(true)} />}>
				<div className="empty-state">
					<span className="empty-state__title">Sin usuarios</span>
					<span className="empty-state__description">
						Crea el primer usuario con el botón "Nuevo usuario".
					</span>
				</div>
			</Layout>
		)
	}

	// ─── Vista principal ──────────────────────────────────────────────────────────

	const confirmText = confirmModal
		? confirmModal.type === "role"
			? `¿Cambiar el rol de ${confirmModal.user.fullName} a ${confirmModal.user.role === "ADMIN" ? "OPERATOR" : "ADMIN"}?`
			: `¿${confirmModal.user.status === "ACTIVE" ? "Desactivar" : "Activar"} la cuenta de ${confirmModal.user.fullName}?`
		: ""

	return (
		<Layout topbar={<UsersTopbar onNew={() => setNewUserModal(true)} />}>
			<section
				className="metrics-grid"
				style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}
			>
				{users.map((u) => (
					<UserCard
						key={u.id}
						user={u}
						onChangeRole={handleChangeRole}
						onToggleStatus={handleToggleStatus}
					/>
				))}
			</section>

			{/* Modal de confirmación de acciones */}
			<Modal
				title="Confirmar acción"
				isOpen={confirmModal !== null}
				onClose={() => setConfirmModal(null)}
				onAccept={handleConfirm}
				acceptLabel="Confirmar"
				acceptVariant={confirmModal?.type === "status" && confirmModal.user.status === "ACTIVE" ? "btn-danger" : "btn-primary"}
			>
				<p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)" }}>
					{confirmText}
				</p>
			</Modal>

			{/* Modal de nuevo usuario — placeholder hasta tener el formulario */}
			<Modal
				title="Nuevo usuario"
				isOpen={newUserModal}
				onClose={() => setNewUserModal(false)}
				onAccept={() => setNewUserModal(false)}
				acceptLabel="Crear usuario"
			>
				<p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)" }}>
					Formulario de nuevo usuario — pendiente de implementar.
				</p>
			</Modal>
		</Layout>
	)
}

export default Users
