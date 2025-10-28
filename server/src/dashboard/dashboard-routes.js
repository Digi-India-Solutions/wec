const express = require("express");
const router = express.Router();
const upload = require('../../middleware/multer');
const { getAllAmcTotal } = require("./dashboard-controller");

router.get("/get-all-amc-total", getAllAmcTotal);

module.exports = router;
