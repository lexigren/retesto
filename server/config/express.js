//express.js

//модуль аутентифікації
var passport=require("passport");
//включаємо в нашу програму express
var express = require("express");
//шаблонізатор стилів
var stylus=require("stylus");
// morgan відповідає за логування http запитів
var logger = require('morgan');
//body-parser потрібен для обробки post запитів
//корисний для роботи з json запитами, автоматично виконуючи їх парсінг,
//та дозволяючи викликати поля надісланого об’єкту за допомогою наступної конструкції:
//req.body.їм’я_поля
var bodyParser = require('body-parser');
//для роботи з cookie і session
var cookieParser = require('cookie-parser');
var session = require('express-session');


var busboy = require('connect-busboy');

//модуль який буде надіслано у відповідь на функцію require
module.exports=function(app, config){

    app.use(busboy());

    //встановлюємо директорію в якій містяться наші представлення
    //__dirname повертає поточну директорію. Оскільки ми в config,
    //нам треба піднятися на дві директорії вверх і зайти у server/views
    app.set("views",__dirname+"/../../server/views");
    //вказуємо рушій представлень
    app.set("view engine","jade");

    //використовуємо нові модулі
    app.use(logger("dev"));

    app.use(cookieParser());

    //хешування сесії за ключем secret
    app.use(session({secret:"zombieland"}));

    app.use(passport.initialize());
    app.use(passport.session());

    app.use(bodyParser());

    //функція компіляції stylus в css файл
    function compile(str, path){
        return stylus(str).set("filename",path);
    }
    //вказуємо stylus яку функцію використати для компіляції, та куди зберегти готовий css
    app.use(stylus.middleware({
        src: __dirname+"/../../client",
        compile: compile
    }));

    //вказуємо програмі куди дивитися, якщо отримано запит статичного файлу
    app.use(express.static(__dirname+"/../../client"));

}