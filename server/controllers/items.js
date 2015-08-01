//items.js

var Item=require("mongoose").model("Item");
var Reply=require("mongoose").model("Reply");
var fileSystem=require("../utilities/filesystem");
var pauseStream = require('pause-stream');
var async=require("../utilities/async");

//обробка запиту на отримання колекції товарів, що належать до вказаної категорії
exports.getCategory= function (req,res) {

    var searchRequest={
        "category":req.params.category
    };

    if(!req.user || !req.user.hasRole("merchandiser")){
        searchRequest.available=true;
    }

    //знаходимо в БД всі товари, категорія яких еквівалентна вказаній в запиті
    Item.find(searchRequest).exec(function (err,collection) {
            res.send(collection);
        });
};

//обробка запиту на отримання колекції товарів, що містять вказаний тег
exports.getByTag= function (req,res) {

    var searchRequest={
        "tags":req.params.tag
    };

    if(!req.user || !req.user.hasRole("merchandiser")){
        searchRequest.available=true;
    }

    //знаходимо в БД всі товари, категорія яких еквівалентна вказаній в запиті
    Item.find(searchRequest).exec(function (err,collection) {
            res.send(collection);
        });
};

//обробка запиту на отримання одного товару
exports.getItem= function (req,res) {

    //функція послідовної рекурсивної асинхронної побудови дерева коментарів
    function buildRepliesTree(element,callback){

        //функція послідовного асинхронного циклу обходу відповідей
        function chainedCycle(index){
            //4. відправляємо відповідь в функцію buildRepliesTree, для знаходження відповідей до неї
            buildRepliesTree(element.replies[index], function () {
                //5а.Якщо наявна друга відповідь до того ж елементу обробляємо її.
                if (element.replies[index + 1]) {
                    chainedCycle(index + 1);
                //5б.Інакше - викликаємо коллбек
                }else{
                    callback();
                }
            });
        }

        //1.перш за все знаходимо всі відповіді до поточного елементу
        Reply.find({parent:element._id}).exec(function (err,collection) {

            //here may be some danger. It could be better to replace it with
            //callback - whole item wouldn't be available just because of one singe comment???
            if(err){
                res.status(400);
                return res.send({success:false});
            }

            //2.додаємо відповіді до елементу
            element.replies=[];
            for(var reply=0;reply<collection.length;reply++){
                element.replies[reply]=collection[reply];
            }

            //3а.Якщо наявна перша відповідь, відправляємо її в послідовний асинхронний цикл
            if(element.replies[0]) chainedCycle(0);
            //3б.Якщо відповіді нема - викликаємо коллбек
            else{
                callback();
            }
        });
    }

    //шукаємо товар за id
    Item.find({_id:req.params.id}).exec(function (err,collection) {
        //якщо елемент існує
        if(collection && collection.length) {

            //якщо товар неактивовано - забороняємо не торговцям його перегляд
            //за прямим посиланням
            if((!req.user || !req.user.hasRole("merchandiser")) && !collection[0].available){
                res.status(403);
                return res.send({sucess:false,reason:"Not authorized!"});
            }

            //збільшуємо лічільник переглядів товару
            collection[0].views++;
            //зберігаємо товар
            collection[0].save(function (err) {
                if (err) {
                    res.status(400);
                    return res.send({success:false,reason:err.toString()});
                } else {
                    //вказуємо методу серіалізації, що нам необхідна повна версія товару
                    collection[0].fullVersion=true;
                    //будуємо дерево коментарів
                    buildRepliesTree(collection[0], function () {
                        //6. якщо відповідей більш нема - повертаємо клієнту товар
                        res.send(collection);
                    });
                }
            });
        //якщо нічого не знайдено відсилаємо повідомлення 404
        } else{
            res.status(404);
            return res.send({success: false, reason: "There is no such item!"});
        }
    });
};


