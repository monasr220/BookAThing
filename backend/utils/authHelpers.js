const getCleanEmail = (email)=>{
    if(!email || typeof email != 'string' || !validator.isEmail(email)){
        return null;
    }
    return email.toLocaleLowerCase().trim();
};

const hashedPassword =async (password)=>{
    return await bcrypt.hash(password , 12);
}
