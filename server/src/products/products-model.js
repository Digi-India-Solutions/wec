const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    productName: { type: String, required: true },
    sku: { type: String, unique: true, required: true },
    categoryId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
    mainCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'MainCategory' },
    type: { type: String, required: true },
    price: Number,
    images: [String],
    status: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

productSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Product', productSchema);
