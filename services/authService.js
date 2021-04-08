import User from '../models/User.js';
import bcrypt from 'bcrypt';
import config from '../config/config.js';
import jwt from 'jsonwebtoken';

const SALT_ROUNDS = config.SALT_ROUNDS;
const SECRET = config.SECRET;

const login = ({ username, password, email }) => User.findOne({ username })
    .then(async x => {
        if (!x) throw { msg: 'User with given username do not exists!', status: 409 };
        const y = await bcrypt.compare(password, x.password);
        return { x, y };
    })
    .then(z => {
        if (!z.y) throw { msg: 'Password does not match!', status: 409 };
        const token = jwt.sign({ _id: z.x._id, username: z.x.username, email: z.x.email, roles: z.x.roles }, SECRET, { expiresIn: '1h' });
        if (z.x.token) jwt.verify(z.x.token, SECRET, (e, x) => {
            if (e) return;
            throw { msg: 'User is logged in!', status: 409, token, username: z.x.username };
        });
        return Promise.all([User.updateOne({ username }, { token }), token, z.x]);
    })
    .catch(x => { throw x });
    
const register = ({ username, password, email }) => {
    return User.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } })
        .then(x => {
            if (x) { throw { message: 'User with given username already exists!', status: 409 } };
            return User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } })
        })
        .then(x => {
            if (x) { throw { message: 'User with given email already exists!', status: 409 } };
            return bcrypt.genSalt(SALT_ROUNDS);
        })
        .then(x => { return bcrypt.hash(password, x) })
        .then(x => {
            const user = new User({ username, password: x, email, roles: ['user'] });
            return user.save();
        })
        .catch(x => {
            let err = {};
            if (!x.errors) {
                err.msg = x.message;
                err.status = x.status;
            } else {
                const errors = Object.keys(x.errors).map(y => ({ 'err-msg': x.errors[y].message }));
                Object.keys(x.errors).map(y =>
                    err.msg = err.msg ? `${err.msg}\n${x.errors[y].message}` : x.errors[y].message
                );
            }
            throw err;
        });
};

const logout = (username) => {
    return User.findOneAndUpdate({ username }, { token: '' }, { useFindAndModify: false })
        .catch(x => { throw x });
}

const getUser = (id) => User.findById(id);

const getUserByUsername = (username) => User.findOne({ username });

const getUserByToken = (token) => User.findOne({ token });

export default {
    login,
    register,
    logout,
    getUser,
    getUserByToken,
    getUserByUsername
}