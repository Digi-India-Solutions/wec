const mongoose = require("mongoose");
const { Schema } = mongoose;

const categorySchema = new Schema(
    {
        createdByEmail: {
            name: { type: String, },
            email: { type: String, }
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        typeNames: {
            type: [String],
            required: true,
        },
        // description: {
        //     type: String,
        //     required: true,
        //     trim: true,
        // },
        status: {
            type: String,
            default: "active",
        },
    },
    {
        timestamps: true, // automatically adds createdAt, updatedAt
    }
);

const Category = mongoose.model("Category", categorySchema);
module.exports = Category;
