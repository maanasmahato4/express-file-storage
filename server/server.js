const express = require('express');
const { ErrorHandler } = require("./utils/ErrorHandler");
const cors = require("cors");

const app = express();

//middlewares
app.use(cors({
    origin: ["http://localhost:3000", "http://localhost:5173"]
}))
app.use(express.json());
app.use((req, res, next) => {
    req.locals = {};
    next();
})
app.use("/api", require("./routes/index"));


//error handler
app.use(ErrorHandler);



app.listen(3000, () => {
    console.log("http://localhost:3000");
})