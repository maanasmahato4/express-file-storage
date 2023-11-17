const express = require('express');
const { ErrorHandler } = require("./utils/ErrorHandler");

const app = express();

//middlewares
app.use(express.json());
app.use("/api", require("./routes"));


//error handler
app.use(ErrorHandler);



app.listen(3000, () => {
    console.log("http://localhost:3000");
})