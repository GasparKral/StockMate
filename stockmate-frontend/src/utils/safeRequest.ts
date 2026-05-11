export const safeFetch = (req: Request) =>
  fetch(req).then(async (res) => {
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
    }
    return res.json();
  });
