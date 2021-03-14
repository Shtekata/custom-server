export default (req, res, next) => {
    if (res.locals.err) return next(res.locals.err);
    if (!res.locals.user) return next({ status: 401, msg: 'Not authenticated.' });
    next();
}
