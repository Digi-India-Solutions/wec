const mongoose = require("mongoose");
const { Schema } = mongoose;

const brandSchema = new Schema(
    {
        createdByEmail: {
            name: { type: String, },
            email: { type: String, }
        },
        categoryIds: {
            type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true
        },
        categoryId: {
            type: String
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },

        status: {
            type: String,
            default: "active",
        },
    },
    {
        timestamps: true, // automatically adds createdAt, updatedAt
    }
);

const Brand = mongoose.model("Brand", brandSchema);
module.exports = Brand;
