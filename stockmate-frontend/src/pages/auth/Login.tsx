import { useAuthStore, type User } from "@/stores/auth";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";

const Login = () => {
	const login = useAuthStore.getState().setUser;
	const navigate = useNavigate(); // Create navigate function
	const [showPassword, setShowPassword] = useState<boolean>(false);
	const [error, setError] = useState<null | string>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		inputRef.current?.focus({ focusVisible: true })
	}, [])

	return (
		<main className="main-content min-h-screen">
			<form className="card w-2xl m-auto grid grid-cols-6 grid-rows-[auto_auto_auto_minmax(0,24px)_minmax(0,30px)] gap-y-2"
				onSubmit={async (e) => { // Make this async
					e.preventDefault();
					setError(null);
					await TryLogin({
						onSuccess: (user) => {
							login(user);
							navigate("/dashboard");
						},
						onError: (errorMessage) => setError(errorMessage)
					});
				}}
			>
				<h1 className="form-title col-span-5">Inicio de Sesión</h1>
				<label className="form-label col-span-3 row-start-2">Email
					<input ref={inputRef} className="input" name="username" id="username" type="text" placeholder="Introduce tu correo electronico" />
				</label>
				<label className="form-label col-span-3 row-start-3">Contraseña
					<input className="input" name="password" id="password" type={showPassword ? "text" : "password"} placeholder="Introduce tu contraseña" />
				</label>
				<button className="btn btn-ghost col-start-4 row-start-3 self-end my-1 items-center justify-center mx-4" type="button"
					onClick={() => setShowPassword(prev => !prev)}
				>
					{showPassword ? "Ocultar" : "Mostrar"}
				</button>
				{error && <p className="form-error col-span-6 row-start-4">{error}</p>}
				<button className="btn btn-primary col-start-3 col-span-2 row-start-5 " type="submit">Iniciar Sesion</button>
			</form>
		</main>
	)
}

export default Login;

async function TryLogin({ onSuccess, onError }: { onSuccess: (user: User) => void, onError: (error: string) => void }) { // Fixed typo
	const username = document.getElementById("username") as HTMLInputElement;
	const password = document.getElementById("password") as HTMLInputElement;

	try {
		const response = await fetch(import.meta.env.MODE == "development" ? "http://localhost:8080/api/auth/login" : "/api/auth/login", {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ username: username.value, password: password.value })
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
		}

		const data = await response.json();
		localStorage.setItem("authToken", data.token);
		onSuccess({ userId: data.userId, username: data.username, role: data.role });
	} catch (error) {
		onError(error instanceof Error ? error.message : "Error desconocido");
	}
}
