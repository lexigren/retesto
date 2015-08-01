//черга коллбеків
function Queue(process){
    //список коллбеків, що чекають на завершення процесу
    this.callbacksQueue=[];
    //маркери запущеного/закінченого статусу процесу
    this.started=false;
    this.finished=false;
    //процес
    this.process=process;

    //коллбек встає в чергу
    this.getInLine=function(callback) {

        //якщо процес завершено - одразу запускаємо коллбек і виходимо
        if(this.finished){
            callback();
            return;
        }

        //інакше - додаємо коллбек в чергу
        this.callbacksQueue.push(callback);
        //якщо процес ще не запущено - запускаємо його
        if (!this.started) {
            this.started = true;
            //коли процес завершено - викликаємо всі коллбеки з черги
            this.process(function () {
                this.finished=true;
                for (var i = 0; i < this.callbacksQueue.length; i++) {
                    this.callbacksQueue[i]();
                }
            }.bind(this));
        }
    }
}
exports.Queue=Queue;

//лічильник коллбеків
function RunAfterLastCallback(action){
    //кількість коллбеків до запуску дії
    this.callbacks2Run=0;
    //дія
    this.action=action;
    //аргументи дії
    this.arguments=Array.prototype.slice.call(arguments,1);
    //додати додатковий коллбек перед дією
    this.add= function () {
        this.callbacks2Run++;
    };
    //виконання чергового коллбеку
    this.runAnotherOne=function () {
        this.callbacks2Run--;
        //якщо їх не залишилося - викликаємо дію
        if(this.callbacks2Run==0){
            return this.action.apply(null,this.arguments);
        }
    };
    //перевірка наявності коллбеків
    this.isEmpty= function () {
        return !this.callbacks2Run;
    }
}

exports.RunAfterLastCallback=RunAfterLastCallback;