import fetch from "node-fetch";

const username = "SEU_USERNAME";
const token = "SEU_TOKEN";
const auth = "Basic " + Buffer.from(`${username}:${token}`).toString("base64");

const payload = {
  jsonrpc: "2.0",
  method: "findLeads",
  params: { query: { status: 10 } },
  id: "1",
};

fetch("https://app.nutshell.com/api/v1/json", {
  method: "POST",
  headers: {
    Authorization: auth,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(payload),
})
  .then((res) => res.json())
  .then((data) => console.log("✅ Resposta:", data))
  .catch((err) => console.error("❌ Erro:", err.message));
