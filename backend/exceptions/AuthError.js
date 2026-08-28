import AppError from './AppError'
 
class AuthError extends AppError{
    constructor(message="Authentication Failed"){
        super(message,401)
    }
}

export default AuthError