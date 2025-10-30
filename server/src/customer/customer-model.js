
const mongoose = require("mongoose");
const { Schema } = mongoose;

const customersSchema = new Schema(
    {
        customerId: { type: String, unique: true },
        createdByEmail: {
            name: { type: String },
            email: { type: String },
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        mobile: {
            type: String,
            trim: true,
        },
        address: {
            type: String,
            trim: true,
        },
        totalAMCs: {
            type: Number,
            default: 0,
        },
        activeAMCs: {
            type: Number,
            default: 0,
        },
        totalSpent: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

const Customers = mongoose.model("Customers", customersSchema);
module.exports = Customers;