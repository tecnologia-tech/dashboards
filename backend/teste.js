// Função para ajustar a data para o horário de Brasília (UTC-3)
function adjustDateForBrasilia(isoString, leadId) {
  if (!isoString || typeof isoString !== "string") return null;

  // Converter a data de ISO para objeto Date (no formato UTC)
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return null; // Se a data não for válida, retorna null

  // Log da data original para debug
  console.log(
    `🚨 Lead ${
      leadId || "Desconhecido"
    } - Data original da API: ${d.toISOString()}`
  );

  // Ajuste de fuso horário para Brasília (subtrair 3 horas de UTC)
  const adjustedDate = new Date(d.getTime() - 3 * 60 * 60 * 1000); // Subtração de 3 horas para UTC-3

  // Verificação da hora ajustada para Brasília
  const datePart = adjustedDate.toISOString().slice(0, 10); // YYYY-MM-DD
  const timePart = adjustedDate.toISOString().slice(11, 19); // HH:mm:ss

  const finalDate = `${datePart} ${timePart}`;

  // Exibe a data ajustada para o horário de Brasília
  console.log(
    `✅ Lead ${
      leadId || "Desconhecido"
    } - Data ajustada para Brasília: ${finalDate}`
  );

  return finalDate; // Retorna a data ajustada para o banco
}

// Teste com exemplo
const leadData = "2025-11-05T21:57:03.000Z"; // Data original em UTC (da API)
const leadId = 797039; // Exemplo de ID da lead
const adjustedData = adjustDateForBrasilia(leadData, leadId);
console.log("Resultado ajustado: ", adjustedData);
