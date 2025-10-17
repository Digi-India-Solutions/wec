const express = require('express');
const { createWishList,updateWishList, getAllWishLists, deleteWishlistByID,getAllWishListById } = require('./wishList-controller');


const router = express.Router();

router.post("/create-wishlist", createWishList);

router.post("/update-wishlist/:id", updateWishList);

router.get("/get-all-size-with-pagination", getAllWishLists);

router.get("/delete-wishlist/:id", deleteWishlistByID);

router.get("/get-all-WishList-by-id/:id",getAllWishListById)



module.exports = router;