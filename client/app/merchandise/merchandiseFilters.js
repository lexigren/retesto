//merchandiseFilters.js

angular.module('app')
    //фільтр ціни
    .filter('price', function () {
        return function (items,from,to) {
            //фільтр має бути функцією, що приймає елемент для фільтрації
            //та повертає істину якщо він відповідає умовам
            return items.filter(function (item) {
                //якщо є дані в полі нижньої межі ціни, повертаємо false, якщо ціна товару менша
                if(from) if(item.price<from) return false;
                //якщо введено верхню межу - навпаки
                if(to) if(item.price>to) return false;
                //якщо обидва поля порожні - не фільтруємо нічого
                return true;
            });
        };
    })
    //комплексний пошук за заздалегідь невідомою кількістю полів та їх типів
    //для виконання пошуку переглядається об’єкт searchForm, прив’язаний до форми фільтрації
    .filter('specifications', function () {
        return function (items,searchForm) {
            return items.filter(function (item) {
                //береться кожне поле форми пошуку
                for(var param in searchForm){

                    //знаходимо потрібну характеристику в товарі
                    var currentSpecInItem = item.specifications.filter(
                        function (p,spec) {
                            return spec.specName==p;
                        }.bind(null,param)
                    );
                    //якщо її нема - відкидаємо товар
                    if((searchForm[param].select || searchForm[param].from || searchForm[param].to)
                        && !currentSpecInItem.length){
                        return false;
                    //інакше - дивимося, чи співпадає її значення з потрібним
                    }else if(currentSpecInItem.length){
                        //якщо вибрано характеристику зі списку
                        if(searchForm[param].select){
                            if (currentSpecInItem[0].specValue != searchForm[param].select) {
                                return false;
                            }
                        //якщо з діапазону
                        } else if(searchForm[param].from || searchForm[param].to){
                            //якщо встановлено нижню межу значення характеристики - відкидаємо все, що менше
                            if (searchForm[param].from &&
                                parseFloat(currentSpecInItem[0].specValue) < parseFloat(searchForm[param].from)) {
                                return false;
                            }
                            //якщо користувач встановив значення верхньої межі значення характеристики
                            //відфільтровуємо товари з перевищеною характеристикою
                            if (searchForm[param].to &&
                                parseFloat(currentSpecInItem[0].specValue) > parseFloat(searchForm[param].to)) {
                                return false;
                            }
                        }
                    }
                }

                return true;
            });

        }
    })
    //фільтр сторінок
    .filter('pagination', function()
    {
        return function(items, start){
            //відрізаємо від списку всі товари, які йдуть до першого товару з необхідної сторінки
            return items.slice(start);
        }
    });
