//fieldFormatFilter.js

angular.module('app')
    .filter('formatFields', function ($filter) {
        return function (rawObject) {
            var formattedObject={};
            //переглядаємо всі поля об’єкту
            for(name in rawObject){
                //беремо лише власні поля об’єкту і відкидаємо технічні поля MongoDB
                if(rawObject.hasOwnProperty(name) && !(name=="__v" || name=="_id")) {
                    //Якщо одне з полей об’єкту виявиться датою, представимо
                    //його не в вигляді тарабарщини, в якому зазвичай зберігається дата
                    //а відформатуємо, викликавши вбудований фільтр дат angular
                    if(rawObject[name].toString().match(/\d{4}[-|\/|\.|\\]\d{2}[-|\/|\.|\\]\d{2}/g) &&
                        (new Date(rawObject[name])).toString()!=="Invalid Date"){
                        rawObject[name]=$filter("date")(new Date(rawObject[name]),'yyyy/MMM/dd HH:mm:ss');
                    }
                    //регулярними виразами розбиваємо camelCase на відокремлені слова
                    var formattedName=name.replace(/([^A-Z\-])([A-Z])/g,'$1 $2').replace(/([A-Z][^A-Z])/g,' $1');
                    formattedName=formattedName.charAt(0).toUpperCase() + formattedName.slice(1);
                    //заповнюємо результуючий читабельний об’єкт
                    formattedObject[formattedName]=rawObject[name]

                }
            }
            //повертаємо об’єкт
            return formattedObject;
        }
    });