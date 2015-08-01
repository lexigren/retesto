//auth.js

var passport=require("passport");

//запит аутентифікації
//в express має значення порядок визначення обробників адрес запитів в файлі.
//якщо ми напишемо обробник більш загального запиту раніше більш деталізованих,
//то всі запити відловлюватимуться загальним
//next дозволяє вийти з поточного обробника і знайти наступний, що підходить під активний запит
exports.authenticate=function(req,res,next){
    req.body.email=req.body.email.toLowerCase();
    //отримуємо функцію аутентифікації, передавши їй callback який викликається
    //функцією done з модуля passport
    var auth=passport.authenticate("local",function(err,user,details){
        if(err) return next(err);
        //якщо отримано false відсилаємо клієнту повідомлення про фейл
        if(!user) {
            res.status(403);
            return res.send({success: false, reason: details.message});
        }
        //logIn - функція додана passport, додає користувача в сесію
        req.logIn(user,function(err){
            if(err) return next(err);
            //в разі успіху відсилаємо клієнту повідомлення про успіх і користувача
            res.send({success:true, user: user});
        });
    });

    //викликаємо отриману функцію
    auth(req,res,next);
};

//перевірка аутентифікації
exports.requiresApiLogin=function(req,res,next){
    //isAuthenticated автоматично додається passport
    if(!req.isAuthenticated()){
        //якщо поточний користувач відсутній в сесії - відповідаємо forbidden і завершуємо запит
        res.status(403);
        res.end();
    }else{
        //інакше викликаємо наступну функцію в ланцюжку - usersCtrl.getUsers
        next();
    }
};

//перевірка авторизації
exports.requiresRole=function(role){

    //ланцюжкова функція
    var chainFunction=function(req,res,next){
        //якщо поточного користувача не існує, або він не має необхідної ролі -
        //завершуємо запит зі статусом forbidden
        if(!req.isAuthenticated() || !(req.user.roles.indexOf(role)>-1)){
            res.status(403);
            //res.end();
            res.send({success:false,reason:"Authorization failure!"});
        }else{
            //інакше викликаємо контроллер користувачів
            next();
        }
    };

    //повертаємо ланцюжкову функцію
    return chainFunction;
};

//перевірка належності ресурсу поточному користувачу, або користувачу з вказаною роллю
exports.currentUserOr=function(role){
    return function (req,res,next) {
        //пропускаємо запит, якщо користувач аутентифікований, та його id збігається з id користувача,
        //якому належить бажаний ресурс, або якщо користувач має вказану роль
        if(req.isAuthenticated() &&
            (req.params.id.toString()===req.user._id.toString() || req.user.roles.indexOf(role)>-1)){
            next();
        }else{
            res.status(403);
            res.send({success:false,reason:"Authorization failure!"});
        }
    }
};