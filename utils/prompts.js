const inquirer = require("inquirer");
const db = require('../db/connection');

// starter function
function init() {
    inquirer
        .prompt({
            name: "action",
            type: "list",
            message: "What would you like to do?",
            choices: [
                "View all employees",
                "View all departments",
                "View all roles",
                "Add employee",
                "Add departments",
                "Add roles",
                "Update an employee role",
                "Done"
            ]
        })
        .then(answer => {
            switch (answer.action) {
                case "View all employees":
                    // employeeSearch();
                    break;

                case "View all departments":
                    // deptSearch();
                    break;

                case "View all roles":
                    // roleSearch();
                    break;

                case "Add employee":
                    // addEmployee();
                    break;

                case "Add departments":
                    // addDept();
                    break;

                case "Add roles":
                    // addRoles();
                    break;

                case "Update an employee role":
                    // updateRole();
                    break;

                case "Done":
                    db.end();
                    break;
            }
        })
};

//render all employees data in combination with the Dept, role, and also provides the manager data


//render all the depts


//render all the roles


//add an employee to the database


//add a department to database


//add new role to database 


//update roles and assigns an employee to the newly updated role
