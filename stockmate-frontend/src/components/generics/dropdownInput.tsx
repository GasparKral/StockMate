import { useEffect, useState, useRef, useCallback } from "react"

interface DropdownInputProps<T> {
	label?: string
	placeholder?: string
	/** Función de búsqueda — envolver en useCallback en el padre para evitar bucles */
	onSearch: (searchTerm: string) => Promise<T[]>
	onChange: (value: T) => void
	initialValue?: T
	/** Cómo extraer el texto visible de un item. Por defecto busca `.name` o llama a String() */
	getDisplayValue?: (item: T) => string
	/** Mínimo de caracteres para lanzar la búsqueda. Por defecto 2 */
	minChars?: number
	/** Milisegundos de debounce. Por defecto 300 */
	debounce?: number
	disabled?: boolean
}

function DropdownInput<T extends { id?: string | number }>({
	label,
	placeholder = "Buscar...",
	onSearch,
	onChange,
	initialValue,
	getDisplayValue = (item) => (item as any).name ?? String(item),
	minChars = 2,
	debounce = 300,
	disabled = false,
}: DropdownInputProps<T>) {
	const [searchTerm, setSearchTerm] = useState(
		initialValue ? getDisplayValue(initialValue) : ""
	)
	const [options, setOptions] = useState<T[]>([])
	const [isOpen, setIsOpen] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const wrapperRef = useRef<HTMLDivElement>(null)

	// Ref para onSearch — evita bucle en useEffect sin exigir useCallback al padre
	const onSearchRef = useRef(onSearch)
	useEffect(() => { onSearchRef.current = onSearch }, [onSearch])

	// Cerrar al hacer click fuera
	useEffect(() => {
		const handle = (e: MouseEvent) => {
			if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
				setIsOpen(false)
			}
		}
		document.addEventListener("mousedown", handle)
		return () => document.removeEventListener("mousedown", handle)
	}, [])

	// Búsqueda con debounce
	useEffect(() => {
		if (searchTerm.length < minChars) {
			setOptions([])
			setIsOpen(false)
			return
		}

		const timer = setTimeout(async () => {
			setIsLoading(true)
			try {
				const results = await onSearchRef.current(searchTerm)
				setOptions(results)
				setIsOpen(true)
			} catch {
				setOptions([])
			} finally {
				setIsLoading(false)
			}
		}, debounce)

		return () => clearTimeout(timer)
	}, [searchTerm, minChars, debounce])

	const handleSelect = useCallback((item: T) => {
		setSearchTerm(getDisplayValue(item))
		setOptions([])
		setIsOpen(false)
		onChange(item)
	}, [getDisplayValue, onChange])

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(e.target.value)
		if (e.target.value.length < minChars) setIsOpen(false)
	}

	const input = (
		<input
			className="input"
			type="text"
			value={searchTerm}
			placeholder={placeholder}
			disabled={disabled}
			onChange={handleChange}
			onFocus={() => {
				if (searchTerm.length >= minChars && options.length > 0) setIsOpen(true)
			}}
		/>
	)

	const menu = isOpen && (options.length > 0 || isLoading) && (
		<div
			className="dropdown-menu"
			style={{ width: wrapperRef.current?.clientWidth }}
		>
			{isLoading ? (
				<div className="dropdown-menu__loading">Buscando...</div>
			) : (
				options.map((item, index) => (
					<div
						key={item.id ?? index}
						className="dropdown-menu__item"
						onMouseDown={(e) => e.preventDefault()}
						onClick={() => handleSelect(item)}
					>
						{getDisplayValue(item)}
					</div>
				))
			)}
		</div>
	)

	return (
		<div className="dropdown-input" ref={wrapperRef}>
			{label ? (
				<label className="form-label">
					{label}
					{input}
					{menu}
				</label>
			) : (
				<>
					{input}
					{menu}
				</>
			)}
		</div>
	)
}

export default DropdownInput

// ─── Ejemplos de uso ──────────────────────────────────────────────────────────
//
// Tipado explícito:
//   const searchProducts = useCallback(
//     (term: string) => api.get<Product[]>(`/products?search=${term}`),
//     []
//   )
//   <DropdownInput<Product>
//     label="Producto"
//     placeholder="Buscar por nombre o SKU..."
//     onSearch={searchProducts}
//     onChange={(p) => setProductId(p.id)}
//     getDisplayValue={(p) => `${p.sku} — ${p.name}`}
//   />
//
// Sin label:
//   <DropdownInput<Category>
//     placeholder="Filtrar por categoría..."
//     onSearch={searchCategories}
//     onChange={setCategory}
//     minChars={1}
//   />
