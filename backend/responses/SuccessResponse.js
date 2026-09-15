// use when u make an update or delete something
const BaseResponse = require('./BaseResponse');

class SuccessResponse extends BaseResponse {
    constructor(data = null, message = "Process completed") {
        super(200, message, true, data);
    }
}

module.exports = SuccessResponse;
