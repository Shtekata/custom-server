export default (req, res, next) => {
    if (res.locals.user) return next({ status: 409, msg: 'You have to log off!' });
    next();
}