const express = require("express");
const router = express.Router();
const upload = require('../../middleware/multer')

const { createClaimByAdmin, getClaimByAdminWithPagination, updateClaimByAdmin, deleteClaimByAdmin,changeStatusClaimByAdmin } = require("./claims-controller");

router.post("/create-claim-by-admin", upload.single("billPhoto"), createClaimByAdmin);

router.get("/get-claim-by-admin-with-pagination", getClaimByAdminWithPagination);

router.post("/update-claim-by-admin/:id", upload.single("billPhoto"), updateClaimByAdmin);

router.post("/change-status-claim-by-admin/:id", changeStatusClaimByAdmin);

router.get("/delete-claim-by-admin/:id", deleteClaimByAdmin);

module.exports = router;
