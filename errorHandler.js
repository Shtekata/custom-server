import fs from 'fs';

export default (error, req, res, next) => {
    const err = error;
    err.status = error.status || error.statusCode || 500;
    err.msg = error.message || error.msg || 'Something went wrong';
    err.type = 'ERROR'
    res.locals.token ? err.token = res.locals.token : true;
    res.locals.user ? err.username = res.locals.user.username : true;

    req.session.err = err;
    if (process.env.NODE_ENV == 'development') console.log(err);
    else fs.appendFile('errors.txt', `${err.msg}\n`, function (err) { if (err) console.log(err); });

    res.status(err.status).json(err);
}
