const mongoose = require("mongoose");

const validateMongodbid = (id) => {
  const isValid = mongoose.Types.ObjectId.isValid(id);
  if (!isValid) throw new Error("Invalid ID or ID not found");
};
module.exports = { validateMongodbid };
