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
                    authService.getUserByToken(token)
                        .then(x => {
                            if (!x) throw ('No user!')
                            return {
                                username: x.username,
                                token: jwt.sign({ _id: x._id, username: x.username, email: x.email, roles: x.roles }, SECRET, { expiresIn: '1h' })
                            };
                        })
                        .then(x => Promise.all([User.updateOne({ username: x.username }, { token: x.token }), x.token]))
                        .then(x => {
                            res.locals.token = x[0];
                            res.locals.user = x[1];
                        })
                        .catch(x => next());
                }
                else if (e) next(e);
                else {
                    res.locals.token = token;
                    res.locals.user = x;
                }
            });
        }
        next();
    }
}