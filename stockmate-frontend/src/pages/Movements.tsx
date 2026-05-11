import type { StockMovement } from "@/types/movements";

import type { Category } from "@/types/categories";

import CreateMovement from "@/components/modals/usecases/createMovement";
import Layout from "@/layouts/layout";
import Pagination from "@/components/generics/pagination";

import { ErrorBoundary } from "@/components/generics/errorBounds";
import { TopBar } from "@/layouts/topbar";
import { transcurredTime } from "@/utils/transcurredTime";
import { use, useEffect, useState } from "react";
import { API } from "@/utils/apiCall";

const categories_query = fetch(API("categories")).then(c => c.json());

const Movements = () => {

	const [movements, setMovements] = useState<StockMovement[]>([]);
	const categories: Category[] = use(categories_query);

	const [filter, setFilter] = useState<{ name: string, category: string }>({ name: "", category: "" });

	const handleNameFilter = (value: string) => {
		setFilter(prev => ({ ...prev, name: value }));
	};

	const handleCategoryFilter = (value: string) => {
		setFilter(prev => ({ ...prev, category: value }));
	};

	// Filtrar movimientos
	const filteredMovements = movements.filter(m => {
		const matchName = filter.name === "" ||
			m.product.name.toLowerCase().includes(filter.name.toLowerCase());
		const matchCategory = filter.category === "" ||
			m.product.category === filter.category;
		return matchName && matchCategory;
	});


	const [open, setOpen] = useState(false);
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(25);

	const totalPages = Math.ceil(movements.length / pageSize)

	useEffect(() => {
		fetch(API("movements", { pageSize, page: page - 1 }))
			.then(m => m.json())
			.then(setMovements);

	}, [page, pageSize]);


	return (
		<Layout
			topbar={[
				<TopBar.Title key="movements-title" text="Movimientos" description="Muestreo de todos los movimientos" />,
				<TopBar.Element key="movements-button-action"><button className="btn btn-ghost"
					onClick={() => setOpen(true)}>
					+ agregar nuevo movimiento
				</button>
				</TopBar.Element >]}
		>
			<CreateMovement isOpen={open} onClose={() => setOpen(false)} />


			<ErrorBoundary
				onError={e => <div className="alert-bar alert-bar-danger">A ocurrido un error al cargar los datos:{e}</div>}
				fallback={<span>Cargando los datos...</span>}
			>
				<div className="table-wrapper">
					<form className="bg-bg-muted p-3" onSubmit={e => e.preventDefault()}>
						<fieldset className="flex gap-4">
							<label className="form-label">Nombre del articulo
								<input
									className="input"
									type="text"
									onChange={(e) => handleNameFilter(e.target.value)}
									value={filter.name}
								/>
							</label>
							<label className="form-label">Categorias
								<ErrorBoundary
									fallback={<select className="select" disabled><option>Cargando...</option></select>}
									onError={_ => <select className="select" disabled><option>Error al cargar categorias</option></select>}
								>
									<select
										className="select"
										onChange={(e) => handleCategoryFilter(e.target.value)}
										value={filter.category}
									>
										<option value="">Todas</option>
										{categories.map(c => (
											<option key={c.id} value={c.name}>{c.name}</option>
										))}
									</select>
								</ErrorBoundary>
							</label>
							<label className="form-label">
								Número de movimientos
								<input
									className="input"
									type="number"
									value={pageSize}
									onChange={e => {
										let value = parseInt(e.target.value);
										if (isNaN(value)) { value = 1 }
										setPageSize(value)
									}
									}
									min={1}
									max={100}
									step={1}
								/>
							</label>
						</fieldset>
					</form>
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
							{filteredMovements
								.sort((a, b) =>
									new Date(b.registeredAt) - new Date(a.registeredAt))
								.map(m => (
									<tr key={m.id} className={m.type == 'ENTRY' ? "badge-entry" : "badge-exit"}>
										<td>{m.product.sku}</td>
										<td>{m.product.name}</td>
										<td>{m.type == 'ENTRY' ? "Entrada" : "Salida"}</td>
										<td className={m.quantity > 0 ? "text-entry" : "text-exit-dark"}>{m.quantity}</td>
										<td>{m.reason}</td>
										<td>{m.registeredBy.fullName}</td>
										<td>{transcurredTime(new Date(m.registeredAt))}</td>
									</tr>
								))}
							{filteredMovements.length === 0 && (
								<tr>
									<td colSpan={7} className="text-center">No hay movimientos que coincidan con los filtros</td>
								</tr>
							)}
						</tbody>
					</table>
					<div className="bg-bg-muted py-2 px-4 flex justify-end border-t border-t-border">
						<Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
					</div>
				</div>
			</ErrorBoundary>
		</Layout >
	)
}

export default Movements;
