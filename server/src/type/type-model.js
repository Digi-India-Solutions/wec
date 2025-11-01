const mongoose = require("mongoose");
const { Schema } = mongoose;

const typeSchema = new Schema(
    {
        createdByEmail: {
            name: { type: String, },
            email: { type: String, }
        },
        // brandIds: {
        //     type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true
        // },
        // brandId: {
        //     type: String
        // },
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

const Type = mongoose.model("Type", typeSchema);
module.exports = Type;
