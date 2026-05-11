import Login from "@/pages/auth/Login"
import Dashboard from "@/pages/Dashboard"
import Movements from "@/pages/Movements"
import Products from "@/pages/Products"
import Users from "@/pages/Users"
import Alerts from "@/pages/Alerts"
import Categories from "@/pages/Categories"

import { Route, BrowserRouter, Routes, Navigate, Outlet } from "react-router"
import { useAuthStore, type User } from "./stores/auth"

export default function RoutesManager() {

	return (
		<BrowserRouter>
			<Routes>
				{/* Pública */}
				<Route index element={<Dashboard />} />
				<Route path="/login" element={<Login />} />

				{/* OPERATOR + ADMIN */}
				<Route element={<ProtectedRoute allowedRoles={['OPERATOR', 'ADMIN']} />}>
					<Route path="/dashboard" element={<Dashboard />} />
					<Route path="/movements" element={<Movements />} />
				</Route>

				{/* Solo ADMIN */}
				<Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
					<Route path="/admin/products" element={<Products />} />
					<Route path="/admin/users" element={<Users />} />
					<Route path="/admin/alerts" element={<Alerts />} />
					<Route path="/admin/categories" element={<Categories />} />
				</Route>
			</Routes>
		</BrowserRouter>
	)
}

// src/router/ProtectedRoute.tsx
function ProtectedRoute({ allowedRoles }: { allowedRoles: User['role'][] }) {
	const { user } = useAuthStore.getState()
	if (!user) return <Navigate to="/login" replace />
	if (!allowedRoles.includes(user.role)) return <Navigate to="/dashboard" replace />

	return <Outlet />
}
