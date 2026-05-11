import React, { type ReactNode } from "react"

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface TopBarProps {
	children: ReactNode
}

interface TitleProps {
	/** Título principal de la página */
	text: string
	/** Subtítulo o descripción opcional */
	description?: string
}

interface ElementProps {
	children: ReactNode
}

type TopBarComponent = React.FC<TopBarProps> & {
	Title: React.FC<TitleProps>
	Element: React.FC<ElementProps>
}

// ─── Componente principal ─────────────────────────────────────────────────────

// El TopBar separa automáticamente el Title (anclado a la izquierda)
// del resto de Elements (agrupados a la derecha), sin que el
// componente padre tenga que gestionar el flex manualmente.

const TopBarBase: React.FC<TopBarProps> = ({ children }) => {
	const childrenArray = React.Children.toArray(children)

	const title = childrenArray.find(
		(child): child is React.ReactElement =>
			React.isValidElement(child) && child.type === TopBar.Title
	)

	const elements = childrenArray.filter(
		(child): child is React.ReactElement =>
			React.isValidElement(child) && child.type === TopBar.Element
	)

	return (
		<header className="topbar">
			{/* Título anclado a la izquierda */}
			<div className="topbar__left">
				{title}
			</div>

			{/* Acciones ancladas a la derecha */}
			{elements.length > 0 && (
				<div className="topbar__right">
					{elements}
				</div>
			)}
		</header>
	)
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

const Title: React.FC<TitleProps> = ({ text, description }) => (
	<div className="topbar__title-group">
		<h1 className="topbar__title">{text}</h1>
		{description && (
			<p className="topbar__description">{description}</p>
		)}
	</div>
)

const Element: React.FC<ElementProps> = ({ children }) => (
	<div className="topbar__element">
		{children}
	</div>
)

export const TopBar = TopBarBase as TopBarComponent
TopBar.Title = Title
TopBar.Element = Element
