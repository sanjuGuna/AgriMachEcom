require('dotenv').config({
    path:'./.env'
});
const connectDB=require("./config/db");
connectDB();