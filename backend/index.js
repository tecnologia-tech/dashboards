app.get("/api/estornos_nutshell", async (req, res) => {
  res.json(await fetchTableData("estornos_nutshell"));
});
