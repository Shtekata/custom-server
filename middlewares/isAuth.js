export default (req, res, next) => {
    if (res.locals.err) return next(res.locals.err);
    if (!res.locals.user||!res.locals.token) return next({ status: 401, msg: 'Not authenticated.' });
    next();
}
