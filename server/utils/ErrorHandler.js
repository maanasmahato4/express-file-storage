const { INTERNAL_SERVER_EXECEPTION } = require("../shared/contants")

const ErrorHandler = (err, req, res, next) => {
    console.log(err);
    return res.status(500).json({ error: INTERNAL_SERVER_EXECEPTION, message: err });
}

module.exports = { ErrorHandler };