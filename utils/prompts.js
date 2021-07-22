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
                    employeeSearch();
                    break;

                case "View all departments":
                    deptSearch();
                    break;

                case "View all roles":
                    roleSearch();
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
function employeeSearch() {
    db.query(`SELECT
    employees.id,
    employees.first_name,
    employees.last_name,
    roles.title AS role,
    roles.salary,
    departments.title AS department,
    CONCAT(managers.first_name, " ", managers.last_name) AS manager
FROM
    employees
    LEFT JOIN roles ON role_id = roles.id
    LEFT JOIN departments ON department_id = departments.id
    LEFT JOIN employees AS managers ON employees.manager_id = managers.id;`,
        (err, res) => {
            if (err) throw err
            console.table(res)
            init()
        }
    )
};

//render all the depts
function deptSearch() {
    db.query(
        `SELECT * FROM  departments`,
        (err, res) => {
            if (err) throw err
            console.table(res)
            init()
        }
    )
};

//render all the roles
function roleSearch() {
    db.query(
        `SELECT * FROM roles`,
        (err, res) => {
            if (err) throw err
            console.table(res)
            init()
        }
    )
};

//add an employee to the database


//add a department to database


//add new role to database 


//update roles and assigns an employee to the newly updated role
