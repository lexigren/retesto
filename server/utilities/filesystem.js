var mkdirp=require("mkdirp");
var fs = require('fs-extra');
var rimraf=require('rimraf');

//функція створення директорії
function createFolder (path,callback) {
    mkdirp(path, function (err) {
        if (err) {
            console.log("Folder creation error: "+err.toString());
            if (callback) callback(err);
        }else{
            console.log("Created folder "+path);
            if (callback) callback();
        }
    });
}
exports.createFolder=createFolder;


//функція запису зображення в директорію
function writeFile(stream){
    return function (name,folder,callback) {
        //якщо id дорівнює одиниці - теку створити не вдалося, і файл пропускається
        if (folder == 1) {
            //для завершення потоку необхідно явно пропускати файл
            stream.resume();
        }
        //якщо директорію успішно створено, записуємо в неї файли зображень
        var imgName = "" + name + ".jpg";
        fstream = fs.createWriteStream("client/res/img/" + folder + "/" + imgName);
        stream.pipe(fstream);
        stream.resume();
        //подія закінчення запису файлу
        fstream.on('close', function () {
            callback();
        });
    }
}
exports.writeFile=writeFile;


//функція видалення директорії та файлів
function removeRecursively(path,callback){
    rimraf(path, function(err) {
        if (err) {
            console.log("Folder " + path + " removing error:",err);
            if(callback) callback(err);
        }else {
            console.log("Folder " + path + " and all its contents was removed.");
            if(callback) callback();
        }
    })
}

exports.removeRecursively=removeRecursively;


//функція оновлення імен файлів
//переіменовує всі файли в директорії в числа, починаючи з нуля
function updateFileNames(folder,callback){

    //зчитати вміст директорії
    fs.readdir("client/res/img/" + folder, function (err,files) {
        if(!err){
            var filesToRename=files.length;
            if(filesToRename==0){
                callback(null,0);
            }
            var renamedFiles=0;
            for(var i=0;i<files.length;i++){
                //переіменувати файл
                fs.rename("client/res/img/"+folder+"/"+files[i],"client/res/img/"+folder+"/"+i+".jpg", function(err) {
                    renamedFiles++;
                    if(renamedFiles==filesToRename){
                        callback(null,renamedFiles);
                    }
                });
            }
        }else{
            callback(err);
        }
    });

}

exports.updateFileNames=updateFileNames;