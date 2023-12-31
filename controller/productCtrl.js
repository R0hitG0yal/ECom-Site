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


//filter products

const getAllProduct = asyncHandler(async (req, res) => {
  try {
    //ways to filter products
    //1. const getProducts = await Product.find(req.query);
    //2. const getProducts = await Product.where("category").equals(req.query.category);
    // Main Way::
    const queryObj = {...req.query};
    const excludeFields = ['page' , 'sort' , 'limit' , 'fields'];
    // remove any of above fields from queryObj
    excludeFields.forEach((element) =>{
        delete queryObj(element);
    });

    let queryString = JSON.stringify(queryObj);
    queryString = queryString.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    
    let query = Product.find(JSON.parse(queryString));

    //Sorting

    if(req.query.sort){
      const sortBy = req.query.sort.split(',').join(" ");
      query = query.sort(sortBy);
    }else{
      query = query.sort('-createdAt')
    }

    //Limiting the fields
    if(req.query.fields){
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields);
    }else{
      query = query.select("-__v");

    }

    //pagination
    const page = req.query.page;
    const limit = req.query.limit;
    const skip = (page-1) * limit ;
    query = query.skip(skip).limit(limit);

    if(req.query.page) {
      const productCount  = await Product.countDocuments();
      if(skip>=productCount) throw new Error('This page doesn\'t exist');
    }

    const products = await query;
    res.json(products);
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


module.exports = {
  createProduct,
  getaProduct,
  updateProduct,
  deleteProduct,
  getAllProduct,
};
