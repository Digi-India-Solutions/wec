const mongoose = require("mongoose");
const { Schema } = mongoose;

const claimsSchema = new Schema(
    {
        createdByEmail: {
            name: { type: String, },
            email: { type: String, }
        },
        customerName: {
            type: String,
            required: true,
            trim: true,
        },
        amcNumber: {
            type: String,
            required: true,
            trim: true,
        },
        claimValue: {
            type: Number,
            required: true,
        },
        productDetails: {
            type: String,
            required: true,
        },
        billPhoto: {
            type: String, // store image filename or path
            required: false,
        },
        accountHolderName: {
            type: String,
            required: true,
        },
        bankName: {
            type: String,
            required: true,
        },
        accountNumber: {
            type: String,
            required: true,
        },
        ifscCode: {
            type: String,
            required: true,
        },
        remarks: {
            type: String,
            default: "",
        },
        status: {
            type: String,
            //   enum: ["pending", "approved", "rejected"],
            default: "pending",
        },
    },
    {
        timestamps: true, // automatically adds createdAt, updatedAt
    }
);

const Claims = mongoose.model("Claims", claimsSchema);
module.exports = Claims;
