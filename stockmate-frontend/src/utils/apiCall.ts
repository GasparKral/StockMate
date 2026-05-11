import { certificate } from "./sendCertificatedRequest";

export function API(url: string): Request;
export function API(url: string, params: Record<string, any>): Request;
export function API(
  url: string,
  body: Record<string, any>,
  method: "POST" | "PUT" | "PATCH",
): Request;
export function API(
  url: string,
  params: Record<string, any>,
  method: "DELETE",
): Request;

// Implementación
export function API(
  endpoint: string,
  paramsOrBody?: Record<string, any>,
  methodOrUndefined?: "POST" | "PUT" | "DELETE" | "PATCH",
): Request {
  // Detectar el caso de uso basado en los argumentos
  let params: Record<string, any> | undefined;
  let body: Record<string, any> | undefined;
  let method: "GET" | "POST" | "DELETE" | "PUT" | "PATCH" = "GET";

  // Caso 1: API(url) - GET sin parámetros
  if (paramsOrBody === undefined) {
    method = "GET";
  }
  // Caso 2: API(url, params) - GET con parámetros
  else if (methodOrUndefined === undefined) {
    method = "GET";
    params = paramsOrBody;
  }
  // Caso 3: API(url, body, "POST") o API(url, body, "PUT") o API(url,body,"PATCH")
  else if (
    methodOrUndefined === "POST" ||
    methodOrUndefined === "PUT" ||
    methodOrUndefined === "PATCH"
  ) {
    method = methodOrUndefined;
    body = paramsOrBody;
  }
  // Caso 4: API(url, params, "DELETE") - DELETE con parámetros
  else if (methodOrUndefined === "DELETE") {
    method = "DELETE";
    params = paramsOrBody;
  }

  // Construir la URL base
  let url =
    (import.meta.env.DEV ? "http://localhost:8080" : "") +
    `/api/v1/${endpoint}`;

  // Agregar parámetros a la URL si existen (para GET y DELETE)
  if (params && Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (typeof value === "object") {
          searchParams.append(key, JSON.stringify(value));
        } else {
          searchParams.append(key, String(value));
        }
      }
    });

    url += `?${searchParams.toString()}`;
  }

  // Configurar la request
  const requestInit: RequestInit = { method };

  // Agregar body solo si existe (para POST y PUT)
  if (body) {
    requestInit.headers = {
      "Content-Type": "application/json",
    };
    requestInit.body = JSON.stringify(body);
  }

  return certificate(new Request(url, requestInit));
}
