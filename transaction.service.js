require("dotenv").config();
const { format } = require("date-fns");

function formatDate(date) {
  return format(new Date(date), "dd/MM/yyyy");
}
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
  connection.connect(function (err) {
    if (err) {
      console.log(`connectionRequest Failed ${err.stack}`);
    } else {
      console.log(`DB connectionRequest Successful ${connection.threadId}`);
    }
  });
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
    const formattedStartDate = formatDate(startDate);
    const formattedEndDate = formatDate(endDate);
    const [rows] = await connection.execute(
      "SELECT * FROM Transaction WHERE type = ? AND DATE_FORMAT(createdAt, '%d/%m/%Y') BETWEEN ? AND ?",
      [type, formattedStartDate, formattedEndDate]
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
