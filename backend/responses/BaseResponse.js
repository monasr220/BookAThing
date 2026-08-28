class BaseResponse{
    constructor(statusCode,message,success,data=null){
        this.statusCode=statusCode
        this.message=message
        this.success=success
        if(data!==null){
            this.data=data
        }
    }
    send(res){
        return res.status(this.statusCode).json(this)
    }
}

export default BaseResponse

