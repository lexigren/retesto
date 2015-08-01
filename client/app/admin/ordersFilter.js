//ordersFilter.js
angular.module('app').filter('ordersFilter', function () {
        return function (items,searchForm) {
            return items.filter(function (item) {
                for(var param in searchForm){

                    //якщо наявні обмеження за датою, відкидаємо замовлення старші чи молодші за вказане обмеження
                    if(param==="dateFrom") {
                        if(new Date(item.date).getTime()<searchForm[param].getTime()) return false;
                    }
                    if(param==="dateTo") {
                        if(new Date(item.date).getTime()>=(searchForm[param].getTime()+1000*60*60*24)) return false;
                    }

                    //якщо наявні дані в полі імені користувача, шукаємо співпадіння з ними як в імені, так і прізвищі
                    if(param==="customer"){
                        var firstNameMatch=item.customer.firstName.toLowerCase().match(searchForm[param].toLowerCase());
                        var lastNameMatch=item.customer.lastName.toLowerCase().match(searchForm[param].toLowerCase());
                        if(!firstNameMatch && !lastNameMatch){
                            return false;
                        }
                    }

                    //пошук за адресою
                    if(param==="address"){
                        var addressMatch=item.shippingAddress.toLowerCase().match(searchForm[param].toLowerCase());
                        if(!addressMatch){
                            return false;
                        }
                    }

                    //та ціною
                    if(param==="priceFrom"){
                        if(parseFloat(item.totalPrice)<parseFloat(searchForm[param])) return false;
                    }

                    if(param==="priceTo"){
                        if(parseFloat(item.totalPrice)>parseFloat(searchForm[param])) return false;
                    }
                }

                //якщо всі фільтрації пройдено - пропускаємо елемент
                return true;
            });
        }
    });
