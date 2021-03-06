var budgetController = (function() {
    
    var Expense = function(id, description, value) {
        this.id = id; 
        this.description = description; 
        this.value = value;
        this.percentage = -1; 
    };
    
    Expense.prototype.calcPercentage = function(totalIncome){
        
        if (totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1; 
        }
    }; 
    
    Expense.prototype.getPercentage = function() {
        return this.percentage; 
    }; 
    
    var Income = function(id, description, value) {
        this.id = id; 
        this.description = description; 
        this.value = value;
    };
    
    var calculateTotal = function(type) { 
        var sum = 0; 
        data.allItems[type].forEach(function(cur) {
           sum = sum + cur.value; 
        });
        data.totals[type] = sum; 
    }; 
    

    var data = {
        allItems: {
            expense: [], 
            income: []
        }, 
        totals: {
            expense: 0, 
            income: 0
        }, 
        budget: 0, 
        percentage: -1
    }
    
    return {
        addItem: function(type, des, val){
            var newItem, ID; 
            
            // create new ID
            if (data.allItems[type].length > 0 ){
                ID = data.allItems[type][data.allItems[type].length -1].id + 1;
            } else {
                ID = 0; 
            }
            
            //Create new items based on inc or exp type
            if (type === 'expense') {
                newItem = new Expense(ID, des, val)
            } else if (type === 'income'){
                newItem = new Income(ID, des, val)
            }
            
            // Push it into our data structure
            data.allItems[type].push(newItem);
            
            // Return the new element
            return newItem;
        }, 
        
        deleteItem: function(type, id) {
            var ids, index;
            
            ids = data.allItems[type].map(function(current){
                return current.id; 
            }); 
            
            index = ids.indexOf(id); 
            
            if (index !== -1) {
                data.allItems[type].splice(index, 1); 
            }
            
        }, 
        
        calculateBudget: function() {
             
            // calculate total income and expenses 
            calculateTotal('expense'); 
            calculateTotal('income'); 
            
            // calculate the buget: income - expenses 
            data.budget = data.totals.income - data.totals.expense
            
            // calculate the percentage of income we spent 
            if (data.totals.income > 0) {
                data.percentage = Math.round((data.totals.expense / data.totals.income) * 100);
            } else {
                data.percentage = -1; 
            }
        }, 
        
        calculatePercentages: function() {
            data.allItems.expense.forEach(function(cur) {
                cur.calcPercentage(data.totals.income)
            }); 
            
        }, 
        
        getPercentages: function() {
           var allPerc = data.allItems.expense.map(function(cur) {
               return cur.getPercentage();
           }); 
            return allPerc;
        }, 
        
        getBudget: function(){
           return {
               budget: data.budget, 
               totalInc: data.totals.income, 
               totalExp: data.totals.expense, 
               percentage: data.percentage
           } 
        }, 
        
        testing: function(){
        console.log(data)
        }
    }; 
    
})(); 


