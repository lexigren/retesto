//Order.js

var mongoose=require("mongoose");

//схема збереження замовлення в базі
var orderSchema = new mongoose.Schema();
orderSchema.add({
    date:{
        type:Date,
        required:"{PATH} is required"
    },
    //товари
    items:[
        {
            item: {
                //id товару
                type: mongoose.Schema.ObjectId,
                //вказуємо, що пошук об’єкту треба здійснювати в таблиці товарів
                ref:"Item",
                required: "{PATH} is required"
            },
            quantity:{
                type:Number,
                required:"{PATH} is required"
            },
            price:{
                type:Number,
                required:"{PATH} is required"
            }
        }
    ],
    //покупець
    customer:{
        //id покупця
        type: mongoose.Schema.ObjectId,
        //вказаємо на таблицю користувачів
        ref: "User",
        required: "{PATH} is required"
    },
    shippingPrice:{
        type:Number,
        required:"{PATH} is required"
    },
    totalPrice:{
        type:Number,
        required:"{PATH} is required"
    },
    shippingAddress:{
        type:String,
        required:"{PATH} is required"
    },
    status:{
        type:String,
        default:"queuing",
        enum:["queuing","shipping","delivered","rejected"],
        required:"{PATH} is required"
    }
});


var Order = mongoose.model("Order",orderSchema);