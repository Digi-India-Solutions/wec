const express = require("express");
const router = express.Router();
const upload =  require('../../middleware/multer')

const { createClaimByAdmin, getClaimByAdminWithPagination, updateClaimByAdmin, deleteClaimByAdmin, } = require("./claims-controller");

router.post("/create-claim-by-admin",upload.single("billPhoto"), createClaimByAdmin);

router.get("/get-claim-by-admin-with-pagination", getClaimByAdminWithPagination);

router.post("/update-claim-by-admin/:id", updateClaimByAdmin);

router.get("/delete-claim-by-admin/:id", deleteClaimByAdmin);

module.exports = router;
