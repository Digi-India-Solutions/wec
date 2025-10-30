const catchAsyncErrors = require("../../middleware/catchAsyncErrors");
const sendResponse = require("../../middleware/response");
const ErrorHandler = require("../../utils/ErrorHandler");
const AMC = require("./amcs-model");
const { deleteLocalFile } = require("../../middleware/DeleteImageFromLoaclFolder");
const { uploadImage } = require("../../middleware/Uploads");
const mongoose = require("mongoose");
const SuperAdmin = require("../super-admin/super-admin-model");
const { createTransactionByAdmin } = require("../transaction/transaction-controller");
const transactionModel = require("../transaction/transaction-model");
const Customers = require("../customer/customer-model");

exports.createAmcByAdmin = catchAsyncErrors(async (req, res, next) => {
    try {
        console.log("Incoming AMC Create Request:=>", req.body);

        const { userId, purchaseValue, amcPercentage, amcAmount } = req.body;

        // ✅ Validate essential fields
        if (!userId || !purchaseValue || !amcPercentage || !amcAmount) {
            return next(new ErrorHandler("Missing required fields", 400));
        }

        // ✅ Fetch user (distributor/retailer)
        const user = await SuperAdmin.findById(userId);
        if (!user) {
            return next(new ErrorHandler("User not found", 404));
        }

        if (user.walletBalance < amcAmount) {
            return res.status(200).json({ status: false, massage: "Insufficient wallet balance please add amount" });
        }
        // ✅ Prepare transaction object
        const newTransaction = {
            id: Date.now().toString(),
            userId: user._id,
            userType: user.role,
            userName: user.name,
            userEmail: user.email,
            type: "debit",
            amount: Number(amcAmount),
            description: `Wallet Debit - ${amcPercentage}% of ₹${Number(purchaseValue).toLocaleString()} / (AMC Created (ID:-${req?.body?.id || ""}))`,
            clientAmount: Number(purchaseValue),
            percentage: Number(amcPercentage),
            createdBy: `${user?.name || "System"}`,
            createdByEmail: { name: user?.name, email: user?.email, role: user?.role },
            createdDate: new Date(),
            balanceAfter: (user.walletBalance || 0) - Number(amcAmount),
        };

        const { type, amount } = newTransaction;

        // 2️⃣ Determine New Wallet Balance
        let newWalletBalance = user.walletBalance || 0;

        if (type === "credit") {
            newWalletBalance += parseFloat(amount);
        } else if (type === "debit") {
            newWalletBalance -= parseFloat(amount);
            if (newWalletBalance < 0) newWalletBalance = 0; // Prevent negative balance
        }

        // 3️⃣ Update Wallet Balance
        user.walletBalance = newWalletBalance;
        if (user.totalAMCs >= 0) {
            user.totalAMCs += 1;
        }

        await user.save();

        // 4️⃣ Create Transaction Record
        const transaction = await transactionModel.create({
            ...newTransaction,
            balanceAfter: newWalletBalance,
            createdByEmail: newTransaction.createdByEmail || {},
        });

        console.log("transaction", transaction);

        // ✅ Clean up optional ObjectId fields
        const objectIdFields = ["retailerId", "distributorId", "categoryId", "brandId", "typeId"];
        for (const field of objectIdFields) {
            if (!req.body[field] || req.body[field].trim() === "") {
                req.body[field] = null;
            }
        }

        // ✅ Parse createdByEmail safely (if stringified)
        if (req.body.createdByEmail && typeof req.body.createdByEmail === "string") {
            try {
                req.body.createdByEmail = JSON.parse(req.body.createdByEmail);
            } catch {
                req.body.createdByEmail = { name: "", email: "" };
            }
        }
        console.log("req.FILES::===>", req.files);
        // ✅ Handle file upload (optional)
        let imageUrl = null;
        let imageUrl2 = null;

        if (req.files.purchaseProof) {
            const localImagePath = req.files.purchaseProof[0].path;
            imageUrl = await uploadImage(localImagePath);
            deleteLocalFile(localImagePath);
            console.log("🖼️ Uploaded image path:", imageUrl);
        }
        if (req.files.productPicture) {
            const localImagePath = req.files.productPicture[0].path;
            imageUrl2 = await uploadImage(localImagePath);
            deleteLocalFile(localImagePath);
            console.log("🖼️ Uploaded image path:", imageUrl2);
        }

        // ✅ Convert and sanitize numeric fields
        req.body.purchaseValue = Number(purchaseValue) || 0;
        req.body.amcPercentage = Number(amcPercentage) || 0;
        req.body.amcAmount = Number(amcAmount) || 0;
        req.body.renewalCount = Number(req.body.renewalCount) || 0;

        // ✅ Create AMC record
        const amc = await AMC.create({
            ...req.body,
            purchaseProof: imageUrl,
            productPicture: imageUrl2,
            createdAt: new Date(),
        });

        // ✅ Update user’s wallet balance
        user.walletBalance = (user.walletBalance || 0) - Number(amcAmount);
        await user.save();

        // ✅ Respond success

        ///////////////////////////CUSTOMER UPDATE and CREATE///////////////////////////
        const ByEmail = typeof req.body.createdByEmail === "string" ? JSON.parse(req.body.createdByEmail) : req.body.createdByEmail;

        const customer = await Customers.findOne({ email: req.body.customerEmail });
        if (customer) {
            customer.totalAMCs += 1;
            customer.totalSpent += amcAmount;
            customer.activeAMCs = customer.activeAMCs >= 0 && req.body.status === 'active' ? customer.activeAMCs + 1 : customer.activeAMCs - 1;
            await customer.save();
        } else {
            await Customers.create({
                customerId: `CUSTOMER-${Math.floor(Math.random() * 100)}`,
                email: req.body.customerEmail, totalAMCs: 1, name: req.body.customerName,
                mobile: req.body.customerMobile, address: req.body.customerAddress, totalSpent: amcAmount,
                activeAMCs: req.body.status === 'active' ? 1 : 0,
                createdByEmail: ByEmail || null
            });
        }
        /////////////////////////////////////////////////////////////////////////////////////////
        res.status(200).json({ status: true, message: "AMC created successfully", data: amc, walletBalanceAfter: user.walletBalance, });

    } catch (error) {
        console.error("❌ Error creating AMC:", error);
        return next(new ErrorHandler(error.message || "Internal Server Error", 500));
    }
});
// ✅ Get AMC with pagination + search + status filter
exports.getAmcByAdminWithPagination = catchAsyncErrors(async (req, res, next) => {
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
                { id: searchRegex },
                { customerEmail: searchRegex },
                { customerMobile: searchRegex },
                { productCategory: searchRegex },
            ];
        }

        const total = await AMC.countDocuments(filter);
        const totalAMCs = await AMC.countDocuments();
        const totalExpiredAMCs = await AMC.countDocuments({ status: "expired" });
        const totalActiveAMCs = await AMC.countDocuments({ status: "active" });
        const totalExpiringSoonAMCs = await AMC.countDocuments({ status: "expiring_soon" });
        const amcs = await AMC.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean();

        const totalPages = Math.ceil(total / limit);

        res.status(200).json({
            status: true,
            message: "AMCs fetched successfully",
            data: amcs,
            pagination: {
                total,
                totalAMCs,
                totalExpiredAMCs,
                totalActiveAMCs,
                totalExpiringSoonAMCs,
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

exports.getAmcByRetailerWithPagination = catchAsyncErrors(async (req, res, next) => {
    try {
        const retailerId = req.params.id;
        let { page = 1, limit = 10, search = "", status = "", category = "" } = req.query;

        // ✅ Validate and sanitize pagination inputs
        page = Math.max(1, parseInt(page, 10));
        limit = Math.max(1, parseInt(limit, 10));

        // ✅ Base filter (for specific retailer)
        const filter = {};
        if (retailerId && mongoose.Types.ObjectId.isValid(retailerId)) {
            filter.retailerId = retailerId;
        } else {
            return next(new ErrorHandler("Invalid retailer ID", 400));
        }

        // ✅ Add status filter
        if (status && status.toLowerCase() !== "all") {
            filter.status = status.toLowerCase();
        }

        if (category && category.toLowerCase() !== "all") {
            filter.productCategory = category;
        }

        // ✅ Add search filter
        if (search && search.trim() !== "") {
            const searchRegex = new RegExp(search.trim(), "i");
            filter.$or = [
                { customerName: searchRegex },
                { id: searchRegex },
                { customerEmail: searchRegex },
                { customerMobile: searchRegex },
                { productCategory: searchRegex },
                { productBrand: searchRegex },
                { productType: searchRegex },
            ];
        }

        // ✅ Get paginated AMC data
        const [amcs, total, totalAMCs, totalExpiredAMCs, totalActiveAMCs, totalExpiringSoonAMCs] =
            await Promise.all([
                AMC.find(filter)
                    .sort({ createdAt: -1 })
                    .skip((page - 1) * limit)
                    .limit(limit)
                    .lean(),
                AMC.countDocuments(filter),
                AMC.countDocuments({ retailerId }),
                AMC.countDocuments({ retailerId, status: "expired" }),
                AMC.countDocuments({ retailerId, status: "active" }),
                AMC.countDocuments({ retailerId, status: "expiring_soon" }),
            ]);

        const totalPages = Math.ceil(total / limit);

        res.status(200).json({
            status: true,
            message: "AMCs fetched successfully",
            data: amcs,
            pagination: {
                total,
                totalAMCs,
                totalExpiredAMCs,
                totalActiveAMCs,
                totalExpiringSoonAMCs,
                totalPages,
                currentPage: page,
                pageSize: limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
        });
    } catch (error) {
        console.error("❌ Error fetching AMCs by retailer:", error);
        return next(new ErrorHandler(error.message, 500));
    }
});

exports.getAmcByDistributorWithPagination = catchAsyncErrors(async (req, res, next) => {
    try {
        const distributorId = req.params.id;
        let { page = 1, limit = 10, search = "", status = "", category = "" } = req.query;

        // ✅ Validate and sanitize pagination inputs
        page = Math.max(1, parseInt(page, 10));
        limit = Math.max(1, parseInt(limit, 10));

        // ✅ Base filter (for specific retailer)
        const filter = {};
        if (distributorId && mongoose.Types.ObjectId.isValid(distributorId)) {
            filter.distributorId = distributorId;
        } else {
            return next(new ErrorHandler("Invalid retailer ID", 400));
        }

        // ✅ Add status filter
        if (status && status.toLowerCase() !== "all") {
            filter.status = status.toLowerCase();
        }

        if (category && category.toLowerCase() !== "all") {
            filter.productCategory = category;
        }

        // ✅ Add search filter
        if (search && search.trim() !== "") {
            const searchRegex = new RegExp(search.trim(), "i");
            filter.$or = [
                { customerName: searchRegex },
                { id: searchRegex },
                { customerEmail: searchRegex },
                { customerMobile: searchRegex },
                { productCategory: searchRegex },
                { productBrand: searchRegex },
                { productType: searchRegex },
            ];
        }

        // ✅ Get paginated AMC data
        const [amcs, total, totalAMCs, totalExpiredAMCs, totalActiveAMCs, totalExpiringSoonAMCs] =
            await Promise.all([
                AMC.find(filter)
                    .sort({ createdAt: -1 })
                    .skip((page - 1) * limit)
                    .limit(limit)
                    .lean(),
                AMC.countDocuments(filter),
                AMC.countDocuments({ distributorId }),
                AMC.countDocuments({ distributorId, status: "expired" }),
                AMC.countDocuments({ distributorId, status: "active" }),
                AMC.countDocuments({ distributorId, status: "expiring_soon" }),
            ]);

        const totalPages = Math.ceil(total / limit);

        res.status(200).json({
            status: true,
            message: "AMCs fetched successfully",
            data: amcs,
            pagination: {
                total,
                totalAMCs,
                totalExpiredAMCs,
                totalActiveAMCs,
                totalExpiringSoonAMCs,
                totalPages,
                currentPage: page,
                pageSize: limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
        });
    } catch (error) {
        console.error("❌ Error fetching AMCs by retailer:", error);
        return next(new ErrorHandler(error.message, 500));
    }
});

// ✅ Update AMC
exports.updateAmcByAdmin = catchAsyncErrors(async (req, res, next) => {
    try {
        const { id } = req.params;

        let updateData = { ...req.body };

        if (req.file) {
            const localImagePath = req.file.path;
            const imageUrl = await uploadImage(localImagePath);
            deleteLocalFile(localImagePath);
            updateData.purchaseProof = imageUrl;
        }

        const updatedAmc = await AMC.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });

        if (!updatedAmc) return next(new ErrorHandler("AMC not found", 404));

        return sendResponse(res, true, 200, "AMC updated successfully", updatedAmc);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});

// ✅ Delete AMC
exports.deleteAmcByAdmin = catchAsyncErrors(async (req, res, next) => {
    try {
        const { id } = req.params;
        const deletedAmc = await AMC.findByIdAndDelete(id);
        if (!deletedAmc) return next(new ErrorHandler("AMC not found", 404));

        return sendResponse(res, true, 200, "AMC deleted successfully", deletedAmc);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});

// ✅ Get AMC
exports.getAmcByAdmin = catchAsyncErrors(async (req, res, next) => {
    try {
        const amc = await AMC.findById(req.params.id).lean();
        if (!amc) return next(new ErrorHandler("AMC not found", 404));
        return sendResponse(res, true, 200, "AMC fetched successfully", amc);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});