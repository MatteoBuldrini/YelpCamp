//Define utility function used to catch errors in async functions
module.exports = func => {
    return (req, res, next) => {
        func(req, res, next).catch(next);
    }
}