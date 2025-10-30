const catchAsyncErrors = require("../../middleware/catchAsyncErrors");
const ErrorHandler = require("../../utils/ErrorHandler");
const { uploadImage, deleteImage } = require("../../middleware/Uploads");
const { deleteLocalFile } = require("../../middleware/DeleteImageFromLoaclFolder");
const { CompanySettings, AMCSettings } = require("./companyDetails-model");
// ✅ Create or Update Company Settings
///////////////  Company Settings ///////////////////////////////////////////////
exports.createOrUpdateCompanySettings = catchAsyncErrors(async (req, res, next) => {
    try {
        let imageUrl = null;
        let settings = await CompanySettings.findOne();

        if (req.file) {
            if (settings?.logo) {
                await deleteImage(settings?.logo);
            }
            const localPath = req.file.path;
            imageUrl = await uploadImage(localPath);
            deleteLocalFile(localPath);
        } else {
            imageUrl = settings?.logo
        }
        const data = {
            ...req.body,
            ...(imageUrl && { logo: imageUrl })
        };

        if (settings) {
            settings = await CompanySettings.findByIdAndUpdate(settings?._id, data, { new: true });
            res.status(200).json({ status: true, message: "Company settings updated successfully", data: settings });
        } else {
            const newSettings = await CompanySettings.create(data);
            res.status(201).json({ status: true, message: "Company settings created successfully", data: newSettings });
        }
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});

// ✅ Get Company Settings
exports.getCompanySettings = catchAsyncErrors(async (req, res, next) => {
    try {
        const settings = await CompanySettings.findOne().lean();
        if (!settings) return next(new ErrorHandler("Settings not found", 404));
        res.status(200).json({ status: true, message: "Settings fetched successfully", data: settings });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});

// ✅ Delete Company Settings
exports.deleteCompanySettings = catchAsyncErrors(async (req, res, next) => {
    try {
        const settings = await CompanySettings.findOne();
        if (!settings) return next(new ErrorHandler("Settings not found", 404));

        if (settings.logo) await deleteImage(settings.logo);

        await CompanySettings.findByIdAndDelete(settings._id);
        res.status(200).json({ status: true, message: "Company settings deleted successfully" });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});
//////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////AMC Settings ////////////////////////////////////////

exports.createOrUpdateAmcSettings = catchAsyncErrors(async (req, res, next) => {
    try {
        const existing = await AMCSettings.findOne();

        if (existing) {
            // Update existing record
            const updated = await AMCSettings.findByIdAndUpdate(existing?._id, req.body, {
                new: true,
                runValidators: true,
            });

            return res.status(200).json({
                status: true,
                message: "AMC settings updated successfully",
                data: updated,
            });
        }

        // Create new settings
        const created = await AMCSettings.create(req.body);
        res.status(201).json({
            status: true,
            message: "AMC settings created successfully",
            data: created,
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});

// 🟡 Get AMC Settings
exports.getAmcSettings = catchAsyncErrors(async (req, res, next) => {
    try {
        const settings = await AMCSettings.findOne();
        res.status(200).json({ status: true, data: settings || {}, });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});

// 🔴 Delete AMC Settings (optional)
exports.deleteAmcSettings = catchAsyncErrors(async (req, res, next) => {
    try {
        await AMCSettings.deleteMany({});
        res.status(200).json({
            status: true,
            message: "All AMC settings deleted successfully",
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});
