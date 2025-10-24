const express = require("express");
const router = express.Router();
const upload =  require('../../middleware/multer')

const { createCategoryByAdmin, getCategoryByAdminWithPagination, updateCategoryByAdmin, deleteCategoryByAdmin,getAllCategory } = require("./category-controller");

router.post("/create-category-by-admin", createCategoryByAdmin);

router.get("/get-category-by-admin-with-pagination", getCategoryByAdminWithPagination);

router.get("/get-All-category", getAllCategory);

router.post("/update-category-by-admin/:id", updateCategoryByAdmin);

router.get("/delete-category-by-admin/:id", deleteCategoryByAdmin);

module.exports = router;
