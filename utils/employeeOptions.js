const { table } = require('console');
const inquirer = require('inquirer');
const db = require('../db/connection');
const init = require('./prompts');


// =================================Employees Options============================================================
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
//                             ==== Employee View Filter ====
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
            employeeFilter()
        }
    )
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
//                           ================================

//add an employee to the database
function addEmployee() {
    // get managers to populate the prompt
    const sqlMgr = `SELECT * FROM managers;`;
    let mgrArr = [];
    db.query(sqlMgr, (err, res) => {
        if (err) throw err;
        res.forEach((manager) => mgrArr.push(`${manager.first_name} ${manager.last_name}`));
    });
    // get roles to populate the prompt
    const sqlRole = `SELECT * FROM roles;`;
    let rolesArr = [];
    db.query(sqlRole, (err, res) => {
        if (err) throw err;
        res.forEach((role) => rolesArr.push(`${role.title}`));
    });
    // prompts array
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
            type: 'list',
            message: 'What is the employee role?',
            name: 'role',
            choices: rolesArr
        }
    ];
    inquirer
        .prompt(employeeQ)
        .then(answer => {
            let roleId;
            let mgrId;
            // compare answer with db role titles
            db.query(sqlRole, (err, res) => {
                if (err) throw err;
                // Loops through roles to find matching id
                res.forEach((role) => {
                    if (answer.role === role.title) {
                        roleId = role.id;
                    }
                });
                // compare answer with db manager name
                db.query(sqlMgr, (err, resMgr) => {
                    if (err) throw err;
                    return inquirer
                        .prompt([
                            {
                                type: 'list',
                                message: 'Who is the Manager?',
                                name: 'manager',
                                choices: mgrArr
                            }
                        ])
                        .then(result => {
                            // Gets the first and last name from the manager response to use to find the id
                            let firstName = result.manager.split(' ')[0];
                            let lastName = result.manager.split(' ').pop();
                            // Loops through managers to find matching id
                            resMgr.forEach((manager) => {
                                if ((firstName === manager.first_name) && (lastName === manager.last_name)) {
                                    mgrId = manager.id;
                                }
                            });
                            const sql = `INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES (?,?,?,?);`;
                            const params = [answer.first_name, answer.last_name, roleId, mgrId];
                            db.query(sql, params,
                                (err, res) => {
                                    if (err) throw err;
                                    console.log('last querry', typeof roleId);
                                    console.log(typeof mgrId);
                                    console.log(`
                                    Employee has been added!
                                    `);
                                    console.table(res);
                                    employeeOptions()
                                })
                        })
                })
            });
        })
};

//update role of an employee
function updateRole() {
    // get employees to populate the prompt
    const sqlEmpl = `SELECT * FROM employees`;
    let empArr = [];
    db.query(sqlEmpl, (err, res) => {
        if (err) throw err;
        res.forEach((employee) => empArr.push(`${employee.first_name} ${employee.last_name}`));
    });
    // get managers to populate the prompt
    const sqlMgr = `SELECT * FROM managers;`;
    let mgrArr = [];
    db.query(sqlMgr, (err, res) => {
        if (err) throw err;
        res.forEach((manager) => mgrArr.push(`${manager.first_name} ${manager.last_name}`));
    });
    // get roles to populate the prompt
    const sqlRole = `SELECT * FROM roles;`;
    let rolesArr = [];
    db.query(sqlRole, (err, res) => {
        if (err) throw err;
        res.forEach((role) => rolesArr.push(`${role.title}`));
    });
    inquirer
        .prompt([
            {
                type: 'list',
                name: 'employee',
                message: 'Which Employee you want to update the info?',
                choices: empArr

            }
        ])
        .then(choice => {
            let empId;
            // Gets the first and last name from the manager response to use to find the id
            let employeeFirstName = choice.employee.split(' ')[0];
            let employeeLastName = choice.employee.split(' ').pop();
            db.query(sqlEmpl, (err, res) => {
                if (err) throw err;
                // Loops through managers to find matching id
                res.forEach((employee) => {
                    if ((employeeFirstName === employee.first_name) && (employeeLastName === employee.last_name)) {
                        empId = employee.id;
                    }
                });
                return inquirer
                    .prompt([
                        {
                            type: 'list',
                            message: 'What is the Employee New Role?',
                            name: 'role',
                            choices: rolesArr
                        }
                    ])
                    .then(roleChoice => {
                        let roleId;
                        let mgrId;
                        // compare answer with db role titles
                        db.query(sqlRole, (err, res) => {
                            if (err) throw err;
                            // Loops through roles to find matching id
                            res.forEach((role) => {
                                if (roleChoice.role === role.title) {
                                    roleId = role.id;
                                }
                            });
                            // compare answer with db manager name
                            db.query(sqlMgr, (err, resMgr) => {
                                if (err) throw err;
                                return inquirer
                                    .prompt([
                                        {
                                            type: 'list',
                                            message: 'Who is the New Manager?',
                                            name: 'manager',
                                            choices: mgrArr
                                        }
                                    ])
                                    .then(result => {
                                        // Gets the first and last name from the manager response to use to find the id
                                        let firstName = result.manager.split(' ')[0];
                                        let lastName = result.manager.split(' ').pop();
                                        // Loops through managers to find matching id
                                        resMgr.forEach((manager) => {
                                            if ((firstName === manager.first_name) && (lastName === manager.last_name)) {
                                                mgrId = manager.id;
                                            }
                                        });
                                        const sql = `UPDATE employees SET role_id = ?, manager_id = ? WHERE id = ?;`;
                                        const params = [roleId, mgrId, empId];
                                        db.query(sql, params, (err, res) => {
                                            if (err) throw err;
                                            console.log(`
                                            ${res.affectedRows} row updated successfully!`);
                                            employeeOptions()
                                        })
                                    })
                            })
                        })
                    })
            })
        })
};

// delete an employee
function deleteEmployee() {
    // get employees to populate the prompt
    const sqlEmpl = `SELECT * FROM employees`;
    let empArr = [];
    db.query(sqlEmpl, (err, res) => {
        if (err) throw err;
        res.forEach((employee) => empArr.push(`${employee.first_name} ${employee.last_name}`));
    });
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

module.exports = employeeOptions;