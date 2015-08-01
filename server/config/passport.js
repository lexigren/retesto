var mongoose=require('mongoose');
var passport=require("passport");
//вибираємо локальну стратегію аутентифікації - тобто з БД сайту, а не твіттеру, фейсбуку і т.д., що passport теж дозволяє
var localStrategy=require("passport-local").Strategy;
var User = mongoose.model("User");

module.exports= function () {
    //налаштовуємо локальну аутентифікацію
    passport.use(new localStrategy(
        //необхідно вказати passport, що username-мом у нас слугує email, бо інакше авторизація не проходитиме
        {
            usernameField: 'email'
        },
        function (email, password, done) {
        //використовуємо введений користувачем юзернейм, для пошуку запису БД
        User.findOne({email: email}).exec(function (err, user) {
            //перевіряємо існування користувача
            if (user) {
                //перевіряємо користувача на заблокованість
                if(user.hasRole("blocked")){
                    //якщо заблокований - відсилаємо замість користувача false і причину
                    return done(null, false,{message:"You're blocked from logging in!"});
                }
                //перевіряємо відповідність введеного пароля
                if(user.authenticate(password)) {
                    //якщо пароль корректний,відсилаємо отриманого юзера passport
                    return done(null, user);
                }else{
                    //інакше
                    return done(null, false,{message:"Wrong password!"});
                }
            //якщо неіснує - не аутентифікуємося
            } else {
                //відсилаємо passport false
                return done(null, false,{message:"User "+email+" does not exist!"});
            }
        });
    }));

    //серіалізація і десеріалізація додається для збереження поточного користувача в сесії браузеру
    passport.serializeUser(function (user, done) {
        if (user) {
            //зберігаємо в сесії id користувача
            done(null, user._id);
        }
    });

    //при перезавантаженні сторінки з сесії береться id поточного користувача, і в базі шукається відповідний запис
    passport.deserializeUser(function (id, done) {
        User.findOne({_id: id}).exec(function (err, user) {
            if (user) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        });
    });
}