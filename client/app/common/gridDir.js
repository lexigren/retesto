//gridDir.js

angular.module("app").directive('gridRepeat',function($timeout,$compile){
    return {
        restrict: 'A',
        multiElement: true,
        //вказуємо, що ми хочемо отримати копію всього елементу, до якого було застосовано директиву
        transclude: 'element',
        //В даному випадку, до декларуючого об’єкту важливо додати приорітет обробки директиви.
        //Це виконується тоді, коли до одного html елементу додається одразу декілька
        //angular директив.
        //В разі, коли робота однієї директиви не залежить від іншої, вказання приорітету можна
        //пропустити і angular автоматично визначить порядок обробки директив.
        //Але в протилежному випадку, залежна директива може бути оброблена до тієї, від якої вона залежить,
        //що призведе до порушення роботи програми.
        //Оскільки ми використовуємо директиви ng-click і grid-repeat одночасно, надання директиві grid-repeat
        //дефолтного приорітету призведе до попередньої обробки ng-click, без наявного scope елементів сітки,
        //які мають викликати обробник кліку по ним.
        priority: 1000,
        compile: function gridRepeatCompile($element, $attr) {
            //контейнер сітки
            var table = jQuery('<div/>');
            table.addClass("gridContainer");
            $element.parent().append(table);

            return function link (scope, element, attrs, controller, transclude) {

                //ітераційний вираз
                var expression = attrs.gridRepeat;
                //його розділення на елементи
                var match = expression.match(/^\s*([\s\d]+?)\s+([\s\S]+?)\s+in\s+([\s\S]+?)$/);
                //console.log(match);

                //кількість колонок сітки
                var colNum=parseInt(match[1]);
                //назва ітераційної змінної
                var value = match[2];
                //назва ітерованої колекції
                var collection = match[3];

                //масив елементів які треба скомпілювати
                var elementsToCompile = [];
                //масив скомпільованих елементів
                var compiledElements = [];

                //функція розподілення скомпільованих елементів в структуру сітки
                function resetGrid(data) {
                    var row = 0;
                    var element = 0;
                    var rowSize = colNum;
                    var img;
                    scope.gridData = [];
                    while (img = data[row * rowSize + element]) {
                        if (!scope.gridData[row]) scope.gridData[row] = [];
                        scope.gridData[row][element++] = img;
                        if (element >= rowSize) {
                            row++;
                            element = 0;
                        }
                    }
                }


                //спостерігаємо за змінами масива, який необхідно вивести у вигляді сітки
                scope.$watchCollection(collection, function (newCollection, oldCollection) {

                    var i;

                    //видаляємо з масиву скомпільованих елементів ті, що відсутні в цільовому масиві
                    for (i = 0; i < elementsToCompile.length; i++) {
                        if (newCollection.indexOf(elementsToCompile[i]) < 0) {
                            elementsToCompile.splice(i, 1);
                            compiledElements[i].el.remove();
                            compiledElements[i].scope.$destroy();
                            compiledElements.splice(i, 1);
                            i--;
                        }
                    }

                    var block, childScope;

                    //компілюємо ще не скомпільовані елементи
                    for (i = 0; i < newCollection.length; i++) {
                        if (elementsToCompile.indexOf(newCollection[i]) >= 0) continue;
                        //для кожного нового скомпільованого елементу створюється свій власний scope
                        childScope = scope.$new();
                        //саме з цього scope буде братися значення кожної ітераційної змінної
                        childScope[value] = newCollection[i];

                        //за допомогою angular функції transclude ми отримуємо transclude елемент
                        //вже скомпільований для вказаного scope
                        //таким чином ми отримуємо клітинку сітки з фінальним внутрішнім змістом
                        transclude(childScope, function (clone, cloneScope) {
                            block = {};
                            block.el = clone;
                            block.scope = cloneScope;
                            //вносимо фінальну клітинку в масив скомпільованих елементів
                            compiledElements.push(block);
                            elementsToCompile.push(cloneScope[value]);
                        });
                    }


                    //розподіляємо скомпільовані елементи по сітці
                    resetGrid(compiledElements);
                    //відмальовуємо сітку
                    //Очистка контейнеру відбувається від’єднанням всіх дочірніх елементів.
                    //Службові дочірні елементи, такі як елементи розмітки сітки row і col
                    //втратять будь-які reference змінні, а отже не будуть досяжні, і підпадуть
                    //під дію garbage коллектора. Елементи клітинки збережені в масиві, а тому залишаться.
                    //Якщо тут використати empty, scope кожної клітинки збережеться, але втратить прив’язку до
                    //об’єктів батьківського scope.
                    table.children().detach();
                    for (i = 0; i < scope.gridData.length; i++) {
                        var row = jQuery('<div/>');
                        row.addClass("gridRow");
                        for (var j = 0; j < scope.gridData[i].length; j++) {
                            var col = jQuery('<div/>');
                            col.addClass("gridCol");
                            col.css({
                                width: "" + (100 / colNum) + "%"
                            });
                            col.append(scope.gridData[i][j].el);
                            row.append(col);
                        }
                        table.append(row);
                    }
                });
            }
        }
    };
});