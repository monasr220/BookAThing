// new user or new thing 
import BaseResponse from "./BaseResponse";

class CreateResponse extends BaseResponse{
    constructor(data=null,message="Created Successfully"){
        super(201,true,message,data);
    }
}

export default CreateResponse

