var nodeMailer = require("nodemailer");
var EmailTemplate = require('email-templates').EmailTemplate;

//директорія з шаблонами листів
var templatesDir=__dirname+"/../views/email";

//функція відсилки листа
function sendMail (email,subject,text) {
    //створюємо дефолтний поштовий транспорт - smtp
    var transporter = nodeMailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'email',
            pass: 'password'
        }
    });

    //встановлюємо опції повідомлення
    var mailOptions = {
        from: 'Retro Tech Store <retrotechstore@gmail.com>',
        to: email,
        subject: subject,
        html: text
    };

    //відсилаємо повідомлення
    transporter.sendMail(mailOptions, function(error, response){
        if(error){
            console.log(error);
        }else{
            console.log("Email sent: " + response.response);
        }
    });

}

//відсилка інформації про замовлення
exports.sendOrderInfo= function (user,order,host) {
    //беремо шаблон листа
    var newsletter = new EmailTemplate(templatesDir+"/order-info");
    //інформація для вставки
    var info = {
        username: user.firstName,
        userid:user._id,
        host: host,
        orderurl:order
    };
    //рендеримо лист з потрібною інформацією
    newsletter.render(info, function (err, results) {
        if(!err){
            //відсилаємо отриманого листа
            sendMail(user.email,"Your order info",results.html);
        }else {
            console.log("Message rendering error: "+err);
        }
    });
};

