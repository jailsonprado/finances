const express = require("express");
const transactionService = require("../service/transaction.service");

const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    const { value, type, description } = req.body;
    const transaction = await transactionService.createTransaction(
      value,
      type,
      description
    );
    res.json(transaction);
  } catch (error) {
    next(error);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const transactions = await transactionService.getAllTransactions();
    res.json(transactions);
  } catch (error) {
    next(error);
  }
});

router.get("/type/:type", async (req, res, next) => {
  try {
    const { type } = req.params;
    const transactions = await transactionService.getTransactionsByType(type);
    res.json(transactions);
  } catch (error) {
    next(error);
  }
});

router.get("/type/:type/range", async (req, res, next) => {
  try {
    const { type } = req.params;
    const { startDate, endDate } = req.query;
    const transactions =
      await transactionService.getTransactionsByTypeAndDateRange(
        type,
        startDate,
        endDate
      );
    res.json(transactions);
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { createdAt, type, value, description } = req.body;
    const transaction = await transactionService.updateTransaction(id, {
      createdAt,
      type,
      value,
      description,
    });
    if (transaction) {
      res.json(transaction);
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const transaction = await transactionService.deleteTransaction(id);
    if (transaction) {
      res.json(transaction);
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
