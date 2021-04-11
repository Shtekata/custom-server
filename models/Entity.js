import mongoose from 'mongoose';

const entitySchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required!'],
        unique: true,
        minlength: 3
    },
    description: {
        type: String,
        required: [true, 'Description is required!'],
        minlength: 5,
        maxlength: 500
    },
    solution: {
        type: String,
        minlength: 5,
        maxlength: 500
    },
    isPublic: {
        type: Boolean,
        required: true,
        default: true
    },
    creator: {
        type: mongoose.Types.ObjectId, required: true, ref: 'User'
    },
    createdAt: {
        type: Date,
        required: true
    },
    executor: {
        type: mongoose.Types.ObjectId, ref: 'User'
    },
    executedOn: {
        type: Date,
    },
    isToDo: {
        type: Boolean,
        required: true,
        default: true
    },
    isInProgress: {
        type: Boolean,
        required: true,
        default: false
    },
    isDone: {
        type: Boolean,
        required: true,
        default: false
    },
    isOld: {
        type: Boolean,
        required: true,
        default: false
    },
    isDeleted: {
        type: Boolean,
        required: true,
        default: false
    },
    // usersLiked: [{
    //     type: mongoose.Types.ObjectId, ref: 'User'
    // }]
});

entitySchema.pre('validate', function (next) {
    const date = new Date();
    this.createdAt = date;
    next();
});

export default mongoose.model('Task', entitySchema);