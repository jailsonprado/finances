require("dotenv").config();
const { format } = require("date-fns");
const winston = require("winston");
const { createPool } = require("mysql2/promise");

// Configuração do logger
const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "error.log" }),
  ],
});

let pool;

async function connectToDatabase() {
  try {
    pool = createPool({
      host: "finances1.mysql.uhserver.com",
      user: process.env.USERDATABASE,
      password: process.env.PASSWORD,
      database: process.env.DATABASE,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      debug: false,
    });

    console.log("Conexão com o banco de dados estabelecida com sucesso");
  } catch (error) {
    console.error("Erro ao conectar ao banco de dados:", error);
    logger.error("Erro ao conectar ao banco de dados:", error);
    throw error;
  }
}

function formatDate(date) {
  return format(new Date(date), "dd/MM/yyyy");
}

async function createTransaction(value, type, description) {
  let connection;

  try {
    connection = await pool.getConnection();
    const [result] = await connection.execute(
      "INSERT INTO Transaction (value, type, description) VALUES (?, ?, ?)",
      [value, type, description]
    );
    const newTransactionId = result.insertId;
    console.log("Transação criada com sucesso");
    return { id: newTransactionId, value, type, description };
  } catch (error) {
    console.error("Erro ao criar a transação:", error);
    logger.error("Erro ao criar a transação:", error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

async function getAllTransactions() {
  let connection;

  try {
    connection = await pool.getConnection();
    const [rows] = await connection.execute("SELECT * FROM Transaction");
    return rows;
  } catch (error) {
    console.error("Erro ao obter todas as transações:", error);
    logger.error("Erro ao obter todas as transações:", error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

async function getTransactionsByType(type) {
  let connection;

  try {
    connection = await pool.getConnection();
    const [rows] = await connection.execute(
      "SELECT * FROM Transaction WHERE type = ?",
      [type]
    );
    return rows;
  } catch (error) {
    console.error("Erro ao obter transações por tipo:", error);
    logger.error("Erro ao obter transações por tipo:", error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

async function getTransactionsByTypeAndDateRange(type, startDate, endDate) {
  let connection;

  try {
    connection = await pool.getConnection();
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
    logger.error(
      "Erro ao obter transações por tipo e intervalo de datas:",
      error
    );
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

async function getTransactionsByDateRange(startDate, endDate) {
  let connection;

  try {
    connection = await pool.getConnection();
    const formattedStartDate = formatDate(startDate);
    const formattedEndDate = formatDate(endDate);
    const [rows] = await connection.execute(
      "SELECT * FROM Transaction WHERE DATE_FORMAT(createdAt, '%d/%m/%Y') BETWEEN ? AND ?",
      [formattedStartDate, formattedEndDate]
    );
    return rows;
  } catch (error) {
    console.error("Erro ao obter transações por intervalo de datas:", error);
    logger.error("Erro ao obter transações por intervalo de datas:", error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

async function updateTransaction(id, data) {
  let connection;

  try {
    connection = await pool.getConnection();
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
    logger.error("Erro ao atualizar a transação:", error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

async function deleteTransaction(id) {
  let connection;

  try {
    connection = await pool.getConnection();
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
    logger.error("Erro ao excluir a transação:", error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

module.exports = {
  connectToDatabase,
  createTransaction,
  getAllTransactions,
  getTransactionsByType,
  getTransactionsByTypeAndDateRange,
  getTransactionsByDateRange,
  updateTransaction,
  deleteTransaction,
};
