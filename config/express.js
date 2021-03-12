import express from 'express';
import handlebars from 'express-handlebars';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import auth from '../middlewares/auth.js';

function setupExpress(app) {
    app.engine('hbs', handlebars({ extname: 'hbs' }));
    app.set('view engine', 'hbs');

    app.use(express.static('public'));
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    app.use(cookieParser());
    app.use(session({ secret: 'shtekata', cookie: { secure: false, maxAge: 1800000 }, resave: false, saveUninitialized: true }));
    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', 'https://tranquil-sea-17355.herokuapp.com');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        next()
    });
    app.use(auth());
}

export default setupExpress;