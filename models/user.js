const mongoose = require('mongoose');
const Xregexp = require('xregexp');

const schema = mongoose.Schema({
    photo: {
        type: String,
        maxlength: 100,
        trim: true,
    },
    username: {
        type: String,
        unique: true,
        index: true,
        required: true,
        maxlength: 100,
        minlength: 5,
        trim: true,
        validate: {
        validator: (v) => Xregexp('^[\\p{L}]+[\\p{L}\\p{N}_-]+$').test(v),
        // message: 'Your Username is not valid',
        },
    },
    name: {
        type: String,
        required: true,
        maxlength: 100,
        minlength: 5,
        trim: true,
        validate: {
        validator: (v) => Xregexp('^[\\p{L}]+[\\p{L} ]+$').test(v),
        // message: 'Your Name is not valid',
        },
    },
    roles: {
        type: [{
            type: String,
            maxlength: 255,
            trim: true,
        }],
        required: true,
    },
    email: {
        type: String,
        unique: true,
        index: true,
        required: true,
        lowercase: true,
        maxlength: 100,
        minlength: 5,
        trim: true,
        validate: {
        validator: (v) => Xregexp('^(\\S)+@(\\S)+.(\\S)+$').test(v),
        message: 'Your Email is not valid',
        },
    },
    pw: {
        type: String,
        required: true,
    },
    joined: {
        type: Date,
        default: Date.now,
    },
    change_email: {
        email: String,
        date: Date,
        code: {
          type: Number,
          min: 100000,
          max: 999999,
        },
    },
});

module.exports = mongoose.model('user', schema);
