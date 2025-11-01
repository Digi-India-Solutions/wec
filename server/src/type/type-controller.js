const catchAsyncErrors = require("../../middleware/catchAsyncErrors");
const sendResponse = require("../../middleware/response");
const ErrorHandler = require("../../utils/ErrorHandler");
const Types = require("./type-model");
const { deleteLocalFile } = require("../../middleware/DeleteImageFromLoaclFolder");
const { uploadImage, deleteImage } = require("../../middleware/Uploads");


// ✅ Create types
exports.createTypeByAdmin = catchAsyncErrors(async (req, res, next) => {
    try {
        // console.log("req.body::===>", req.body);
        const Type = await Types.create({ ...req.body });
        res.status(200).json({ status: true, message: 'Type created successfully', data: Type });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});

// ✅ Get Type (with pagination, search, status)
exports.getTypeByAdminWithPagination = catchAsyncErrors(async (req, res, next) => {
    try {
        let { page = 1, limit = 10, search = "", status = "", category = "", brand = "" } = req.query;
        page = Math.max(1, parseInt(page, 10));
        limit = Math.max(1, parseInt(limit, 10));

        const filter = {};

        if (status && status !== "all") {
            filter.status = new RegExp(`^${status}$`, "i");
        }
        if (category && category !== "all") {
            filter.categoryId = new RegExp(`^${category}$`, "i");
        }
        if (brand && brand !== "all") {
            filter.brandId = new RegExp(`^${brand}$`, "i");
        }
        if (search && search.trim() !== "") {
            const searchRegex = new RegExp(search.trim(), "i");
            filter.$or = [
                { name: searchRegex },
                { categoryId: searchRegex },
            ];
        }

        const total = await Types.countDocuments(filter);
        const totalTypes = await Types.countDocuments();
        const totalPendingTypes = await Types.countDocuments({ status: "active" });
        const totalApprovedTypes = await Types.countDocuments({ status: "inactive" });

        const types = await Types.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).populate("categoryIds").lean();

        const totalPages = Math.ceil(total / limit);

        res.status(200).json({
            status: true, message: 'Types fetched successfully', data: types,
            pagination: {
                totalApprovedTypes,
                totalPendingTypes,
                totalTypes,
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

exports.getAllType = catchAsyncErrors(async (req, res, next) => {
    try {
        const types = await Types.find().sort({ createdAt: -1 }).populate("categoryIds")
        res.status(200).json({ status: true, message: 'types fetched successfully', data: types, });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
})

exports.getTypeByBrand = catchAsyncErrors(async (req, res, next) => {
    try{
        const { id } = req.params;
        const types = await Types.find({ categoryIds: id }).sort({ createdAt: -1 }).populate("categoryIds")
        res.status(200).json({ status: true, message: 'types fetched successfully', data: types, });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
})
// ✅ Update Type
exports.updateTypeByAdmin = catchAsyncErrors(async (req, res, next) => {
    try {
        const { id } = req.params;
        const updatedClaim = await Types.findByIdAndUpdate(id, req.body, {
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

// ✅ Delete Type
exports.deleteTypeByAdmin = catchAsyncErrors(async (req, res, next) => {
    try {
        const { id } = req.params;
        const deletedClaim = await Types.findByIdAndDelete(id);

        if (!deletedClaim) {
            return next(new ErrorHandler("Claim not found", 404));
        }
        res.status(200).json({ status: true, message: 'Claim deleted successfully', data: deletedClaim });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});
