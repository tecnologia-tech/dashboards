const BASE_URL = "http://localhost:3001/api";

export async function getDashGeralCS() {
  const res = await fetch(`${BASE_URL}/dash_geralcs`);
  if (!res.ok) throw new Error("Erro ao buscar dados");
  return res.json();
}
export async function getDashOnboarding() {
  const res = await fetch("http://localhost:3001/api/dash_onboarding");
  if (!res.ok) throw new Error("Erro ao buscar dash_onboarding");
  return res.json();
}
