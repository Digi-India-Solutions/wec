const express = require("express");
const router = express.Router();

const { createTypeByAdmin, getTypeByAdminWithPagination, updateTypeByAdmin, deleteTypeByAdmin,getAllType,getTypeByBrand } = require("./type-controller");

router.post("/create-type-by-admin", createTypeByAdmin);

router.get("/get-type-by-admin-with-pagination", getTypeByAdminWithPagination);

router.get("/get-All-type", getAllType);

router.get("/get-type-by-brand/:id", getTypeByBrand);

router.post("/update-type-by-admin/:id", updateTypeByAdmin);

router.get("/delete-type-by-admin/:id", deleteTypeByAdmin);

module.exports = router;
