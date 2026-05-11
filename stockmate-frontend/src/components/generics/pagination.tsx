interface PaginationProps {
	page: number;
	totalPages: number;
	onPageChange: (page: number) => void;
}

const Pagination = ({ page, totalPages, onPageChange }: PaginationProps) => {
	const getPages = () => {
		const delta = 1;
		const range: number[] = [];
		for (let i = Math.max(2, page - delta); i <= Math.min(totalPages - 1, page + delta); i++) {
			range.push(i);
		}
		const items: (number | "…")[] = [1];
		if (range[0] > 2) items.push("…");
		items.push(...range);
		if (range[range.length - 1] < totalPages - 1) items.push("…");
		if (totalPages > 1) items.push(totalPages);
		return items;
	};

	return (
		<div className="flex items-center gap-1">
			<button
				className="btn btn-sm btn-ghost"
				onClick={() => onPageChange(page - 1)}
				disabled={page === 1}
			>
				«
			</button>

			{getPages().map((p, i) =>
				p === "…" ? (
					<span key={`sep-${i}`} className="px-1 text-text-secondary">…</span>
				) : (
					<button
						key={p}
						className={`btn btn-sm ${p === page ? "btn-active" : "btn-ghost"}`}
						onClick={() => onPageChange(p)}
					>
						{p}
					</button>
				)
			)}

			<button
				className="btn btn-sm btn-ghost"
				onClick={() => onPageChange(page + 1)}
				disabled={page === totalPages}
			>
				»
			</button>
		</div>
	);
};

export default Pagination;
