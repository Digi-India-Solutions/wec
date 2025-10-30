const catchAsyncErrors = require("../../middleware/catchAsyncErrors");
const sendResponse = require("../../middleware/response");
const ErrorHandler = require("../../utils/ErrorHandler");
const Claims = require("./claims-model");
const { deleteLocalFile } = require("../../middleware/DeleteImageFromLoaclFolder");
const { uploadImage, deleteImage } = require("../../middleware/Uploads");


// ✅ Create Claim
exports.createClaimByAdmin = catchAsyncErrors(async (req, res, next) => {
    try {
        console.log("req.body::===>", req.body);
        let imageUrl = null;
        console.log("req.body:YYY:===>", req.file);
        if (req.file) {
            const localImagePath = req.file.path;
            imageUrl = await uploadImage(localImagePath);
            deleteLocalFile(localImagePath);
        }
        const claim = await Claims.create({ ...req.body, billPhoto: imageUrl, createdByEmail: JSON.parse(req.body.createdByEmail) });
        res.status(200).json({ status: true, message: 'Claim created successfully', data: claim });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});

// ✅ Get Claims (with pagination, search, status)
exports.getClaimByAdminWithPagination = catchAsyncErrors(async (req, res, next) => {
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
                { customerName: searchRegex },
                { amcNumber: searchRegex },
                { bankName: searchRegex },
                { accountHolderName: searchRegex },
            ];
        }

        const total = await Claims.countDocuments(filter);
        const totalClaims = await Claims.countDocuments();
        const totalPendingClaims = await Claims.countDocuments({ status: "pending" });
        const totalApprovedClaims = await Claims.countDocuments({ status: "approved" });
        const totalRejectedClaims = await Claims.countDocuments({ status: "rejected" });

        const claims = await Claims.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        const totalPages = Math.ceil(total / limit);

        res.status(200).json({
            status: true, message: 'Claims fetched successfully', data: claims,
            pagination: {
                totalApprovedClaims,
                totalRejectedClaims,
                totalPendingClaims,
                totalClaims,
                total,
                totalPages,
                currentPage: page,
                pageSize: limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
        });

        // return sendResponse(res, true, 200, "Claims fetched successfully", {
        //     claims,
        //     pagination: {
        //         total,
        //         totalPages,
        //         currentPage: page,
        //         pageSize: limit,
        //         hasNextPage: page < totalPages,
        //         hasPrevPage: page > 1,
        //     },
        // });

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});

// ✅ Update Claim
exports.updateClaimByAdmin = catchAsyncErrors(async (req, res, next) => {
    try {
        const { id } = req.params;
        const { billPhoto } = req.body;
        console.log("BODY::===>", req.body);
        console.log("BODY::===>", req.file);
        const existingClaim = await Claims.findById(id);
        console.log("existingClaim::===>", existingClaim);

        if (!existingClaim) {
            return next(new ErrorHandler("Claim not found", 404));
        }
        let imageUrls = null;
        if (req.file) {
            if (existingClaim.billPhoto) {
                await deleteImage(existingClaim.billPhoto);
            }
            const localImagePath = req.file.path;
            const imageUrl = await uploadImage(localImagePath);
            deleteLocalFile(localImagePath);
            imageUrls = imageUrl;
        } else {
            imageUrls = existingClaim.billPhoto
        }

        const updatedClaim = await Claims.findByIdAndUpdate(id, { ...req.body, billPhoto: imageUrls }, {
            new: true,
            runValidators: true,
        });
        res.status(200).json({ status: true, message: 'Claim updated successfully', data: updatedClaim });

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});

// ✅ Delete Claim
exports.deleteClaimByAdmin = catchAsyncErrors(async (req, res, next) => {
    try {
        const { id } = req.params;
        const existingClaim = await Claims.findById(id);
        if (existingClaim.billPhoto) {
            await deleteImage(existingClaim.billPhoto);
        }

        const deletedClaim = await Claims.findByIdAndDelete(id);

        if (!deletedClaim) {
            return next(new ErrorHandler("Claim not found", 404));
        }
        
        res.status(200).json({ status: true, message: 'Claim deleted successfully', data: deletedClaim });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});

exports.changeStatusClaimByAdmin = catchAsyncErrors(async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const updatedClaim = await Claims.findByIdAndUpdate(id, { status }, {
            new: true,
            runValidators: true,
        });
        res.status(200).json({ status: true, message: 'Claim updated successfully', data: updatedClaim });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
})