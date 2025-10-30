
const express = require("express");
const router = express.Router();
const upload = require("../../middleware/multer");

const { createOrUpdateCompanySettings, getCompanySettings, deleteCompanySettings, createOrUpdateAmcSettings, getAmcSettings, deleteAmcSettings } = require("./companyDetails-controller");

////////////////////////// Company Settings/////////////////////////////////////////////////////////////

router.post("/create-or-update-settings", upload.single("logo"), createOrUpdateCompanySettings);

router.get("/get-company-settings", getCompanySettings);

router.delete("/delete-settings", deleteCompanySettings);

//////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////// AMC Settings //////////////////////////////////////////////////////

router.post("/create-or-update-amc-settings", createOrUpdateAmcSettings);
router.get("/get-AMC-settings", getAmcSettings);
router.delete("/delete-amc-settings", deleteAmcSettings);

////////////////////////////////////////////////////////////////////////////////////////////////////////////
module.exports = router;
