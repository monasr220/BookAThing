// new user or new thing
const BaseResponse = require('./BaseResponse');

class CreateResponse extends BaseResponse {
    constructor(data = null, message = "Created Successfully") {
        super(201, message, true, data);
    }
}

module.exports = CreateResponse;
