var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "",
  database: "bamazon"
});
// connect to the mysql server and sql database
connection.connect(function(err, results) {
  if (err) throw err;
  showMeTheItems();
});

function showMeTheItems() {
  connection.query("SELECT item_id, product_name, department_name, price FROM products", function(err, res) {
      console.log("-----------------------------------------");
      console.log("-----| Items Available for Purchase |----");
      console.log("-----------------------------------------");

    for (var i = 0; i < res.length; i++) {

      console.log("| " + res[i].item_id + "| " + res[i].product_name + " | " + res[i].department_name + " | $" + res[i].price + " | ");
      console.log("-----------------------------------------");
    }
      console.log("-----------------------------------------");
  });
  buyMeMe();
}

function buyMeMe() {
  // query the database for all items being auctioned
  connection.query("SELECT * FROM products", function(err, results) {
    if (err) throw err;
        inquirer
          .prompt([
              {
                name: "product",
                type: "rawlist",
                choices: function() {
                  var choiceArray = [];
                  for (var i = 0; i < results.length; i++) {
                    choiceArray.push(results[i].product_name);
                  }
                  return choiceArray;
                },
                message: "Select the item you'd like to purchase"
              },
              {
                name: "quantity",
                type: "input",
                message: "Indicate how many of this product you'd like to purchase:"
              }
            ])
    .then(function(answer) {
      var chosenItem;
          for (var i = 0; i < results.length; i++) {
            if (results[i].product_name === answer.product) {
              chosenItem = results[i];
              console.log(chosenItem);
            }
          }
      console.log(answer);

        // determine if we have enough in stock
        if (chosenItem.stock_quantity > parseInt(answer.quantity)) {
              console.log("We have enough in stock for your order!");
              var calCost = chosenItem.price * (parseInt(answer.quantity));
              var newQuantity = chosenItem.stock_quantity - (parseInt(answer.quantity));

// Update the database
              var query = connection.query(
                "UPDATE products SET ? WHERE ?",
                [
                  {
                    stock_quantity: newQuantity
                  },
                  {
                    product_name: chosenItem.product_name
                  }
                ],
                function(err, res) {
                      console.log("Your total cost will be $" + calCost);
                      console.log("We now have " + newQuantity + " of " + chosenItem.product_name + " in stock.");
                      connection.end();

                    }
                  );
            }
        else {
          console.log("Insufficient quantity! Try again");
          showMeTheItems();
        }
      });
  });
}