//обробка запиту на видалення коментаря
exports.deleteComment= function (req,res) {
    //виконання запиту
    Reply.remove({_id:req.params.id},
        function (err, result) {
            if(!err){
                return res.send({success:true});
            }else{
                res.status(400);
                return res.send({success:false});
            }
        });

    //не примушуємо користувача чекати на завершення процедури видалення дочірніх елементів
    //і видаляємо їх вже після відповіді клієнту

    //будуємо список дочірніх елементів
    var children=[];
    function makeChildrenList(element){
        for(var i=0;i<element.replies.length;i++){
            makeChildrenList(element.replies[i]);
            children.push(element.replies[i]._id);
        }
    }

    makeChildrenList(req.body.comment);

    //відсилаємо до БД запити видалення кожного з них
    for(var i=0;i<children.length;i++){
        Reply.remove({_id:children[i]},
            function (err, result) {
                if(err){
                    console.log(err.toString());
                }
            });
    }
};

//обробка запиту на додавання відповіді
exports.addComment= function (req,res) {
    var reply=req.body;
    reply.date=new Date();

    //якщо поточний користувач має роль продавця, його відповіді помічаються
    if(req.user && req.user.hasRole("merchandiser")){
        reply.administrative=true;
    }

    Reply.create(reply, function (err,item) {
       if(err){
           res.status(400);
           return res.send({success:false,reason:err.toString()});
       }else{
           return res.send({success:true,reply:item});
       }
    });
};

//обробка запиту створення товару
exports.createItem= function (req,res) {

    var item,
        id,
        currentImage=0;

    //функція створення запису в БД і директорії для збереження файлів товару
    function createItem(callback){
        Item.create(item, function (err, item) {
            if (err) {
                //якщо не вдалося створити запис - відсилаємо повідомлення про помилку
                res.status(503);
                return res.send({success:false, reason:err.toString()});
            } else {
                //інакше створюємо директорію для збереження зображень товару
                fileSystem.createFolder("client/res/img/" + item._id, function (err) {
                    if(!err){
                        //якщо директорію створено, викликаємо колбек функції черги зчитувань файлів
                        id=item._id;
                        callback();
                    }else {
                        //якщо директорію не створено - необхідно все одно викликати коллбек,
                        //для того, щоб зчитування потоку завершилося, але цього разу ініціалізуємо
                        //id одиницею
                        id=1;
                        callback();
                        //повертаємо користувачу повідомлення про частковий успіх
                        res.status(207);
                        return res.send({success:true, reason:err.toString(),id:item._id});
                    }
                });
            }
        });
    }

    var itemCreateQueue=new async.Queue(createItem);

    //додамо лічильник всіх коллбеків завантажень файлів, який повертатиме
    //користувачу повідомлення про успіх, після завантаження останнього файлу
    var runAfterAllImagesUploaded=new async.RunAfterLastCallback(function () {
        console.log("Item "+id+" created");
        return res.send({success:true,id:id});
    });

    //якщо наявний парсер потоку даних форми - починаємо його читання
    if(req.busboy) {
        //подія зчитування поля відбувається першою, оскільки ми додали поле першим в об’єкт formData
        req.busboy.on('field', function(fieldName, fieldValue, valTruncated,keyTruncated) {
            item=JSON.parse(fieldValue);
        });
        //подія зчитування файлу
        req.busboy.on("file", function(fieldName, fileStream, fileName, encoding, mimeType) {
            runAfterAllImagesUploaded.add();
            //створюємо додатковий потік, в який буде буферизуватися потік файлу
            var pStream;
            pStream = pauseStream();
            fileStream.pipe(pStream.pause());
            //ставимо файл в чергу до створення запису в БД і директорії
            itemCreateQueue.getInLine(function () {
                //коли директорію створено - записуємо файл
                fileSystem.writeFile(pStream)(currentImage++,id,runAfterAllImagesUploaded.runAnotherOne.bind(runAfterAllImagesUploaded));
            });
        });
        //подія завершення зчитування потоку
        req.busboy.on('finish', function() {
            //якщо жодного файлу нема записуємо товар без них
            if(item.images==0){
                createItem(function () {
                    console.log("Item "+id+" creation completed.");
                    return res.send({success:true,id:id});
                });
            }
        });
        //починаємо зчитування потоку
        req.pipe(req.busboy);
    }
    else {
        //якщо парсер потоку відсутній - відсилаємо повідомлення про помилку
        res.status(503);
        return res.send({success:false, reason:"Missing streaming parser!"});
    }
};

