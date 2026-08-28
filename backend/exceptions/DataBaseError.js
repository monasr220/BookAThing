import AppError from "./AppError"

class DataBaseError extends AppError{
    constructor(message="Database opertaion failded",query=''){
        super(message,500)
        this.query=query
    }
}
export default DataBaseError