var UIController = (function() {

    var Domstrings = {
        inputType: '.add__type', 
        inputDescription: '.add__description', 
        inputValue: '.add__value', 
        inputBtn: '.add__btn', 
        incomeContainer: '.income__list', 
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value', 
        expensesLabel: '.budget__expenses--value', 
        percentageLabel: '.budget__expenses--percentage', 
        container: '.container', 
        expensesPercLabel: '.item__percentage', 
        dateLabel: '.budget__title--month'
    }; 
    
    var formatNumber = function(num, type) {
            var numSplit, int, dec, type; 
            
            num = Math.abs(num);
            num = num.toFixed(2);
            
            numSplit = num.split('.'); 
            
            int = numSplit[0]; 
            if (int.length > 3) { 
                int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3)
            }
            
            dec = numSplit[1];
            
            return (type === 'expense' ? sign = '-' : sign = '+') + ' ' + int + '.' + dec
    };
    
    var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i); 
        }
    };
    
    return {
        getInput: function() { 
            return {
                type: document.querySelector(Domstrings.inputType).value,  
                description: document.querySelector(Domstrings.inputDescription).value, 
                value: parseFloat(document.querySelector(Domstrings.inputValue).value)
            }; 
        }, 
        
        addListItem: function(obj, type){
            var html, newHtml, element; 
            // create html string with placeholder text
            if (type === 'income'){
                element = Domstrings.incomeContainer; 
                
                html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            } else if (type === 'expense') {
                element = Domstrings.expensesContainer; 
                
                html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            
            // replace placeholder text with actual data
            newHtml = html.replace('%id%', obj.id); 
            newHtml = newHtml.replace('%description%', obj.description); 
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            
            // insert the html into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
                      
        }, 
        
        deleteListItem: function(selectorID) {
            
           var element = document.getElementById(selectorID)
           element.parentNode.removeChild(element) 
        }, 
        
        clearFields: function() {
            var fields, fieldsARR; 
            
            fields = document.querySelectorAll(Domstrings.inputDescription + ', ' + Domstrings.inputValue); 
            
            fieldsARR = Array.prototype.slice.call(fields); 
            
            fieldsARR.forEach(function(current, index, array){
                current.value = ""; 
            });
            
            fieldsARR[0].focus(); 
            
        }, 
        
        displayBudget: function(obj){
            
            obj.budget > 0 ? type = 'income' : type = 'expense' 
            
            document.querySelector(Domstrings.budgetLabel).textContent = formatNumber(obj.budget, type);  
            document.querySelector(Domstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'income');  
            document.querySelector(Domstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'expense'); 
            
            if (obj.percentage > 0) {
                document.querySelector(Domstrings.percentageLabel).textContent = obj.percentage + '%'; 
            } else {
                document.querySelector(Domstrings.percentageLabel).textContent = '---';    
            }
            
            
        }, 
        
        displayPercentages: function(percentages) {
            var fields = document.querySelectorAll(Domstrings.expensesPercLabel); 
            
            nodeListForEach(fields, function(current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---'; 
                }                
            }); 
            
        },
        
        displayMonth: function() {
            var now, year, month, months;
            
            now = new Date(); 
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
            month = now.getMonth(); 
            year = now.getFullYear(); 
            document.querySelector(Domstrings.dateLabel).textContent = months[month] + ' ' + year; 
        },
        
        changedType: function() {
            
            var fields = document.querySelectorAll(
                Domstrings.inputType + ',' + 
                Domstrings.inputDescription + ',' +
                Domstrings.inputValue); 
            
            nodeListForEach(fields, function(cur) {
                cur.classList.toggle('red-focus'); 
            }); 
            
            document.querySelector(Domstrings.inputBtn).classList.toggle('red'); 
            
        },
           
        getDOMstrings: function(){
            return Domstrings; 
        }
    };    
})(); 


var Controller = (function(budgetCtrl, UICtrl) {
    
    var setupEventListeners = function() {    
        var DOM = UICtrl.getDOMstrings()
        
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
        
        document.addEventListener('keypress', function(event) {
            if (event.keyCode === 13 || event.which === 13){
                ctrlAddItem(); 
            }
        });
        
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem); 
        
        document.querySelector(DOM.inputType).addEventListener('change' ,UICtrl.changedType); 
    };
    
    var updateBudget = function() { 
    
        // 1. Calculate the budget
        budgetCtrl.calculateBudget(); 
        
        // 2. return the budget 
        var budget = budgetCtrl.getBudget(); 
        
        // 3. Display the budget on the UI
        UICtrl.displayBudget(budget);
    };
    
    var updatePercentages = function() {
        
        // 1. calculate percentages 
        budgetCtrl.calculatePercentages();
        
        // 2. read percentages from budget controller
        var percentages = budgetCtrl.getPercentages();
        
        // 3 update the UI with the new percentages
        UICtrl.displayPercentages(percentages); 
    };   

    
    var ctrlAddItem = function() {
        //declare variables instead of typing them individually, var input and then var newItem, DRY code
        var input, newItem; 
        
        // 1. get the field input data
        input = UICtrl.getInput();
        
        if (input.description !== "" && !isNaN(input.value) && input.value > 0){
            // 2. Add the item to the budget controller 
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
        
            // 3. Add the item to the UI
            UICtrl.addListItem(newItem, input.type); 
        
            // 4. Clear the fields 
            UICtrl.clearFields(); 
        
            // 5. Calculate the budget
            updateBudget(); 
            
            // 6. Calculate and update budget
            updatePercentages(); 
        } 
    }; 
    
    var ctrlDeleteItem = function(event){
        var itemID, splitID, type, ID; 
        
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if (itemID) {
            
            splitID = itemID.split('-'); 
            type = splitID[0]; 
            ID = parseInt(splitID[1]); 
            
            // 1. delete item from data structure
            budgetCtrl.deleteItem(type, ID)
            
            // 2. delete item from user interface 
            UICtrl.deleteListItem(itemID); 
            
            // 3. Update and show the new budget
            updateBudget(); 
        }
        
    }

    return {
        init: function() {
            console.log('Application started');  
            UICtrl.displayMonth(); 
            UICtrl.displayBudget({
                budget: 0, 
                totalInc: 0, 
                totalExp: 0, 
                percentage: -1
            }); 
            setupEventListeners();
        }
    }
    
})(budgetController, UIController); 

Controller.init(); 