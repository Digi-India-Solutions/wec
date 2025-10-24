const express = require("express");
const router = express.Router();
const upload = require('../../middleware/multer')

const {
    createAmcByAdmin,
    getAmcByAdminWithPagination,
    getAmcByRetailerWithPagination,
    getAmcByDistributorWithPagination,
    updateAmcByAdmin,
    deleteAmcByAdmin,
} = require("./amcs-controller");

router.post("/create-amc-by-admin", upload.single("purchaseProof"), createAmcByAdmin);

router.get("/get-amc-by-admin-with-pagination", getAmcByAdminWithPagination);

router.get("/get-amc-by-retailer-with-pagination/:id", getAmcByRetailerWithPagination);

router.get("/get-amc-by-distributor-with-pagination/:id", getAmcByDistributorWithPagination);

// router.post("/update-amc-by-admin/:id", upload.single("purchaseProof"), updateAmcByAdmin);

// router.get("/delete-amc-by-admin/:id", deleteAmcByAdmin);

module.exports = router;
