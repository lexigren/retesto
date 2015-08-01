//users.js
var mongoose=require("mongoose");
var User=mongoose.model("User");
var encrypt=require("../utilities/encryption");

//var colors=require("colors");
//знаходяться та повертаються всі користувачі в базі
exports.getUsers= function (req,res) {
    User.find({}).exec(function (err,collection) {
        res.send(collection);
    });
};

//створення нового користувача
exports.createUser= function (req,res,next) {
    var userData=req.body;
    console.log("Creating user "+userData.email);
    //для перевірки унікальності всі email зберігаються в lowercase
    userData.email=userData.email.toLowerCase();
    userData.registered=new Date();

    //створюємо запис
    User.create(userData,function (err,user) {
        //якщо помилка
        if(err){
            //E11000 - код помилки вже існуючого унікального email
            if(err.toString().indexOf('E11000') > -1) {
                err = new Error('User already exists!');
            }
            //повертаємо bad request і опис помилки
            res.status(400);
            return res.send({success:false,reason:err.toString()});
        }
        //успіх - повертаємо новоствореного користувача
        req.logIn(user, function (err) {
            if(err) return next(err);
            res.send({success:true, user: user});
        });
    });
};///

//оновлення даних користувача
exports.updateUser= function (req,res) {
    var updatedUserData=req.body;

    //якщо оновлюється поточний користувач
    if(updatedUserData._id==req.user._id){

        //власну роль змінювати заборонено
        if(updatedUserData.newRole){
            res.status(403);
            return res.send({success:false,reason:"You can't change your own role!"});
        }

        //перевірка введеного паролю
        if(!updatedUserData.password || !req.user.authenticate(updatedUserData.password)){
            res.status(403);
            return res.send({success:false,reason:"Wrong password!"});
        }

        //перевірка необхідності заміни паролю
        if(updatedUserData.newPassword){
            req.user.hashedPassword=updatedUserData.newPassword;
        } else{
            req.user.hashedPassword=updatedUserData.password;
        }

        req.user.email=updatedUserData.email;
        req.user.firstName=updatedUserData.firstName;
        req.user.lastName=updatedUserData.lastName;


        req.user.save(function (err) {
            if(err){
                if(err.toString().indexOf('E11000') > -1) {
                    err = new Error('Username is already taken!');
                }
                res.status(400);
                return res.send({success:false,reason:err.toString()});
            }else{
                res.send({success:true,user:req.user});
            }
        });
    }
    //якщо поточний користувач є власником - змінюємо іншого користувача
    //для власника буде доступною лише встановлення ролі користувача, наприклад - blocked
    else if(req.user.hasRole("owner")){
        //заборонимо створювати інших власників
        if(updatedUserData.newRole=="owner") {
            res.status(403);
            return res.send({success:false,reason:"There can be only one! (owner)"});
        }
        var query = {"_id":updatedUserData._id};
        var update = {roles: [updatedUserData.newRole]};
        //за замовчуванням, mongoose не виконує валідацію, коли виконується запит update
        //тому встановлюємо опції: отримати як результат оновлений запис, та виконати валідацію
        var options = {new: true, runValidators:true};
        //знаходимо користувача за id і встановлюємо ролі
        User.findOneAndUpdate(query, update, options, function(err, user) {
            if (err) {
                res.status(400);
                return res.send({success:false,reason:err.toString()});
            } else{
                res.send({success:true,user:user});
            }
        });
    }
    //в іншому випадку
    else{
        res.status(403);
        return res.send({success:false,reason:"Who do you think you are?"});
    }

};

//обробка запиту видалення користувача
exports.deleteUser= function (req,res) {
    //забороняємо видаляти самого себе
    if(req.user._id==req.params.id){
        res.status(403);
        return res.send({success:false,reason:"I'm afraid I can't let you do that, "+req.user.firstName});
    }
    //видаляємо користувача за id
    User.remove({_id: req.params.id}, function(err, result){
        if(err){
            res.status(400);
            return res.send({success:false,reason:err.toString()});
        }else{
            res.send({success:true});
        }
    });
};