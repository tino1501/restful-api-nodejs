// Requiring ObjectId from mongoose npm package
const ObjectId = require("mongoose").Types.ObjectId;

// Validator function
exports.isValidObjectId = (id) => {
    if (typeof id === 'string' && ObjectId.isValid(id)) {
        return true;
    }
    return false;
};

//5f95f6012e08f75e7c237427
//654745b73f1a72e96b5e2094