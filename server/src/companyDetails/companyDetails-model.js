const mongoose = require("mongoose");
const { Schema } = mongoose;

const companySettingsSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String },
    address: { type: String },
    website: { type: String },
    logo: { type: String }, // URL (can be uploaded to Cloudinary or local)
    createdBy: { type: String }, // optional (admin email)
  },
  { timestamps: true }
);

const CompanySettings = mongoose.model("CompanySettings", companySettingsSchema);
module.exports = CompanySettings;
