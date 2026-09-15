const getPagination =(page = 1 , limit =10)=>{
    const parsedPage=  Math.max(1, parseInt(page , 10) ||1);
    const parsedLimit = Math.min(50 , Math.max(1,parseInt(limit,10)||10));
    const skip = (parsedPage -1 ) * parsedLimit;

    return {page : parsedPage , limit: parsedLimit , skip};
};



const sanitizeComment = (comment) => {
    if (!comment || typeof comment !== 'string') return '';
    return comment.trim().replace(/\s+/g, ' ');
};

module.exports = {
    getPagination,
    sanitizeComment
};