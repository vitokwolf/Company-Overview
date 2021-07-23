const { table } = require('console');
const inquirer = require('inquirer');
const db = require('../db/connection');

// starter function
function init() {
    inquirer
        .prompt(
            {
                name: 'action',
                type: 'list',
                message: 'What would you like to do?',
                choices: [
                    'Explore Employees Options',
                    'Explore Departments Options',
                    'Explore Roles Options',
                    'EXIT'
                ]
            }
        ).then(answer => {
            switch (answer.action) {
                case 'Explore Employees Options':
                    employeeOptions();
                    break;

                case 'Explore Departments Options':
                    deptOptions();
                    break;

                case 'Explore Roles Options':
                    roleOptions();
                    break;

                case 'EXIT':
                    db.end();
                    break;
            }
        })
};

// employees options
function employeeOptions() {
    inquirer
        .prompt(
            {
                name: 'action',
                type: 'list',
                message: 'What would you like to do?',
                choices: [
                    'View Employees Filters',
                    'Add Employee',
                    'Update an Employee Role',
                    'Remove an Employee',
                    'Go Back'
                ]
            }
        ).then(answer => {
            switch (answer.action) {
                case 'View Employees Filters':
                    employeeFilter();
                    break;

                case 'Add Employee':
                    addEmployee();
                    break;

                case 'Update an Employee Role':
                    updateRole();
                    break;

                case 'Remove an Employee':
                    deleteEmployee();
                    break;

                case 'Go Back':
                    init();
                    break;
            }
        })
};

// employee view filter
function employeeFilter() {
    inquirer
        .prompt(
            {
                name: 'action',
                type: 'list',
                message: 'What would you like to do?',
                choices: [
                    'View all Employees',
                    'View Employees by Manager',
                    'View Employee by Department',
                    'Go Back'
                ]
            }
        ).then(answer => {
            switch (answer.action) {
                case 'View all Employees':
                    employeeSearch();
                    break;

                case 'View Employees by Manager':
                    filterByManager();
                    break;

                case 'View Employee by Department':
                    filterByDept();
                    break;

                case 'Go Back':
                    employeeOptions();
                    break;
            }
        })
};

// filter search by manager
function filterByManager() {
    let mgrArr = [];
    db.query(`SELECT * FROM managers;`, (err, res) => {
        if (err) throw err;
        res.forEach((manager) => mgrArr.push(`${manager.first_name} ${manager.last_name}`));
        inquirer
            .prompt([
                {
                    name: 'action',
                    type: 'list',
                    message: 'Select a Manager?',
                    choices: mgrArr
                }
            ]).then(answer => {
                const sql = `SELECT
                    employees.id, 
                    employees.first_name,
                    employees.last_name, 
                    roles.title AS title,
                    departments.title AS department,
                    roles.salary
                FROM 
                    employees 
                LEFT JOIN 
                    roles ON employees.role_id = roles.id
                LEFT JOIN 
                    departments ON departments.id = roles.department_id
                LEFT JOIN 
                    managers ON employees.manager_id = managers.id 
                WHERE CONCAT(managers.first_name, ' ',managers.last_name) = ?;`;
                const manager = answer.action;
                db.query(sql, manager, (err, res) => {
                    if (err) throw err;
                    console.log(`
                    Here are the employees managed by ${manager}
                    `);
                    console.table(res);
                    employeeFilter();
                })
            })
    })
};

// filter view by department
function filterByDept() {
    let deptArr = [];
    db.query(`SELECT * FROM departments;`, (err, res) => {
        console.log(res);
        if (err) throw err;
        res.forEach((department) => deptArr.push(`${department.title}`));
        inquirer
            .prompt([
                {
                    name: 'action',
                    type: 'list',
                    message: 'Select a Manager?',
                    choices: deptArr
                }
            ]).then(answer => {
                const sql = `SELECT
                    employees.id, 
                    employees.first_name,
                    employees.last_name, 
                    roles.title AS title,
                    roles.salary
                FROM 
                    employees 
                LEFT JOIN 
                    roles ON employees.role_id = roles.id
                LEFT JOIN 
                    departments ON departments.id = roles.department_id
                WHERE departments.title = ?;`                ;
                const dept = answer.action;
                db.query(sql, dept, (err, res) => {
                    if (err) throw err;
                    console.log(`
                    Here are the Employees that are in ${dept} Department
                    `);
                    console.table(res);
                    employeeFilter();
                })
            })
    })
};

