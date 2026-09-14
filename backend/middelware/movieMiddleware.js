const mongoose = require('mongoose');

const validateMovieId = (req,res,next)=>{
    const {id} = req.params;

    if(id&&!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({message:'Invlaid Movie Id fromat'});
    }
    next();
};

const validateSearchQuery = (req,res,next)=>{
    const {query} = req.query;

    if(!query||typeof query !== 'string' || query.trim() ===''){
        return res.status(400).json({message:'Search query is requird and must be non-empty string'});
    }
    next();
};

module.exports = {
    validateMovieId,
    validateSearchQuery
};
