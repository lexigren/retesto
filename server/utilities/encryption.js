//encryption.js
//включаємо модуль шифрування
var crypto=require("crypto");

//генерація ключа - випадкової непередбачуваної послідовності 128 байт
//представлених у вигляді тексту на базі алфавіту з 64 символів
exports.createSalt=function(){
    return crypto.randomBytes(128).toString("base64");
};

//генерація хешованого паролю з використанням salt в якості ключа
exports.createHashedPassword=function(salt, password){
    //використовується алгоритм шифрування sha1 для створення приватного ключа hmac
    var hashMessageAuthenticationCode=crypto.createHmac("sha1",salt);
    //отриманий hmac оновлюється паролем користувача та повертається у вигляді хеш суми в шіснадцятковому вигляді
    return hashMessageAuthenticationCode.update(password).digest("hex");
};