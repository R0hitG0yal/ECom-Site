const Product = require("../models/productModel");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");

const createProduct = asyncHandler(async (req, res) => {
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }
    const newProduct = await Product.create(req.body);
    res.json(newProduct);
  } catch (err) {
    throw new Error(err);
  }
});

const getaProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const findProduct = await Product.findById(id);
    res.json(findProduct);
  } catch (err) {
    throw new Error(err);
  }
});

const getAllProduct = asyncHandler(async (req, res) => {
  try {
    const getProducts = await Product.find();
    res.json(getProducts);
  } catch (err) {
    throw new Error(err);
  }
});

const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }
    const updateaProduct = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updateaProduct);
  } catch (err) {
    throw new Error(err);
  }
});

const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const deleteaProduct = await Product.findByIdAndDelete(id);
    res.send("Product deleted successfully.");
  } catch (err) {
    throw new Error(err);
  }
});

const filterProducts = asyncHandler(async (req, res) => {});

module.exports = {
  createProduct,
  getaProduct,
  getAllProduct,
  updateProduct,
  deleteProduct,
  filterProducts,
};
