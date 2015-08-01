//User.js

var mongoose=require("mongoose");
var encrypt=require("../utilities/encryption");


//створюємо схему збереження користувачів
var userSchema = mongoose.Schema({
    //ім’я типу стрінг, яке є обов’язковим, з повідомленням про обов’язковість
    firstName:{type:String,required: '{PATH} is required!'},
    //прізвище
    lastName:{type:String,required: '{PATH} is required!'},
    //електронна пошта буде за сумісництвом нашим логіном
    email:{
        type: String,
        required: '{PATH} is required!',
        //не може бути двох користувачів з однаковим логіном
        unique:true
    },
    //випадкове число для генерації хешованого паролю
    salt: {type:String,required: '{PATH} is required!'},
    //пароль в хешованому вигляді
    hashedPassword: {type:String,required: '{PATH} is required!'},
    //необов’язкове поле адреса - буде вперше заповнене при першому замовленні товара
    address:{type:String},
    //масив, який вміщуватиме в собі список ролей користувача
    roles: [{
        type:String,
        default:"user",
        enum:["user","owner","merchandiser","deliverer","blocked"],
        required:"{PATH} is required"
    }],
    //дата реєстрації
    registered:{
        type: Date
    }
});

userSchema.methods={
    //метод отримує введний користувачем пароль
    authenticate: function(inputPassword){
        //введений пароль хешується з ключем salt, збереженим в БД для кожного користувача
        //якщо отримана таким чином хеш сума еквівалентна збереженій в базі даних - пароль вірний
        return encrypt.createHashedPassword(this.salt,inputPassword)==this.hashedPassword;
    },
    //фунція коригуюча серіалізацію об’єкту з БД в json
    toJSON: function() {
        var obj = this.toObject();
        //видаляємо з результуючого json поля паролю і salt
        delete obj.hashedPassword;
        delete obj.salt;
        return obj
    },
    hasRole: function (role) {
        return this.roles.indexOf(role)>-1;
    }
};

//функція додавання до запису користувача salt і хешованого паролю
//pre примушує mongoose виконати певну операцію до редагування бази
//за кожного create автоматично викликається save
userSchema.pre('save', function (next) { console.log("here");
    //додаємо роль user за замовчуванням
    if(this.roles.length==0) this.roles.push("user");
    this.salt =encrypt.createSalt();
    this.hashedPassword=encrypt.createHashedPassword(this.salt, this.hashedPassword);
    next();
});///

//створюємо модель за схемою
var User=mongoose.model("User",userSchema);

//функція створення декількох дефолтних користувачів
exports.createDefaultUsers=function() {

    //виконуємо пошук всіх записів
    User.find({}).exec(function (err, collection) {
        //якщо в отриманому списку нема жодного запису, додамо декількох користувачів
        if (!collection.length > 0) {
            console.log("creating users");
            //додамо двох звичайних користувачів
            //call(об’єкт) дозволяє викликати будь-яку функцію як метод об’єкту параметру
            User.create({
                firstName: "Stepan",
                lastName: "Medvedov",
                email: "medvedan@email.com",
                salt: "1",
                hashedPassword: "1",
                roles: ["user"]
            });

            User.create({
                firstName: "Havrylo",
                lastName: "Svinolup",
                email: "svinorylo@email.com",
                salt: "1",
                hashedPassword: "1",
                roles: ["user"]
            });

            //та одного власника магазину
            User.create({
                firstName: "Shlomo",
                lastName: "Icak",
                email: "shlicak@gmail.com",
                salt: "1",
                hashedPassword: "1",
                roles: ["owner"]
            });
        }
    });
};