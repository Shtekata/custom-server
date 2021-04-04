export default (req, res, next) => {
    if (res.locals.user) return next({
        status: 409, msg: 'You have to log off!', username: res.locals.user.username, token: res.locals.token
    });
    next();
}