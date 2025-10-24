const catchAsyncErrors = require("../../middleware/catchAsyncErrors");
const sendResponse = require("../../middleware/response");
const ErrorHandler = require("../../utils/ErrorHandler");
const Categorys = require("./category-model");
const { deleteLocalFile } = require("../../middleware/DeleteImageFromLoaclFolder");
const { uploadImage, deleteImage } = require("../../middleware/Uploads");


// ✅ Create Category
exports.createCategoryByAdmin = catchAsyncErrors(async (req, res, next) => {
    try {
        // console.log("req.body::===>", req.body);
        const category = await Categorys.create({ ...req.body });
        res.status(200).json({ status: true, message: 'Category created successfully', data: category });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});

// ✅ Get Category (with pagination, search, status)
exports.getCategoryByAdminWithPagination = catchAsyncErrors(async (req, res, next) => {
    try {
        let { page = 1, limit = 10, search = "", status = "" } = req.query;
        page = Math.max(1, parseInt(page, 10));
        limit = Math.max(1, parseInt(limit, 10));

        const filter = {};

        if (status && status !== "all") {
            filter.status = new RegExp(`^${status}$`, "i");
        }

        if (search && search.trim() !== "") {
            const searchRegex = new RegExp(search.trim(), "i");
            filter.$or = [
                { name: searchRegex },
                { description: searchRegex },
            ];
        }

        const total = await Categorys.countDocuments(filter);
        const totalCategorys = await Categorys.countDocuments();
        const totalPendingCategorys = await Categorys.countDocuments({ status: "active" });
        const totalApprovedCategorys = await Categorys.countDocuments({ status: "inactive" });

        const categorys = await Categorys.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean();

        const totalPages = Math.ceil(total / limit);

        res.status(200).json({
            status: true, message: 'Categorys fetched successfully', data: categorys,
            pagination: {
                totalApprovedCategorys,
                totalPendingCategorys,
                totalCategorys,
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

exports.getAllCategory = catchAsyncErrors(async (req, res, next) => {
    try {
        const categorys = await Categorys.find().sort({ createdAt: -1 })
        res.status(200).json({ status: true, message: 'Categorys fetched successfully', data: categorys, });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
})
// ✅ Update Category
exports.updateCategoryByAdmin = catchAsyncErrors(async (req, res, next) => {
    try {
        const { id } = req.params;
        const updatedClaim = await Categorys.findByIdAndUpdate(id, req.body, {
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

// ✅ Delete Category
exports.deleteCategoryByAdmin = catchAsyncErrors(async (req, res, next) => {
    try {
        const { id } = req.params;
        const deletedClaim = await Categorys.findByIdAndDelete(id);

        if (!deletedClaim) {
            return next(new ErrorHandler("Claim not found", 404));
        }
        res.status(200).json({ status: true, message: 'Claim deleted successfully', data: deletedClaim });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});
