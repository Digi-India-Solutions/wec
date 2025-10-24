const catchAsyncErrors = require("../../middleware/catchAsyncErrors");
const sendResponse = require("../../middleware/response");
const ErrorHandler = require("../../utils/ErrorHandler");
const Brands = require("./brand-model");
const { deleteLocalFile } = require("../../middleware/DeleteImageFromLoaclFolder");
const { uploadImage, deleteImage } = require("../../middleware/Uploads");


// ✅ Create brands
exports.createBrandByAdmin = catchAsyncErrors(async (req, res, next) => {
    try {
        // console.log("req.body::===>", req.body);
        const brand = await Brands.create({ ...req.body });
        res.status(200).json({ status: true, message: 'Brand created successfully', data: brand });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});

// ✅ Get brand (with pagination, search, status)
exports.getBrandByAdminWithPagination = catchAsyncErrors(async (req, res, next) => {
    try {
        let { page = 1, limit = 10, search = "", status = "", category = "" } = req.query;
        page = Math.max(1, parseInt(page, 10));
        limit = Math.max(1, parseInt(limit, 10));

        const filter = {};

        if (status && status !== "all") {
            filter.status = new RegExp(`^${status}$`, "i");
        }
        if (category && category !== "all") {
            filter.categoryId = new RegExp(`^${category}$`, "i");
        }
        if (search && search.trim() !== "") {
            const searchRegex = new RegExp(search.trim(), "i");
            filter.$or = [
                { name: searchRegex },
                { categoryId: searchRegex },
            ];
        }

        const total = await Brands.countDocuments(filter);
        const totalBrands = await Brands.countDocuments();
        const totalPendingBrands = await Brands.countDocuments({ status: "active" });
        const totalApprovedBrands = await Brands.countDocuments({ status: "inactive" });

        const brands = await Brands.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).populate("categoryIds").lean();

        const totalPages = Math.ceil(total / limit);

        res.status(200).json({
            status: true, message: 'Brands fetched successfully', data: brands,
            pagination: {
                totalApprovedBrands,
                totalPendingBrands,
                totalBrands,
                total,
                totalPages,
                currentPage: page,
                pageSize: limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
        });

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});

exports.getAllBrand = catchAsyncErrors(async (req, res, next) => {
    try {
        const brands = await Brands.find().sort({ createdAt: -1 }).populate("categoryIds")
        res.status(200).json({ status: true, message: 'brands fetched successfully', data: brands, });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
})
// ✅ Update brand
exports.updateBrandByAdmin = catchAsyncErrors(async (req, res, next) => {
    try {
        const { id } = req.params;
        const updatedClaim = await Brands.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!updatedClaim) {
            return next(new ErrorHandler("Claim not found", 404));
        }
        res.status(200).json({ status: true, message: 'Claim updated successfully', data: updatedClaim });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});

exports.getBrandByCategory = catchAsyncErrors(async (req, res, next) => {
    try {
        const { id } = req.params;
        const brands = await Brands.find({ categoryIds: id }).sort({ createdAt: -1 }).populate("categoryIds")
        res.status(200).json({ status: true, message: 'brands fetched successfully', data: brands, });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
})

// ✅ Delete brand
exports.deleteBrandByAdmin = catchAsyncErrors(async (req, res, next) => {
    try {
        const { id } = req.params;
        const deletedClaim = await Brands.findByIdAndDelete(id);

        if (!deletedClaim) {
            return next(new ErrorHandler("Claim not found", 404));
        }
        res.status(200).json({ status: true, message: 'Claim deleted successfully', data: deletedClaim });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});