// departments options
function deptOptions() {
    inquirer
        .prompt(
            {
                name: 'action',
                type: 'list',
                message: 'What would you like to do?',
                choices: [
                    'View all Departments',
                    'Add a Department',
                    'Remove a Department',
                    'Go Back'
                ]
            }
        ).then(answer => {
            switch (answer.action) {
                case 'View all Departments':
                    deptSearch();
                    break;

                case 'Add a Departments':
                    addDept();
                    break;

                case 'Remove a Department':
                    deleteDept();
                    break;

                case 'Go Back':
                    init();
                    break;
            }
        })
};

// roles options
function roleOptions() {
    inquirer
        .prompt(
            {
                name: 'action',
                type: 'list',
                message: 'What would you like to do?',
                choices: [
                    'View all Roles',
                    'Add a Role',
                    'Remove a Role',
                    'Go Back'
                ]
            }
        ).then(answer => {
            switch (answer.action) {
                case 'View all Roles':
                    roleSearch();
                    break;

                case 'Add a Role':
                    addRoles();
                    break;

                case 'Remove a Role':
                    deleteRole();
                    break;

                case 'Go Back':
                    init();
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
    CONCAT(managers.first_name, ' ', managers.last_name) AS manager
FROM
    employees
    LEFT JOIN roles ON role_id = roles.id
    LEFT JOIN departments ON department_id = departments.id
    LEFT JOIN managers ON manager_id = managers.id;`,
        (err, res) => {
            if (err) throw err
            console.table(res)
            employeeOptions()
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
            deptOptions()
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
            roleOptions()
        }
    )
};

//add an employee to the database
function addEmployee() {
    const employeeQ = [
        {
            type: 'input',
            message: 'What is the first name of the employee?',
            name: 'first_name'
        },
        {
            type: 'input',
            message: 'What is the last name of the employee?',
            name: 'last_name'
        },
        {
            type: 'input',
            message: 'What is the employee role ID?(Numeric Value)',
            name: 'role_id',
            validate: input => {
                const pass = input.match(
                    /^[1-9]\d*$/
                );
                if (pass) {
                    return true;
                }
                return 'Please enter a positive number greater than zero.'
            }
        },
        {
            type: 'input',
            message: 'What is the manager id of the new employee?(Numeric Value)',
            name: 'manager_id',
            validate: input => {
                const pass = input.match(
                    /^[1-9]\d*$/
                );
                if (pass) {
                    return true;
                }
                return 'Please enter a positive number greater than zero.'
            }
        }
    ];
    inquirer
        .prompt(employeeQ)
        .then(answer => {
            db.query(
                `INSERT INTO employees SET ?`,
                {
                    first_name: answer.first_name,
                    last_name: answer.last_name,
                    role_id: answer.role_id,
                    manager_id: answer.manager_id
                },
                (err, res) => {
                    if (err) throw err;
                    console.log(`
                    Employee has been added!
                    `);
                    console.table(answer);
                    employeeOptions()
                }
            )
        })
};

//add a department to database
function addDept() {
    inquirer
        .prompt({
            type: 'input',
            message: 'What is the name of the new department?',
            name: 'title'
        })
        .then(answer => {
            db.query(`INSERT INTO departments SET ?`,
                {
                    title: answer.title
                },
                (err, res) => {
                    if (err) throw err;
                    console.log(`
                    Department has been added!
                    `);
                    console.table(answer);
                    deptOptions()
                })
        })
};

//add new role to database 
function addRoles() {
    const roleQ = [
        {
            type: 'input',
            message: 'What role would you like to add?',
            name: 'title'
        },
        {
            type: 'input',
            message: 'Which department is the role in?',
            name: 'id'
        },
        {
            type: 'input',
            message: 'What is the salary for the new role?',
            name: 'salary'
        }
    ];
    inquirer
        .prompt(roleQ)
        .then(answer => {
            db.query(
                `INSERT INTO roles SET ?`,
                {
                    title: answer.title,
                    department_id: answer.id,
                    salary: answer.salary
                },
                (err, res) => {
                    if (err) throw err;
                    console.log(`
                    New role has been added!
                    `);
                    console.table(answer);
                    roleOptions()
                }
            )
        })
};

//update role of an employee
function updateRole() {
    inquirer
        .prompt([
            {
                type: 'input',
                name: 'employee_id',
                message: 'What is the employee id number that you want to update the role?',
                validate: input => {
                    const pass = input.match(
                        /^[1-9]\d*$/
                    );
                    if (pass) {
                        return true;
                    }
                    return 'Please enter a positive number greater than zero.'
                }

            },
            {
                type: 'input',
                name: 'role_id',
                message: 'Which role id the employee is beeing assigned to?',
                validate: input => {
                    const pass = input.match(
                        /^[1-9]\d*$/
                    );
                    if (pass) {
                        return true;
                    }
                    return 'Please enter a positive number greater than zero.'
                }
            },
            {
                type: 'input',
                name: 'manager_id',
                message: 'What is the manager id the employee is beeing assigned to?',
                validate: input => {
                    const pass = input.match(
                        /^[1-9]\d*$/
                    );
                    if (pass) {
                        return true;
                    }
                    return 'Please enter a positive number greater than zero.'
                }
            }
        ])
        .then(answer => {
            db.query(`UPDATE employees SET role_id = ?, manager_id = ? WHERE id = ?`,
                [
                    answer.role_id,
                    answer.manager_id,
                    answer.employee_id
                ],
                (err, res) => {
                    if (err) throw err;
                    console.log(`
                    ${res.affectedRows} row updated successfully!`);
                    employeeOptions()
                })
        })
};

// delete an employee
function deleteEmployee() {
    inquirer
        .prompt([
            {
                type: 'confirm',
                name: 'confirmId',
                message: 'Are you sure? This action is ireversible.',
                default: false
            },
            {
                type: 'input',
                message: 'What is the id of the Employee?',
                name: 'id',
                when: ({ confirmId }) => confirmId,
                validate: input => {
                    const pass = input.match(
                        /^[1-9]\d*$/
                    );
                    if (pass) {
                        return true;
                    }
                    return 'Please enter a positive number greater than zero.'
                }
            }]
        ).then(answer => {
            db.query(`DELETE FROM employees WHERE id = ?`,
                [answer.id],
                (err, res) => {
                    if (err) {
                        throw err;
                    } else if (!res.affectedRows) {
                        console.log(`
                        Employee not found
                        `);
                        return employeeOptions();
                    } else {
                        console.log(`
                        Employee has been removed!
                        `);
                        employeeOptions()
                    }
                })
        })
};

// delete a role
function deleteRole() {
    inquirer
        .prompt([
            {
                type: 'confirm',
                name: 'confirmId',
                message: 'Are you sure? This action is ireversible.',
                default: false
            },
            {
                type: 'input',
                message: 'What is the id of the role?',
                name: 'id',
                when: ({ confirmId }) => confirmId,
                validate: input => {
                    const pass = input.match(
                        /^[1-9]\d*$/
                    );
                    if (pass) {
                        return true;
                    }
                    return 'Please enter a positive number greater than zero.'
                }
            }]
        ).then(answer => {
            db.query(`DELETE FROM roles WHERE id = ?`,
                [answer.id],
                (err, res) => {
                    if (err) {
                        throw err;
                    } else if (!res.affectedRows) {
                        console.log(`
                        Role not found
                        `);
                        return roleOptions();
                    } else {
                        console.log(`
                        Role has been removed!
                        `);
                        roleOptions();
                    }
                })
        })
};

// delete a department
function deleteDept() {
    inquirer
        .prompt([
            {
                type: 'confirm',
                name: 'confirmId',
                message: 'Are you sure? This action is ireversible.',
                default: false
            },
            {
                type: 'input',
                message: 'What is the id of the department?',
                name: 'id',
                when: ({ confirmId }) => confirmId,
                validate: input => {
                    const pass = input.match(
                        /^[1-9]\d*$/
                    );
                    if (pass) {
                        return true;
                    }
                    return 'Please enter a positive number greater than zero.'
                }
            }]
        ).then(answer => {
            db.query(`DELETE FROM departments WHERE id = ?`,
                [answer.id],
                (err, res) => {
                    if (err) {
                        throw err;
                    } else if (!res.affectedRows) {
                        console.log(`
                        Department not found
                        `);
                        return deptOptions();
                    } else {
                        console.log(`
                        Department has been removed!
                        `);
                        deptOptions()
                    }
                })
        })
};

module.exports = init;