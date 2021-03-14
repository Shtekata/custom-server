import mongoose from 'mongoose';
import {
    ENGLISH_ALPHANUMERIC_PATTERN,
    ENGLISH_ALPHANUMERIC_PATTERN_FOR_EMAIL,
} from '../config/constants.js';

const userSchema = new mongoose.Schema({
    id: mongoose.Types.ObjectId,
    username: {
        type: String,
        required: [true, 'Username is required!'],
        unique: true,
        minlength: 3,
        // validate: {
        //     validator: (x) => ENGLISH_ALPHANUMERIC_PATTERN.test(x),
        //     message: (x) => `${x.value} schould consist only english letters and digits!`
        // },
    },
    password: {
        type: String,
        minlength: 6,
        required: [true, 'Password is required!'],
    },
    email: {
        type: String,
        required: [true, 'Email is required!'],
        unique: true,
        minlength: 3,
        //  validate: {
        //     validator: (x) => ENGLISH_ALPHANUMERIC_PATTERN_FOR_EMAIL.test(x),
        //     message: (x) => `${x.value} schould consist only english letters and digits!`
        // },
    },
    token: {
        type: String,
        default: ''
    },
    roles: [{ type: String }],
    likedPlays: [{
        type: mongoose.Types.ObjectId, ref: 'Play'
    }],
});

export default mongoose.model('User', userSchema);