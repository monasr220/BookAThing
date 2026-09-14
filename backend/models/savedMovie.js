const mongoose = require('mongoose');


const savedMovieSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    movieId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'movies',
        required: true,
    }
}, {
    timestamps:true
}
);

savedMovieSchema.index({userId:1,movieId:1},{unique:true})


module.exports  = mongoose.model('SavedMovie', savedMovieSchema);

