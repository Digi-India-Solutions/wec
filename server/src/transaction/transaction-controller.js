const catchAsyncErrors = require("../../middleware/catchAsyncErrors");
const ErrorHandler = require("../../utils/ErrorHandler");
const SuperAdmin = require("../super-admin/super-admin-model");
const Transaction = require("./transaction-model");

// ✅ Create Transaction
exports.createTransactionByAdmin = catchAsyncErrors(async (req, res, next) => {
    try {
        console.log("transactionRoutes:=>", req.body);

        const { userId, type, amount } = req.body;

        // 1️⃣ Validate User
        const user = await SuperAdmin.findById(userId);
        if (!user) {
            return next(new ErrorHandler("User not found", 404));
        }

        if (req.body.role === "distributor" || req.body.role === "retailer") {
            if (user?.walletBalance < amount) {
                return res.status(200).json({ status: false, massage: "Insufficient wallet balance please add amount" });
            }
        }

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
        await user.save();

        // 4️⃣ Create Transaction Record
        const transaction = await Transaction.create({
            ...req.body,
            balanceAfter: newWalletBalance,
            createdByEmail: req.body.createdByEmail || {},
        });

        console.log("💰 Transaction Created:", transaction);
        console.log("🧾 Updated Wallet:", newWalletBalance);

        // 5️⃣ Send Response
        res.status(200).json({
            status: true,
            message: "Transaction created and wallet updated successfully",
            data: { transaction, updatedWallet: newWalletBalance, },
        });
    } catch (error) {
        console.error("Transaction Error:", error);
        return next(new ErrorHandler(error.message, 500));
    }
});

// ✅ Get Transactions (with pagination, search, status)
exports.getTransactionByAdminWithPagination = catchAsyncErrors(async (req, res, next) => {
    try {
        let { page = 1, limit = 10, search = "", role = "", status = "", userType = "", userId = [], createdByEmail = "" } = req.query;
        page = Math.max(1, parseInt(page, 10));
        limit = Math.max(1, parseInt(limit, 10));
        console.log('req.query::===>>', userId)

        if (typeof userId === "string") {
            try {
                userId = JSON.parse(userId);
            } catch {
                userId = userId.split(",").filter(Boolean);
            }
        }

        const filter = {};
        const filterData = {};
        if (role !== 'admin') {

            if (Array.isArray(userId) && userId.length > 0) {
                filter.userId = { $in: userId };
                filterData.userId = { $in: userId };
            }
            //     filter.createdByEmail.createdBy = role;

            //     // ✅ CreatedByEmail filter (distributor identifier)

            //     if (createdByEmail && createdByEmail.trim() !== '') {
            //         const createdByRegex = new RegExp(createdByEmail.trim(), 'i');
            //         filter.$or = [
            //             { 'createdByEmail.email': createdByRegex },
            //             { 'createdByEmail.name': createdByRegex }
            //         ];
            //     }
        }

        if (status && status !== "all") {
            filter.status = new RegExp(`^${status}$`, "i");
        }
        if (userType && userType !== "all") {
            filter.userType = new RegExp(`^${userType}$`, "i");
        }
        if (search && search.trim() !== "") {
            const searchRegex = new RegExp(search.trim(), "i");
            filter.$or = [
                { userName: searchRegex },
                { userEmail: searchRegex },
                { type: searchRegex },
                { description: searchRegex },
            ];
        }

        const total = await Transaction.countDocuments(filter);
        const totalTransactions = await Transaction.countDocuments(filterData);
        const [creditAgg] = await Transaction.aggregate([
            { $match: { type: "credit" } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        const [debitAgg] = await Transaction.aggregate([
            { $match: { type: "debit" } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        const totalCredit = creditAgg?.total || 0;
        const totalDebit = debitAgg?.total || 0;

        // ✅ Optionally calculate balance
        const balance = totalCredit - totalDebit;

        const transactions = await Transaction.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        const totalPages = Math.ceil(total / limit);

        res.status(200).json({
            status: true,
            message: "Transactions fetched successfully",
            data: transactions,
            pagination: {
                total,
                totalTransactions,
                totalCredit,
                totalDebit,
                totalPages,
                balance,
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

// ✅ Get All Transactions (no pagination)
exports.getAllTransactions = catchAsyncErrors(async (req, res, next) => {
    try {
        const transactions = await Transaction.find().sort({ createdAt: -1 });
        res.status(200).json({
            status: true,
            message: "All transactions fetched successfully",
            data: transactions,
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});

// ✅ Update Transaction
exports.updateTransactionByAdmin = catchAsyncErrors(async (req, res, next) => {
    try {
        const { id } = req.params;
        const updated = await Transaction.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!updated) {
            return next(new ErrorHandler("Transaction not found", 404));
        }

        res.status(200).json({
            status: true,
            message: "Transaction updated successfully",
            data: updated,
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});

// ✅ Delete Transaction
exports.deleteTransactionByAdmin = catchAsyncErrors(async (req, res, next) => {
    try {
        const { id } = req.params;
        const deleted = await Transaction.findByIdAndDelete(id);

        if (!deleted) {
            return next(new ErrorHandler("Transaction not found", 404));
        }

        res.status(200).json({
            status: true,
            message: "Transaction deleted successfully",
            data: deleted,
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});

exports.getWalletManagementByAdmin = catchAsyncErrors(async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await SuperAdmin.findById(id).lean();
        if (!user) return next(new ErrorHandler("User not found", 404));
        console.log("user:==>user:==>", user._id)

        const transactions = await Transaction.find({ userId: user._id }).sort({ createdAt: -1 });
        const totalCredit = transactions.reduce((total, transaction) => {
            if (transaction.type === "credit") {
                return total + transaction.amount;
            }
            return total;
        }, 0);
        const totalDebit = transactions.reduce((total, transaction) => {
            if (transaction.type === "debit") {
                return total + transaction.amount;
            }
            return total;
        }, 0);

        const totalBalance = user.walletBalance || 0;
        res.status(200).json({
            status: true,
            message: "Wallet fetched successfully",
            totalBalance, totalCredit, totalDebit,
        })
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});