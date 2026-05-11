export function certificate(request: Request): Request {
  const token = localStorage.getItem("authToken");

  request.headers.set("Authorization", `Bearer ${token}`);

  return request;
}
