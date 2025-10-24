const express = require("express");
const router = express.Router();

const {
  createTransactionByAdmin,
  getTransactionByAdminWithPagination,
  updateTransactionByAdmin,
  deleteTransactionByAdmin,
  getAllTransactions,
} = require("./transaction-controller");

// CRUD Routes
router.post("/create-transaction-by-admin", createTransactionByAdmin);
router.get("/get-transaction-by-admin-with-pagination", getTransactionByAdminWithPagination);
router.get("/get-all-transactions", getAllTransactions);
router.post("/update-transaction-by-admin/:id", updateTransactionByAdmin);
router.get("/delete-transaction-by-admin/:id", deleteTransactionByAdmin);

module.exports = router;
