const { default:mongoose } = require("mongoose");

const dbConnect = () => {
  try {
    const conn = mongoose.connect(process.env.MONGODB_URL);
    console.log("Database connection successful");
  } catch (e) {
    console.log("Database Error")
  }
};
module.exports = dbConnect;
