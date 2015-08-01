//Item.js

var mongoose=require("mongoose");
//модуль роботи з файловою системою
var fileSystem=require("../utilities/filesystem");

//схема збереження відгука в базі
var replySchema = new mongoose.Schema();
replySchema.add({
    author:{
        type:String,
        required:"Enter email!"
    },
    date:{
        type:Date,
        required:"{PATH} is required"
    },
    rate:{
        type:Number
    },
    comment:{
        type:String,
        required:"{PATH} is required"
    },
    administrative:{
        type:Boolean
    },
    replies:[replySchema],
    //id батьківського елементу
    parent:{
        type:mongoose.Schema.ObjectId,
        required:"{PATH} is required"
    }
});

//валідація поля моделі приймає функцію перевірки та повідомлення відмови
//перевірка коректності поштової адреси автора відгуку
replySchema.path("author").validate(function (author) {
    var emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
    return emailRegex.test(author);
},"Incorrect email!");

//валідація мінімальної та максимальної довжини коментаря
replySchema.path("comment").validate(function (comment) {
    return (comment.length>=3 && comment.length<=500);
},"Comment length must be from 3 to 500 characters!");

//перевірка на корректність оцінки
replySchema.path("rate").validate(function (rate) {
    return (rate>=1 && rate<=5);
},"Smart ass?");


var Reply = mongoose.model("Reply",replySchema);


//схема збереження товару в базі
var itemSchema=mongoose.Schema({
    //категорія
    category:{
        type:String,
        required:"{PATH} is required"
    },
    //ім’я
    name: {
        type:String,
        required:"{PATH} is required"
    },
    //текстовий опис
    description: {
        type:String,
        required:"{PATH} is required"
    },
    //технічні характеристики
    //масив об’єктів які містять поля "назва характеристики", "значення" та "тип пошуку"
    //ім’я визначає назву та одиниці характеристики
    //тип пошуку визначає тип пошуку характеристики: в діапазоні, списку, або тип текст - не для пошуку
    //в першому випадку значення має визначатися в універсальних одиницях, і буде використане для пошуку товарів
    //за характеристикою в діапазоні значень, наприклад RAM від 1 до 20 МБ
    //в другому випадку пошук ведеться за видом характеристики наприклад тип дисплея - кольоровий
    //Текст просто описує характеристику, наприклад назва моделі деталі і не включається до параметрів пошуку

    //таким чином програма зможе виконувати комплексний пошук за декількома параметрами
    specifications:
    [
           {
                //відключення автогенерування id для вкладених об’єктів
                _id: false,
                specName:{
                    type:String,
                    required:"{PATH} is required"
                },
                specValue:{
                    type:String,
                    required:"{PATH} is required"
                },
                searchType:{
                    type:String,
                    default:"range",
                    enum:["range","select","text"],
                    required:"{PATH} is required"
                }
            }
    ],
    //дата виготовлення
    produced: {
        type:Date,
        required:"{PATH} is required"
    },
    //доступність
    available: {
        type:Boolean,
        required:"{PATH} is required"
    },
    //кількість на складі
    quantity:{
        type:Number,
        required:"{PATH} is required"
    },
    //кількість переглядів
    views:{
        type:Number,
        required:"{PATH} is required"
    },
    //ціна
    price:{
        type:Number,
        required:"{PATH} is required"
    },
    //малюнки зберігаються в директоріях названих id товару
    //в БД лише вказується їх кількість
    //формат посилання на зображення - "/pics/"+ID+"/NUM.jpg"
    images:{
        type:Number,
        required:"{PATH} is required"
    },
    //дата отримання на склад
    received:{
        type:Date,
        required:"{PATH} is required"
    },
    //масив тегів
    tags:[String],
    //масив коментарів
    replies:[replySchema],
    //маркер повної/скороченої серіалізації
    fullVersion: Boolean
});


itemSchema.methods={
    //фунція коригуюча серіалізацію об’єкту з БД в json
    toJSON: function() {
        var obj = this.toObject();
        //якщо потрібен список товарів - видаляємо з результуючого json непотрібну інформацію
        if(!obj.fullVersion) {
            delete obj.reviews;
            delete obj.__v;
            delete obj.category;
            delete obj.images;
            delete obj.quantity;
            delete obj.fullVersion;
        }
        return obj;
    }
};


var Item = mongoose.model("Item",itemSchema);

