//Define a generic custom error-handler class
class ExpressError extends Error {
    constructor(message, statusCode) {
        super(); //Call the Error constructor
        this.message = message;
        this.statusCode = statusCode;
    }
}

module.exports = ExpressError;