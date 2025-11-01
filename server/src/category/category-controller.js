const catchAsyncErrors = require("../../middleware/catchAsyncErrors");
const ErrorHandler = require("../../utils/ErrorHandler");
const Categorys = require("./category-model");
const Types = require("../type/type-model");


// ✅ Create Category
exports.createCategoryByAdmin = catchAsyncErrors(async (req, res, next) => {
    try {
        console.log("Incoming Category Payload:", req.body);

        const { name, typeNames = [], createdByEmail = {}, status } = req.body;

        if (!name) {
            return res.status(400).json({ status: false, message: "Category name is required." });
        }

        const category = await Categorys.create({
            ...req.body,
            createdByEmail,
            
        });

        if (Array.isArray(typeNames) && typeNames.length > 0 && category?._id) {
            const validTypeNames = typeNames.filter(
                (t) => typeof t === "string" && t.trim() !== ""
            );
            // console.log("validTypeNames===>", validTypeNames)
            if (validTypeNames.length > 0) {
                await Promise.all(
                    validTypeNames.map(async (t) => {
                        return Types.create({
                            name: t.trim(),
                            categoryIds: category._id,
                            categoryId: category?.name,
                            createdByEmail: {
                                name: createdByEmail?.name || "Admin",
                                email: createdByEmail?.email || "unknown@system.com",
                            },
                            status: req.body.status || "active",
                        });
                    })
                );
            }
        }

        return res.status(201).json({
            status: true,
            message: "Category created successfully.",
            data: category,
        });
    } catch (error) {
        console.error("Error in createCategoryByAdmin:", error);
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
// exports.updateCategoryByAdmin = catchAsyncErrors(async (req, res, next) => {
//     try {
//         const { id } = req.params;
//         const updatedClaim = await Categorys.findByIdAndUpdate(id, req.body, {
//             new: true,
//             runValidators: true,
//         });

//         if (!updatedClaim) {
//             return next(new ErrorHandler("Claim not found", 404));
//         }
//         res.status(200).json({ status: true, message: 'Claim updated successfully', data: updatedClaim });
//     } catch (error) {
//         return next(new ErrorHandler(error.message, 500));
//     }
// });

exports.updateCategoryByAdmin = catchAsyncErrors(async (req, res, next) => {
  try {
    console.log("Incoming Category Update Payload:", req.body);

    const { id } = req.params;
    const { name, typeNames = [], createdByEmail = {}, status } = req.body;

    if (!id) {
      return res.status(400).json({ status: false, message: "Category ID is required." });
    }

    if (!name) {
      return res.status(400).json({ status: false, message: "Category name is required." });
    }

    // 🔹 Find the existing category
    const existingCategory = await Categorys.findById(id);
    if (!existingCategory) {
      return res.status(404).json({ status: false, message: "Category not found." });
    }

    // 🔹 Update category fields
    const updatedCategory = await Categorys.findByIdAndUpdate(
      id,
      {
        ...req.body,
        updatedAt: Date.now(),
      },
      { new: true, runValidators: true }
    );

    // 🔹 Sync typeNames with Types collection
    if (Array.isArray(typeNames) && updatedCategory?._id) {
      const validTypeNames = typeNames
        .filter((t) => typeof t === "string" && t.trim() !== "")
        .map((t) => t.trim());

      // Get existing types linked to this category
      const existingTypes = await Types.find({ categoryIds: updatedCategory._id });
      const existingTypeNames = existingTypes.map((t) => t.name);

      // ➕ Add new types that don’t exist yet
      const newTypeNames = validTypeNames.filter(
        (t) => !existingTypeNames.includes(t)
      );

      if (newTypeNames.length > 0) {
        await Promise.all(
          newTypeNames.map(async (t) => {
            return Types.create({
              name: t,
              categoryIds: updatedCategory._id,
              categoryId: updatedCategory?.name,
              createdByEmail: {
                name: createdByEmail?.name || "Admin",
                email: createdByEmail?.email || "unknown@system.com",
              },
              status: status || "active",
            });
          })
        );
      }

      // ➖ Remove old types that are not in the updated list
      const removedTypeNames = existingTypeNames.filter(
        (t) => !validTypeNames.includes(t)
      );

      if (removedTypeNames.length > 0) {
        await Types.deleteMany({
          name: { $in: removedTypeNames },
          categoryIds: updatedCategory._id,
        });
      }
    }

    return res.status(200).json({
      status: true,
      message: "Category updated successfully.",
      data: updatedCategory,
    });
  } catch (error) {
    console.error("Error in updateCategoryByAdmin:", error);
    return next(new ErrorHandler(error.message, 500));
  }
});


// ✅ Delete Category
// exports.deleteCategoryByAdmin = catchAsyncErrors(async (req, res, next) => {
//     try {
//         const { id } = req.params;
//         const deletedClaim = await Categorys.findByIdAndDelete(id);

//         if (!deletedClaim) {
//             return next(new ErrorHandler("Claim not found", 404));
//         }
//         res.status(200).json({ status: true, message: 'Claim deleted successfully', data: deletedClaim });
//     } catch (error) {
//         return next(new ErrorHandler(error.message, 500));
//     }
// });

exports.deleteCategoryByAdmin = catchAsyncErrors(async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ status: false, message: "Category ID is required." });
    }

    // 🔹 Find the category first
    const category = await Categorys.findById(id);
    if (!category) {
      return next(new ErrorHandler("Category not found", 404));
    }

    // 🔹 Delete all types associated with this category
    const deletedTypes = await Types.deleteMany({ categoryIds: id });

    // 🔹 Delete the category itself
    await Categorys.findByIdAndDelete(id);

    return res.status(200).json({
      status: true,
      message: "Category and related types deleted successfully.",
      data: {
        deletedCategory: category,
        deletedTypesCount: deletedTypes.deletedCount || 0,
      },
    });
  } catch (error) {
    console.error("Error in deleteCategoryByAdmin:", error);
    return next(new ErrorHandler(error.message, 500));
  }
});
