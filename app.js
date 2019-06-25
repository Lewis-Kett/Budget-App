//Budget Controller
var budgetController = (function() {
    var Expense = function(id, description, value) {
        this.id = id,
        this.description = description,
        this.value = value,
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome) {
        if(totalIncome > 0) {
            this.percentage = Math.round((this.value/totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    }

    var Income = function(id, description, value) {
        this.id = id,
        this.description = description,
        this.value = value;
    };

    var data = {
        allItems: {
            inc:[],
            exp: []
        },
        totals: {
            inc: 0,
            exp: 0
        },
        budget: 0,
        percentage: -1
    };

    var calculateTotal = function(type) {
        var total = 0;

        data.allItems[type].forEach(function(curr) {
            total += curr.value;
        });

        data.totals[type] = total;
    };

     return {
        addItem: function(type, des, val) {
            var newItem, ID;

            //Create new ID for next element
            if(data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length -1].id + 1;
            } else {
                ID = 0;
            }
            
            //Create new item based on type
            if(type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if(type === 'inc') {
                newItem = new Income(ID, des, val);
            }
            //add the element to the array 
            data.allItems[type].push(newItem);

            //return the new element
            return newItem;
        },

        deleteItem: function(type, ID) {
            var idArray, index;
            //create array of item index's for type
            idArray = data.allItems[type].map(function(curr){
                return curr.id;
            });
            //find index of element to delete
            index = idArray.indexOf(ID);

            //if its in the array remove it
            if(index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        calculatePercentages: function() {
            data.allItems.exp.forEach(function (cur) {
                cur.calcPercentage(data.totals.inc);
            })
        },

        getPercentages: function() {
            var allPercentages = data.allItems.exp.map(function(cur) {
                return cur.getPercentage()
            })
            return allPercentages;
        },

        calculateBudget: function() {
            //sum all income and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            //calculate budget income - expenses
            data.budget = data.totals.inc - data.totals.exp;
            //calculate percentage of income already spent
            if(data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        }
    };
})();

//UI Controller
var UIController = (function() {
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        addButton: '.add__btn',
        incomeList: '.income__list',
        expenseList: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expsenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        itemPercentageLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    var formatNumber = function(num, type) {
        var numSplit, int, dec, type;
        num = Math.abs(num);
        num = num.toFixed(2);
        numSplit = num.split('.');
        int = numSplit[0];
        if(int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }
        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };

    var nodeListForEach = function(list, callback) {
        for(var i=0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },
        getDomStrings: function() {
            return DOMstrings;
        },

        addListItem: function(obj, type) {
            var html, newHtml, element;
            //create hmtl string with placeholder text
            if(type === 'inc') {
                element = DOMstrings.incomeList;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            } else if (type === 'exp' ) {
                element = DOMstrings.expenseList;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }            
            //replace the placeholder text with actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            //insert the html into the dom
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem: function(elementId) {
            var elem = document.getElementById(elementId);
            elem.parentNode.removeChild(elem);
        },

        clearFields: function() {
            var fields, fieldsArr; 
            fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);
            
            fieldsArr = Array.prototype.slice.call(fields);
            
            fieldsArr.forEach(function(current, index, array) {
                current.value = '';
            });
            fieldsArr[0].focus();
        },

        displayBudget: function(obj) {
            var type;

            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expsenseLabel).textContent = formatNumber(obj.totalExp, 'exp');
            

            if(obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---'
            }
        },

        displayPercentages: function(percentages) {
            var fields = document.querySelectorAll(DOMstrings.itemPercentageLabel);

            nodeListForEach(fields, function(curr, index){
                if(percentages[index] > 0) {
                    curr.textContent = percentages[index] + '%';
                } else {
                    curr.textContent = '---';
                }
            });
        },

        displayMonth: function() {
            var now, year, month, months
            now = new Date();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },

        changedType: function() {
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue
            );
            nodeListForEach(fields, function(cur) {
                cur.classList.toggle('red-focus');
            });
            document.querySelector(DOMstrings.addButton).classList.toggle('red');
        }
    };
})();

//Global App Controller
var controller = (function(budgetCtrl, UICtrl) {
    var setupEventListeners = function() {
        var Dom = UICtrl.getDomStrings();
    
        document.querySelector(Dom.addButton).addEventListener('click', ctrlAddItem)

        document.addEventListener('keypress', function(event) {
            if(event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });
        document.querySelector(Dom.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(Dom.inputType).addEventListener('change', UICtrl.changedType)
    };

    var updateBudget = function() {
        //Calculate the budget
        budgetCtrl.calculateBudget();
        //Return new budget
        var budget = budgetCtrl.getBudget();
        //Display budget on the UI
        UICtrl.displayBudget(budget);
    };

    var updatePercentages = function() {
        //calculate percentages
        budgetCtrl.calculatePercentages();
        //read percentages from the budget controller
        var allPerc = budgetCtrl.getPercentages();
        //update UI with new percentages
        UICtrl.displayPercentages(allPerc);
    }

    var ctrlAddItem = function() {
        var input, newItem;
        //get input data
        input = UICtrl.getInput();
        //validate inputs for no entries
        if(input.description !== '' && !isNaN(input.value) && input.value > 0) {
            //add item to budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value)
            //add the new item to user interface
            UICtrl.addListItem(newItem, input.type)
            //clear the input fields
            UICtrl.clearFields();
            //caluclate and update budget
            updateBudget();
            //Calulate and update percentages
            updatePercentages();
        }
    }

    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            //Delete item from data structure
            budgetCtrl.deleteItem(type, ID);
            //Delete item from the UI
            UICtrl.deleteListItem(itemID);
            //Update and show the budget
            updateBudget();
        }
    }

    return {
        init: function() {
            console.log('app started')
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
            UICtrl.displayMonth();
        }
    }


})(budgetController, UIController);

controller.init();