export function transcurredTime(fechaInicio: Date) {
  const ahora = new Date();
  const pasado = new Date(fechaInicio);
  const diferenciaMs = ahora.getTime() - pasado.getTime();

  if (diferenciaMs < 0) return "fecha futura";
  if (diferenciaMs < 5000) return "hace unos segundos";

  const segundos = Math.floor(diferenciaMs / 1000);
  const minutos = Math.floor(segundos / 60);
  const horas = Math.floor(minutos / 60);
  const dias = Math.floor(horas / 24);
  const meses = Math.floor(dias / 30);
  const años = Math.floor(dias / 365);

  if (años > 0) return `${años} año${años !== 1 ? "s" : ""} atrás`;
  if (meses > 0) return `${meses} mes${meses !== 1 ? "es" : ""} atrás`;
  if (dias > 0) return `${dias} día${dias !== 1 ? "s" : ""} atrás`;
  if (horas > 0) return `${horas} hora${horas !== 1 ? "s" : ""} atrás`;
  if (minutos > 0) return `${minutos} minuto${minutos !== 1 ? "s" : ""} atrás`;
  return `${segundos} segundo${segundos !== 1 ? "s" : ""} atrás`;
}
