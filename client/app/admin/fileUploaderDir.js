//fileUploaderDir.js

angular.module("app").directive('fileUploader',function($timeout,Notifier){
    return {
        restrict: 'E',
        templateUrl:'/partials/admin/file-uploader',
        link: function (scope,element,attrs) {

            scope.images=scope.images||[];

            //функція додавання файлів для завантаження
            function addFiles(files){
                for(var file=0;file<files.length;file++){
                    //якщо файл не є зображенням - пропускаємо його
                    if (!files[file].type.match(/image.*/)) {
                        Notifier.error("You can't upload whatever you want. Select only images!");
                    }else{

                        function pushImage(image){
                            scope.images.push({
                                file:image.file,
                                src:image.src
                            });
                            scope.item.images++;
                            scope.$apply();
                        }

                        //створення зображення попереднього перегляду, в залежності від браузеру
                        if(window.URL){
                            pushImage({
                                file:files[file],
                                src:window.URL.createObjectURL(files[file])
                            });
                        }else{
                            var reader = new FileReader();
                            reader.onload = function(file,e) {
                                pushImage({
                                    file:files[file],
                                    src:e.target.result
                                });
                            }.bind(null,file);
                            reader.readAsDataURL(files[file]);
                        }
                    }
                }
            }

            //вилучення файлу з масиву для завантаження
            scope.removeImg=function(img){
                scope.images.splice(scope.images.indexOf(img),1);
                scope.item.images--;
            };


            //додавання подій до drop зони

            //якщо над нею тягнуть файли - виділяємо
            element.children(".dropZone").bind("dragover", function () {
                this.className="dropZone drop";
                return false;
            });

            element.children(".dropZone").bind("dragleave", function () {
                this.className="dropZone";
                return false;
            });

            //якщо на drop зону перетягли файли, відправляємо їх у функцію додавання файлів
            element.children(".dropZone").bind("drop", function (e) {
                e.preventDefault();
                addFiles(e.originalEvent.dataTransfer.files);
                this.className="dropZone";
                return false;
            });

            //якщо файли вибрані зі стандартного елементу завантаження - також додаємо файли
            element.children(".standardUploader").bind("change", function (e) {
                addFiles(this.files);

                $(this).val('');
            });

        }
    };
});