const express = require("express");
const router = express.Router();

const { createBrandByAdmin, getBrandByAdminWithPagination, updateBrandByAdmin, deleteBrandByAdmin,getAllBrand,getBrandByCategory } = require("./brand-controller");

router.post("/create-brand-by-admin", createBrandByAdmin);

router.get("/get-brand-by-admin-with-pagination", getBrandByAdminWithPagination);

router.get("/get-All-brand", getAllBrand);

router.get("/get-brand-by-category/:id", getBrandByCategory);

router.post("/update-brand-by-admin/:id", updateBrandByAdmin);

router.get("/delete-brand-by-admin/:id", deleteBrandByAdmin);

module.exports = router;
