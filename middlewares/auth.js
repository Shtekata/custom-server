import config from '../config/config.js';
import jwt from 'jsonwebtoken';
import authService from '../services/authService.js';
import User from '../models/User.js';

const COOKIE_NAME = config.COOKIE_NAME;
const SECRET = config.SECRET;

export default function () {
    return (req, res, next) => {
        const token = req.get('Authorization')?.split(' ')[1];
        if (token && token != 'undefined'){
            jwt.verify(token, SECRET, (e, x) => {
                if (e && e.message == 'jwt expired') {
                    const payload = jwt.verify(token, SECRET, { ignoreExpiration: true })
                    res.locals.user = payload;
                    res.locals.token = token;
                    authService.getUser({ _id: payload._id })
                        .then(x => {
                            if (!x) return null;
                            return {
                                username: x.username,
                                token: jwt.sign({ _id: x._id, username: x.username, email: x.email, roles: x.roles }, SECRET, { expiresIn: '1h' })
                            };
                        })
                        .then(x => {
                            if (!x) return null;
                            return Promise.all([User.updateOne({ username: x.username }, { token: x.token }), x.token])
                        })
                        .then(x => {
                            if (!x) return null;
                            res.locals.user = x[0];
                            res.locals.token = x[1];
                            return;
                        })
                        .catch(next({ status: 409, msg: 'User is not registered!' }));
                }
                else if (e) next(e);
                else {
                    res.locals.token = token;
                    res.locals.user = x;
                    return;
                }
            });
        }
        next();
    }
}