const express = require("express");
const router = express.Router();

const {
    createCustomerByAdmin,
    getCustomerByAdminWithPagination,
    updateCustomerByAdmin,
    deleteCustomerByAdmin,
    exportCustomersByAdmin
} = require("./customer-controller");

router.post("/create-customer-by-admin", createCustomerByAdmin);

router.get("/get-customer-by-admin-with-pagination", getCustomerByAdminWithPagination);

router.post("/update-customer-by-admin/:id", updateCustomerByAdmin);

router.get("/delete-customer-by-admin/:id", deleteCustomerByAdmin);

router.get("/export-customers", exportCustomersByAdmin);

module.exports = router;
