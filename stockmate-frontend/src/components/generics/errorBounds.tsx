import { Component, type ReactNode } from "react";

// Error Boundary genérico
interface ErrorBoundaryProps {
	children?: ReactNode;
	onError: (msg: string) => void;
	fallback?: ReactNode;
}

interface ErrorBoundaryState {
	error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
	state: ErrorBoundaryState = { error: null };

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { error };
	}

	componentDidUpdate(_: ErrorBoundaryProps, prev: ErrorBoundaryState) {
		if (this.state.error && !prev.error) {
			this.props.onError(this.state.error.message);
		}
	}

	render(): ReactNode {
		if (this.state.error) return this.props.fallback ?? null;
		return this.props.children;
	}
}
