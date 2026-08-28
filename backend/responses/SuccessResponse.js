// use when u make an update or del smthing

import BaseResponse from "./BaseResponse";
class SuccessResponse extends BaseResponse{
    constructor(data=null,message="procces compeleted")
{
    super(200,true,message,data);

}
}
export default SuccessResponse
