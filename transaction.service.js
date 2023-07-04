require("dotenv").config();

const mysql = require("mysql2/promise");

let connection;

async function connectToDatabase() {
  connection = await mysql.createConnection({
    host: "finances1.mysql.uhserver.com",
    user: process.env.USERDATABASE,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
  });
  console.log("Conexão com o banco de dados estabelecida com sucesso");
}

async function createTransaction(value, type, description) {
  try {
    const [result] = await connection.execute(
      "INSERT INTO Transaction (value, type, description) VALUES (?, ?, ?)",
      [value, type, description]
    );
    const newTransactionId = result.insertId;
    console.log("Transação criada com sucesso");
    return { id: newTransactionId, value, type, description };
  } catch (error) {
    console.error("Erro ao criar a transação:", error);
    throw error;
  }
}

async function getAllTransactions() {
  try {
    const [rows] = await connection.execute("SELECT * FROM Transaction");
    return rows;
  } catch (error) {
    console.error("Erro ao obter todas as transações:", error);
    throw error;
  }
}

async function getTransactionsByType(type) {
  try {
    const [rows] = await connection.execute(
      "SELECT * FROM Transaction WHERE type = ?",
      [type]
    );
    return rows;
  } catch (error) {
    console.error("Erro ao obter transações por tipo:", error);
    throw error;
  }
}

async function getTransactionsByTypeAndDateRange(type, startDate, endDate) {
  try {
    const [rows] = await connection.execute(
      "SELECT * FROM Transaction WHERE type = ? AND createdAt BETWEEN ? AND ?",
      [type, startDate, endDate]
    );
    return rows;
  } catch (error) {
    console.error(
      "Erro ao obter transações por tipo e intervalo de datas:",
      error
    );
    throw error;
  }
}

async function updateTransaction(id, data) {
  try {
    const [result] = await connection.execute(
      "UPDATE Transaction SET createdAt = ?, type = ?, value = ?, description = ? WHERE id = ?",
      [data.createdAt, data.type, data.value, data.description, id]
    );
    if (result.affectedRows === 1) {
      console.log("Transação atualizada com sucesso");
      return { id, ...data };
    }
    return null;
  } catch (error) {
    console.error("Erro ao atualizar a transação:", error);
    throw error;
  }
}

async function deleteTransaction(id) {
  try {
    const [result] = await connection.execute(
      "DELETE FROM Transaction WHERE id = ?",
      [id]
    );
    if (result.affectedRows === 1) {
      console.log("Transação excluída com sucesso");
      return { id };
    }
    return null;
  } catch (error) {
    console.error("Erro ao excluir a transação:", error);
    throw error;
  }
}

module.exports = {
  connectToDatabase,
  createTransaction,
  getAllTransactions,
  getTransactionsByType,
  getTransactionsByTypeAndDateRange,
  updateTransaction,
  deleteTransaction,
};