//обробка запиту видалення товару
exports.deleteItem= function (req,res,next) {

    //вилаляємо товар з БД
    Item.remove({_id: req.params.id}, function(err, result){
        if(err){
            res.status(400);
            return res.send({success:false,reason:err.toString()});
        }else{
            //в разі успіху - видаляємо його директорію з зображеннями
            fileSystem.removeRecursively("client/res/img/" + req.params.id, function () {
                //за викликаємо наступний обробник - видалення коментарів
                next();
            });
        }
    });
};

//обробка запиту оновлення товару
exports.updateItem= function (req,res) {

    var id,
        fields=[],
        currentImage=0;

    //функція порівняння двох об’єктів зображення
    var imagesComparator= function (img1) {
        return function (img2) {
            //встановлюємо ідентичність за рівністю URL
            return img1.src===img2.src;
        }
    };

    //оновлення товару
    function updateItem(callback){
        id=fields["model"]._id;
        //MongoDB не дозволяє оновлювати id запису, тому видаляємо його з оновлених даних
        delete fields["model"]._id;

        var query = {"_id":id};
        var update = fields["model"];
        var options = {new: true, runValidators:true};

        Item.findOneAndUpdate(query, update, options, function(err, item) {
            //якщо товару для оновлення не знайдено - повертаємо помилку
            if (err) {
                res.status(400);
                return res.send({success:false,reason:err.toString()});
            } else{
                //додаємо лічильник колбеків видалень файлів,
                //який запускатиме оновлення імен файлів, що залишилися
                var runAfterFilesRemoved = new async.RunAfterLastCallback(function () {
                        fileSystem.updateFileNames(id, function (err,renamed) {
                            //після оновлення імен встановлюємо ім’я наступного зображення для запису
                            currentImage=renamed;
                            //і повертаємося
                            callback();
                        });
                });
                //порівнюємо поточний список зображень, з оновленим списком зображень
                for(var i=0;i<fields["initialImages"].length;i++){
                    var imgSearchResult = fields["endingImages"].filter(
                        imagesComparator(fields["initialImages"][i])
                    );
                    //якщо в оновленому списку зображень нема зображення з поточного списку - видаляємо його
                    if(!imgSearchResult.length){
                        runAfterFilesRemoved.add();
                        fileSystem.removeRecursively("client/"+fields["initialImages"][i].src,runAfterFilesRemoved.runAnotherOne.bind(runAfterFilesRemoved));
                    }
                }
                //якщо жодного зображення видаляти не треба
                //встановлюємо іменем наступного зображення кількість поточних
                //та повертаємося
                if(runAfterFilesRemoved.isEmpty()){
                    currentImage=fields["initialImages"].length;
                    callback();
                }
            }
        });


    }


    var itemUpdateQueue=new async.Queue(updateItem);
    var runAfterAllImagesUploaded=new async.RunAfterLastCallback(function () {
        console.log("Item "+id+" updated.");
        return res.send({success:true});
    });

    if(req.busboy) {
        req.busboy.on('field', function(fieldName, fieldValue, valTruncated,keyTruncated) {
            fields[fieldName]=JSON.parse(fieldValue);
        });
        req.busboy.on("file", function(fieldName, fileStream, fileName, encoding, mimeType) {
            runAfterAllImagesUploaded.add();
            var pStream;
            pStream = pauseStream();
            fileStream.pipe(pStream.pause());

            itemUpdateQueue.getInLine(function () {
                fileSystem.writeFile(pStream)(currentImage++,id,runAfterAllImagesUploaded.runAnotherOne.bind(runAfterAllImagesUploaded));
            });
        });
        req.busboy.on('finish', function() {
            if (runAfterAllImagesUploaded.isEmpty()){
                updateItem(function(){
                        console.log("Item "+id+" updated.");
                        return res.send({success:true});
                });
            }
        });
        req.pipe(req.busboy);
    }
    else {
        res.status(503);
        return res.send({success:false, reason:"Missing streaming parser!"});
    }

};

//запит останніх доданих товарів
exports.getLatestItems= function (req,res) {
    //знаходимо доступні товари, сортуємо їх за датою отримання, та обмежуємо кількість десятьма
    Item.find({available:true}).sort('-received').limit(10).exec(function(err, items){
        if(err){
            res.status(500);
            res.send({success:false,reason:err.toString()});
        }else{
            res.send(items);
        }
    });
};