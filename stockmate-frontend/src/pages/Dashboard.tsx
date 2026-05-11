import type { Resume } from "@/types/resume";
import type { StockMovement } from "@/types/movements";

import Layout from "@/layouts/layout";
import CreateMovement from "@/components/modals/usecases/createMovement";

import { ErrorBoundary } from "@/components/generics/errorBounds";
import { TopBar } from "@/layouts/topbar";
import { useState, useEffect } from "react";
import { transcurredTime } from "@/utils/transcurredTime";
import { Link, NavLink } from "react-router";
import { API } from "@/utils/apiCall";
import { useAuthStore } from "@/stores/auth";

const Dashboard = () => {
	const [movements, setMovements] = useState<StockMovement[]>([]);
	const [resume, setResume] = useState<Resume | null>(null);
	const [open, setOpen] = useState(false);

	useEffect(() => {
		fetch(API("movements", { pageSize: 10, page: 0 }))
			.then(m => m.json())
			.then(setMovements);

		fetch(API("products/resume"))
			.then(p => p.json())
			.then(setResume);

	}, []);

	const last_movements = movements.sort((a, b) =>
		new Date(b.registeredAt).getDate() - new Date(a.registeredAt).getDate());

	const last_entries = last_movements.filter(m => m.type === "ENTRY");
	const last_exits = last_movements.filter(m => m.type === "EXIT");

	if (!resume) return (
		<Layout
			topbar={[
				<TopBar.Title key="dashboard-title" text="Panel de control" description="Una vista general al estado del almacen" />,
				<TopBar.Element key="dashboard-button-action">
					<button className="btn btn-ghost" onClick={() => setOpen(true)}>
						+ agregar nuevo movimiento
					</button>
				</TopBar.Element>
			]}
		></Layout>
	);

	return (
		<Layout
			topbar={[
				<TopBar.Title key="dashboard-title" text="Panel de control" description="Una vista general al estado del almacen" />,
				<TopBar.Element key="dashboard-button-action">
					<button className="btn btn-ghost" onClick={() => setOpen(true)}>
						+ agregar nuevo movimiento
					</button>
				</TopBar.Element>
			]}
		>
			<CreateMovement isOpen={open} onClose={() => setOpen(false)} />
			<div className="">
				<div className="alert-bar alert-bar-warning mb-8">
					{resume.alertCount} productos por debajo del stock mínimo {useAuthStore.getState().user?.role == "ADMIN" && <NavLink to="/admin/alerts">ver alertas</NavLink>}
				</div>
				<ErrorBoundary
					fallback={<span>Cargando Información...</span>}
					onError={(e) => <span className="form-error">A ocurrido un error al cargar: {e}</span>}
				>
					<div className="metrics-grid">
						<article className="metric-card">
							<span className="metric-card__label">PRODUCTOS ACTIVOS</span>
							<span className="metric-card__value">{movements.length}</span>
							<span className="metric-card__sub text-entry">+{resume.totalProducts} esta semana</span>
						</article>
						<article className="metric-card">
							<span className="metric-card__label">ALERTA DE STOCK</span>
							<span className="metric-card__value">{resume.alertCount}</span>
							<span className="metric-card__sub text-exit-dark">Requieren de atención</span>
						</article>
						<article className="metric-card">
							<span className="metric-card__label">MOVIMIENTOS HOY</span>
							<span className="metric-card__value">{last_movements.length}</span>
							<span className="metric-card__sub text-text-secondary">{last_entries.length} entradas · {last_exits.length} salidas</span>
						</article>
						<article className="metric-card">
							<span className="metric-card__label">VALOR EN STOCK</span>
							<span className="metric-card__value">{resume.totalProductsValue} €</span>
							<span className="metric-card__sub text-text-secondary">Precio unitario x stock</span>
						</article>
					</div>
				</ErrorBoundary>
				<ErrorBoundary
					fallback={<span>Cargando movimientos...</span>}
					onError={(e) => <span className="form-error">A ocurrido un error al cargar los datos: {e}</span>}
				>
					<header className="card-header justify-around">
						<h2>Últimos movimientos</h2>
						<Link className="btn btn-ghost" to="/movements">+ Ver todos</Link>
					</header>
					<div className="table-wrapper">
						<table className="table">
							<thead>
								<tr>
									<th>sku</th>
									<th>producto</th>
									<th>Tipo</th>
									<th>Cantidad</th>
									<th>Motivo</th>
									<th>Usuario</th>
									<th>Cuando</th>
								</tr>
							</thead>
							<tbody className="min-h-50">
								{last_movements.slice(0, 5).map(m => (
									<tr key={m.id} className={m.type === "ENTRY" ? "badge-entry" : "badge-exit"}>
										<td>{m.product.sku}</td>
										<td>{m.product.name}</td>
										<td>{m.type === "ENTRY" ? "Entrada" : "Salida"}</td>
										<td className={m.quantity > 0 ? "text-entry" : "text-exit-dark"}>{m.quantity}</td>
										<td>{m.reason}</td>
										<td>{m.registeredBy.fullName}</td>
										<td>{transcurredTime(new Date(m.registeredAt))}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</ErrorBoundary>
			</div>
		</Layout >
	);
};

export default Dashboard;
