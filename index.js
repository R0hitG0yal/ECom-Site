const express = require('express');
const dbConnect = require('./config/dbConnect');
const dotenv = require('dotenv').config();

const authRouter = require("./routes/authRoute");
const productRouter = require("./routes/productRoute");
const bodyParser = require('body-parser');
const { notFound, errorHandler } = require("./middleware/errorHandler");

const cookieParser = require('cookie-parser');

const PORT = process.env.PORT || 4000;


const app = express();

const morgan = require('morgan');

dbConnect();
app.use(morgan('dev'));

app.use(bodyParser.json());

app.use("/api/user", authRouter);
app.use("/api/product", productRouter);

app.use(cookieParser());

//pass middlewares after all the routes
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () =>{
    console.log(`Server is running on PORT: ${PORT}`);
})
