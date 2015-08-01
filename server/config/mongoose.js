//mongoose.js
var mongoose=require("mongoose");
var userModel=require("../models/User");
var itemModel=require("../models/Item");
var orderModel=require("../models/Order");


module.exports = function() {

    //під’єднуємося бази даних retesto, яку буде створено автоматично, у випадку відсутності
    //mongoose.connect(config.db);
    mongoose.connect('mongodb://localhost/retesto');

    //отримуємо mongoose.connection для відслідковування подій
    var db=mongoose.connection;
    //відслідковуємо подію помилки з’єднання
    db.on('error',console.error.bind(console,"connection error."));
    //відслідковуємо успішне з’єднання
    db.once('open',function callback(){
        console.log("Retesto db opened...");
    });

    userModel.createDefaultUsers();
    itemModel.createDefaultItems();


};

