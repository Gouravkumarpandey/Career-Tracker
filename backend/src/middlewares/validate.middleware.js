const ApiError = require('../utils/ApiError');

const validate = (validateFn) => {
  return (req, res, next) => {
    const errorMsg = validateFn(req.body);
    if (errorMsg) {
      return next(new ApiError(400, errorMsg));
    }
    next();
  };
};

module.exports = validate;
