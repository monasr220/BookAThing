import AppError from "./AppError";

class ValidationError extends AppError{
    constructor(message,field,details=null){
        super(message,400,details);
        this.field=field
    }
}
export default ValidationError


