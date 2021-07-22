const { table } = require("console");
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
                    addEmployee();
                    break;

                case "Add departments":
                    addDept();
                    break;

                case "Add roles":
                    addRoles();
                    break;

                case "Update an employee role":
                    updateRole();
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
function addEmployee() {
    const employeeQ = [
        {
            type: "input",
            message: "What is the first name of the employee?",
            name: "first_name"
        },
        {
            type: "input",
            message: "What is the last name of the employee?",
            name: "last_name"
        },
        {
            type: "input",
            message: "What is the employee's role ID?(Numeric Value)",
            name: "role_id",
            validate: input => {
                const pass = input.match(
                    /^[1-9]\d*$/
                );
                if (pass) {
                    return true;
                }
                return "Please enter a positive number greater than zero."
            }
        },
        {
            type: "input",
            message: "What is the manager id of the new employee?(Numeric Value)",
            name: "manager_id",
            validate: input => {
                const pass = input.match(
                    /^[1-9]\d*$/
                );
                if (pass) {
                    return true;
                }
                return "Please enter a positive number greater than zero."
            }
        }
    ];
    inquirer
        .prompt(employeeQ)
        .then(answer => {
            db.query(
                "INSERT INTO employees SET ?",
                {
                    first_name: answer.first_name,
                    last_name: answer.last_name,
                    role_id: answer.role_id,
                    manager_id: answer.manager_id
                },
                (err, res) => {
                    if (err) throw err;
                    console.log('Employee has been added!');
                    console.table(answer);
                    init()
                }
            )
        })
};

//add a department to database
function addDept() {
    inquirer
        .prompt({
            type: "input",
            message: "What is the name of the new department?",
            name: "title"
        })
        .then(answer => {
            db.query("INSERT INTO departments SET ?",
                {
                    title: answer.title
                },
                (err, res) => {
                    if (err) throw err;
                    console.log('Department has been added!');
                    console.table(answer);
                    init();
                })
        })
};

//add new role to database 
function addRoles() {
    const roleQ = [
        {
            type: "input",
            message: "What role would you like to add?",
            name: "title"
        },
        {
            type: "input",
            message: "Which department is the role in?",
            name: "id"
        },
        {
            type: "input",
            message: "What is the salary for the new role?",
            name: "salary"
        }
    ];
    inquirer
        .prompt(roleQ)
        .then(answer => {
            db.query(
                "INSERT INTO roles SET ?",
                {
                    title: answer.title,
                    department_id: answer.id,
                    salary: answer.salary
                },
                (err, res) => {
                    if (err) throw err;
                    console.log('New role has been added!');
                    console.table(answer);
                    init()
                }
            )
        })
};

//update roles and assigns an employee to the newly updated role
function updateRole() {
    inquirer
        .prompt([
            {
                type: "input",
                name: "employee_id",
                message: "What is the employee id number that you want to update the role?",
                validate: input => {
                    const pass = input.match(
                        /^[1-9]\d*$/
                    );
                    if (pass) {
                        return true;
                    }
                    return "Please enter a positive number greater than zero."
                }

            },
            {
                type: "input",
                name: "role_id",
                message: "Which role id the employee is beeing assigned to?",
                validate: input => {
                    const pass = input.match(
                        /^[1-9]\d*$/
                    );
                    if (pass) {
                        return true;
                    }
                    return "Please enter a positive number greater than zero."
                }
            }
        ])
        .then(answer => {
            db.query("UPDATE employees SET role_id = ? WHERE id = ?",
                [
                    answer.role_id,
                    answer.employee_id
                ],
                (err, res) => {
                    if (err) throw err
                    console.log(res.affectedRows + " row " + "updated successfully!");
                    init()
                })
        })
};

module.exports = init;