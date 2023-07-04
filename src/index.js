const express = require("express");
const transactionService = require("./transaction.service");

const app = express();
const port = 3000;

app.use(express.json());

transactionService
  .connectToDatabase()
  .then(() => {
    app.use("/transactions", require("./transaction.controller"));
    app.listen(port, () => {
      console.log(`Servidor rodando em http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("Erro ao conectar ao banco de dados:", error);
  });
