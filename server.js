//server.js

//функція імпорту модулів конфігурації
function include(module){
    return require("./server/config/"+module);
}

//включаємо в нашу програму express
var express=require("express");

//створюємо express application
var app=express();

//імпортуємо файли налаштувань
include("express")(app);
include("mongoose")(app);
include("passport")();
include("routes")(app);

//створюємо порт, який буде слухати наша програма
var port=8080;
app.listen(port);

//виводимо повідомлення про початок роботи програми
console.log("retesto has started on port "+port);