//створення тестових товарів
exports.createDefaultItems=function(){


    //створення директорії для зображень
    function createFolder (err,item) {
        if(err){
            console.log("Item creation error: "+err.toString());
        }else {
            console.log("Created item "+item.name);
            //назва директорії - id товару
            fileSystem.createFolder("client/res/img/" + item._id);
        }
    }

    Item.find({}).exec(function (err,collection) {

        if(collection.length==0){
            //додавання нового товару з функцією створення директорії для його зображень, в якості колбеку
            //додамо кілька комп’ютерів
            Item.create(
                {
                    category: "computers",
                    name: "ELEKTRONIKA uk-7",
                    description: "Colorful PC, that brings joy for whole family",
                    specifications:[
                        {
                            specName:"RAM MB",
                            specValue:"0.125",
                            searchType:"range"
                        },
                        {
                            specName:"CPU MHZ",
                            specValue:"2.5",
                            searchType:"range"
                        },
                        {
                            specName:"Video Type",
                            specValue:"CGA",
                            searchType:"select"
                        }
                    ],
                    produced: new Date('1/23/1983'),
                    available: true,
                    quantity: 3,
                    views: 405,
                    price:999.99,
                    images:2,
                    received: new Date('11/17/2014'),
                    tags:["pc","old","soviet","crt"]
                },createFolder);////////////////
            Item.create(
                {
                    name: "Iskra i386  PC",
                    category: "computers",
                    description: "Powerful computer for work and entertainment",
                    specifications:[
                        {
                            specName:"RAM MB",
                            specValue:"0.625",
                            searchType:"range"
                        },
                        {
                            specName:"CPU MHZ",
                            specValue:"5.7",
                            searchType:"range"
                        },
                        {
                            specName:"Video Type",
                            specValue:"EGA",
                            searchType:"select"
                        }
                    ],
                    produced: new Date('11/19/1988'),
                    available: true,
                    quantity: 1,
                    views: 264,
                    price:1999.99,
                    images:3,
                    received: new Date('7/3/2015'),
                    tags:["evm","old","soviet","crt"]
                },createFolder);
            Item.create(
                {
                    name: "Palm 31",
                    category: "computers",
                    description: "Pocket PC device, that allows you to compute wherever you'll be",
                    specifications:[
                        {
                            specName:"RAM MB",
                            specValue:"2",
                            searchType:"range"
                        },
                        {
                            specName:"CPU MHZ",
                            specValue:"16",
                            searchType:"range"
                        },
                        {
                            specName:"Video Type",
                            specValue:"QVGA",
                            searchType:"select"
                        }
                    ],
                    produced: new Date('9/10/1998'),
                    available: true,
                    quantity: 6,
                    views: 564,
                    price:665.99,
                    images:2,
                    received: new Date('11/1/2013'),
                    tags:["evm","pocket","us","lcd"]
                },createFolder);
            Item.create(
                {
                    name: "Elektronika mk-66",
                    category: "computers",
                    description: "Handy and ergonomic handheld computation machine from Soviet Union",
                    specifications:[
                        {
                            specName:"RAM MB",
                            specValue:"0.0625",
                            searchType:"range"
                        },
                        {
                            specName:"CPU MHZ",
                            specValue:"0.6",
                            searchType:"range"
                        },
                        {
                            specName:"Video Type",
                            specValue:"SQQVGA",
                            searchType:"select"
                        }
                    ],
                    produced: new Date('9/10/1998'),
                    available: true,
                    quantity: 6,
                    views: 564,
                    price:665.99,
                    images:2,
                    received: new Date('11/1/2013'),
                    tags:["evm","pocket","us","lcd"]
                },createFolder);

            //телевізорів
            Item.create(
                {
                    name: "Berezka m-45-zd-5678  TV",
                    category: "broadcast",
                    description: "Colorful stereo television set",
                    specifications:[
                        {
                            specName:"Size INCHES",
                            specValue:"17",
                            searchType:"range"
                        },
                        {
                            specName:"Weight KG",
                            specValue:"40",
                            searchType:"range"
                        },
                        {
                            specName:"Display Type",
                            specValue:"Colorful",
                            searchType:"select"
                        }
                    ],
                    produced: new Date('5/23/1971'),
                    available: true,
                    quantity: 1,
                    views: 125,
                    price:199.99,
                    images:2,
                    received: new Date('11/27/2014'),
                    tags:["tv","color","ussr","crt"]
                },createFolder);
            Item.create(
                {
                    name: "Toshiba Bulgeron",
                    category: "broadcast",
                    description: "TV, that provides you best quality from Japan",
                    specifications:[
                        {
                            specName:"Size INCHES",
                            specValue:"19",
                            searchType:"range"
                        },
                        {
                            specName:"Weight KG",
                            specValue:"30",
                            searchType:"range"
                        },
                        {
                            specName:"Display Type",
                            specValue:"Colorful",
                            searchType:"select"
                        }
                    ],
                    produced: new Date('3/4/2003'),
                    available: true,
                    quantity: 2,
                    views: 99,
                    price:500.99,
                    images:2,
                    received: new Date('11/3/2014'),
                    tags:["tv","japan","crt"]
                },createFolder);
            Item.create(
                {
                    name: "Radiation King 1",
                    category: "broadcast",
                    description: "Picture broadcast receiving station",
                    specifications:[
                        {
                            specName:"Size INCHES",
                            specValue:"12",
                            searchType:"range"
                        },
                        {
                            specName:"Weight KG",
                            specValue:"60",
                            searchType:"range"
                        },
                        {
                            specName:"Display Type",
                            specValue:"B/W",
                            searchType:"select"
                        }
                    ],
                    produced: new Date('3/14/1951'),
                    available: true,
                    quantity: 1,
                    views: 129,
                    price:700.99,
                    images:2,
                    received: new Date('11/3/2014'),
                    tags:["tv","usa"]
                },createFolder);
            Item.create(
                {
                    name: "Radiation King 2",
                    category: "broadcast",
                    description: "Picture broadcast receiving station. In color!",
                    specifications:[
                        {
                            specName:"Size INCHES",
                            specValue:"16",
                            searchType:"range"
                        },
                        {
                            specName:"Weight KG",
                            specValue:"90",
                            searchType:"range"
                        },
                        {
                            specName:"Display Type",
                            specValue:"Colorful",
                            searchType:"select"
                        }
                    ],
                    produced: new Date('3/14/1953'),
                    available: true,
                    quantity: 2,
                    views: 421,
                    price:900.99,
                    images:2,
                    received: new Date('6/21/2013'),
                    tags:["tv","usa","colorful"]
                },createFolder);

            //та телефонів
            Item.create(
                {
                    name: "Motorola dynasaur-uhfw-8000 phone",
                    category: "connectivity",
                    description: "Cellular phone device, that allows you to be connected to your friends and family every minute",
                    specifications:[
                        {
                            specName:"Battery mAh",
                            specValue:"2500",
                            searchType:"range"
                        },
                        {
                            specName:"Network type",
                            specValue:"AMPS",
                            searchType:"select"
                        }
                    ],
                    produced: new Date('12/7/1993'),
                    available: true,
                    quantity: 2,
                    views: 432,
                    price:698.99,
                    images:2,
                    received: new Date('4/12/2014'),
                    tags:["cellular","phone","motorola"]
                },createFolder);

            Item.create(
                {
                    name: "Nokia 111110",
                    category: "connectivity",
                    description: "Simple and reliable phone",
                    specifications:[
                        {
                            specName:"Battery mAh",
                            specValue:"1100",
                            searchType:"range"
                        },
                        {
                            specName:"Network type",
                            specValue:"GSM",
                            searchType:"select"
                        }
                    ],
                    produced: new Date('7/4/2001'),
                    available: true,
                    quantity: 1,
                    views: 13,
                    price:120.99,
                    images:2,
                    received: new Date('9/15/2014'),
                    tags:["phone","finland"]
                },createFolder);
            Item.create(
                {
                    name: "Siemens d43",
                    category: "connectivity",
                    description: "Affordable cell phone",
                    specifications:[
                        {
                            specName:"Battery mAh",
                            specValue:"900",
                            searchType:"range"
                        },
                        {
                            specName:"Network type",
                            specValue:"GSM",
                            searchType:"select"
                        }
                    ],
                    produced: new Date('7/4/1999'),
                    available: true,
                    quantity: 19,
                    views: 233,
                    price:110.99,
                    images:2,
                    received: new Date('11/20/2014'),
                    tags:["phone","germany"]
                },createFolder);
        }
    });
};
