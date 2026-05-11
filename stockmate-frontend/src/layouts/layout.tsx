import React, { type ReactNode } from "react"
import { Toaster } from "sonner"
import { Sidebar } from "./sidebar"
import { TopBar } from "./topbar"
import { useAuthStore, type User } from "@/stores/auth"

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface LayoutProps {
	/** Clase CSS adicional para el <main> */
	className?: string
	/** Contenido del TopBar — usa <TopBar.Title> y <TopBar.Element> */
	topbar?: ReactNode
	/** Grupos o elementos extra para el sidebar, renderizados tras el grupo General.
	 *  Usa <Sidebar.Group> o <Sidebar.Element> directamente.
	 *
	 *  Ejemplo:
	 *  sidebarExtra={
	 *    <Sidebar.Group label="Filtros">
	 *      <Sidebar.Element to="/movements?type=ENTRY" label="Solo entradas" />
	 *    </Sidebar.Group>
	 *  }
	 */
	sidebarExtra?: ReactNode
	/** Datos del usuario en sesión (del AuthContext) */
	user?: User
	/** Número de alertas activas — badge en el item Alertas del sidebar */
	alertCount?: number
	children?: ReactNode
}

// ─── Componente ───────────────────────────────────────────────────────────────

const Layout: React.FC<LayoutProps> = ({
	className,
	topbar,
	sidebarExtra,
	alertCount,
	children,
}) => {
	return (
		<div className="app-shell">
			<Toaster position="top-center" richColors />

			{/* Sidebar — columna izquierda del grid */}
			<Sidebar
				user={useAuthStore.getState().user}
				alertCount={alertCount}
				extra={sidebarExtra}
			/>

			{/* Columna derecha: topbar + contenido */}
			<div className="main-content">
				{topbar && (
					<TopBar>
						{topbar}
					</TopBar>
				)}

				<main className={`page${className ? ` ${className}` : ""}`}>
					{children}
				</main>
			</div>
		</div>
	)
}

export default Layout

// ─── Uso de ejemplo ───────────────────────────────────────────────────────────
//
// Caso básico (sin extras):
//
//   <Layout user={user} alertCount={7}
//     topbar={<TopBar.Title text="Dashboard" description="Resumen de stock" />}
//   >
//     <DashboardContent />
//   </Layout>
//
// Con elementos extra en el sidebar (pantalla de movimientos con filtro rápido):
//
//   <Layout
//     user={user}
//     topbar={
//       <>
//         <TopBar.Title text="Movimientos" />
//         <TopBar.Element>
//           <button className="btn btn-primary" onClick={...}>+ Registrar</button>
//         </TopBar.Element>
//       </>
//     }
//     sidebarExtra={
//       <Sidebar.Group label="Filtros rápidos">
//         <Sidebar.Element to="/movements?type=ENTRY" label="Solo entradas" />
//         <Sidebar.Element to="/movements?type=EXIT"  label="Solo salidas"  />
//       </Sidebar.Group>
//     }
//   >
//     <MovementsTable />
//   </Layout>
