const { table } = require('console');
const inquirer = require('inquirer');
const db = require('../db/connection');

// =================================Starter Function=============================================================
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
                    'Update an Employee',
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

                case 'Update an Employee':
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
    let mgrData = [];
    db.query(sqlMgr, (err, res) => {
        if (err) throw err;
        mgrData = res;
        res.forEach((manager) => mgrArr.push(`${manager.first_name} ${manager.last_name}`));
    });
    // get roles to populate the prompt
    const sqlRole = `SELECT * FROM roles;`;
    let rolesArr = [];
    let rolesData = [];
    db.query(sqlRole, (err, res) => {
        if (err) throw err;
        rolesData = res;
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
        },
        {
            type: 'list',
            message: 'Who is the Manager?',
            name: 'manager',
            choices: mgrArr
        }
    ];
    inquirer
        .prompt(employeeQ)
        .then(answer => {
            // get role id
            let roleId;
            rolesData.forEach(role => {
                if (role.title === answer.role) {
                    roleId = role.id;
                }
            });
            // get manager id
            let mgrId;
            // Gets the first and last name from the manager response to use to find the id
            let firstName = answer.manager.split(' ')[0];
            let lastName = answer.manager.split(' ').pop();
            // Loops through managers to find matching id
            mgrData.forEach(manager => {
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
};

//update role of an employee
function updateRole() {
    // get employees to populate the prompt
    const sqlEmpl = `SELECT * FROM employees`;
    let emplArr = [];
    let empData = [];
    db.query(sqlEmpl, (err, res) => {
        if (err) throw err;
        empData = res;
        res.forEach((employee) => emplArr.push(`${employee.first_name} ${employee.last_name}`));
    });
    // get managers to populate the prompt
    const sqlMgr = `SELECT * FROM managers;`;
    let mgrArr = [];
    let mgrData = [];
    db.query(sqlMgr, (err, res) => {
        if (err) throw err;
        mgrData = res;
        res.forEach((manager) => mgrArr.push(`${manager.first_name} ${manager.last_name}`));
    });
    // get roles to populate the prompt
    const sqlRole = `SELECT * FROM roles;`;
    let rolesArr = [];
    let rolesData = [];
    db.query(sqlRole, (err, res) => {
        if (err) throw err;
        rolesData = res;
        res.forEach((role) => rolesArr.push(`${role.title}`));
    });
    const updateQ = [
        {
            type: 'confirm',
            name: 'update',
            message: 'Are you sure?',
            default: true
        },
        {
            type: 'list',
            name: 'employee',
            message: 'Which Employee you want to update the info?',
            choices: emplArr,
            when: ({ update }) => update
        },
        {
            type: 'confirm',
            name: 'confirmNF',
            message: 'Do you need to edit First Name?',
            default: false,
            when: ({ update }) => update
        },
        {
            type: 'input',
            name: 'newFirstName',
            message: 'What is the Employee First Name?',
            when: ({ confirmNF }) => confirmNF,
        },
        {
            type: 'confirm',
            name: 'confirmNL',
            message: 'Do you need to edit Last Name?',
            default: false,
            when: ({ update }) => update
        },
        {
            type: 'input',
            name: 'newLastName',
            message: 'What is the Employee Last Name?',
            when: ({ confirmNL }) => confirmNL,
        },
        {
            type: 'list',
            message: 'What is the Employee New Role?',
            name: 'role',
            choices: rolesArr,
            when: ({ update }) => update
        },
        {
            type: 'list',
            message: 'Who is the New Manager?',
            name: 'manager',
            choices: mgrArr,
            when: ({ update }) => update
        }
    ]
    inquirer
        .prompt(updateQ)
        .then(choice => {
            if (choice.update === false) {
                return employeeOptions()
            };
            // get role id
            let roleId;
            rolesData.forEach(role => {
                if (role.title === choice.role) {
                    roleId = role.id;
                }
            });
            // get employee id
            let empId;
            // Gets the first and last name from the manager response to use to find the id
            let employeeFirstName = choice.employee.split(' ')[0];
            let employeeLastName = choice.employee.split(' ').pop();
            empData.forEach((employee) => {
                if ((employeeFirstName === employee.first_name) && (employeeLastName === employee.last_name)) {
                    empId = employee.id;
                }
            });
            // gets first and last names
            let newFirst;
            if (choice.confirmNF === true) {
                newFirst = choice.newFirstName
            } else {
                newFirst = employeeFirstName
            };
            let newLast;
            if (choice.confirmNL === true) {
                newLast = choice.newLastName
            }
            else {
                newLast = employeeLastName
            };
            // get manager id
            let mgrId
            // Gets the first and last name from the manager response to use to find the id
            let firstName = choice.manager.split(' ')[0];
            let lastName = choice.manager.split(' ').pop();
            // Loops through managers to find matching id
            mgrData.forEach((manager) => {
                if ((firstName === manager.first_name) && (lastName === manager.last_name)) {
                    mgrId = manager.id;
                }
            });
            const sql = `UPDATE employees SET first_name = ?, last_name = ?, role_id = ?, manager_id = ? WHERE id = ?;`;
            const params = [newFirst, newLast, roleId, mgrId, empId];
            db.query(sql, params, (err, res) => {
                if (err) throw err;
                console.log(`
                                            ${res.affectedRows} row updated successfully!`);
                employeeOptions()
            })
        })
};

// delete an employee
function deleteEmployee() {
    // get employees to populate the prompt
    const sqlEmpl = `SELECT * FROM employees`;
    let emplArr = [];
    let empData = [];
    db.query(sqlEmpl, (err, res) => {
        if (err) throw err;
        empData = res;
        res.forEach((employee) => emplArr.push(`${employee.first_name} ${employee.last_name}`));
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
                type: 'list',
                message: 'What Employee is beeing deleted?',
                name: 'employee',
                when: ({ confirmId }) => confirmId,
                choices: emplArr
            }]
        ).then(choice => {
            // get employee id
            let empId;
            // Gets the first and last name from the manager response to use to find the id
            let employeeFirstName = choice.employee.split(' ')[0];
            let employeeLastName = choice.employee.split(' ').pop();
            empData.forEach((employee) => {
                if ((employeeFirstName === employee.first_name) && (employeeLastName === employee.last_name)) {
                    empId = employee.id;
                }
            });
            db.query(`DELETE FROM employees WHERE id = ?;`,
                empId,
                (err, res) => {
                    if (err) throw err;
                    console.log(`
                        Employee has been removed!
                        `);
                    employeeOptions()
                })
        })
};
// ===============================END EMPLOYEES==================================================================

// ==================================Roles Options===============================================================
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
//add new role to database 
function addRoles() {
    // get departments to populate the prompt
    const sqlDept = `SELECT * FROM departments;`;
    let deptArr = [];
    let deptData = [];
    db.query(sqlDept, (err, res) => {
        if (err) throw err;
        deptData = res;
        res.forEach((dept) => deptArr.push(`${dept.title}`));
    });
    const roleQ = [
        {
            type: 'input',
            message: 'What role would you like to add?',
            name: 'title'
        },
        {
            type: 'input',
            message: 'What is the salary for the new role?',
            name: 'salary'
        },
        {
            type: 'list',
            message: 'Which department is the role in?',
            name: 'department',
            choices: deptArr
        }
    ];
    inquirer
        .prompt(roleQ)
        .then(answer => {
            let deptId;
            deptData.forEach(dept => {
                if (dept.title === answer.department) {
                    deptId = dept.id;
                }
            });
            db.query(
                `INSERT INTO roles SET ?`,
                {
                    title: answer.title,
                    department_id: deptId,
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
// delete a role
function deleteRole() {
    // get roles to populate the prompt
    const sqlRole = `SELECT * FROM roles;`;
    let roleArr = [];
    let rolesData = [];
    db.query(sqlRole, (err, res) => {
        if (err) throw err;
        rolesData = res;
        res.forEach((role) => roleArr.push(`${role.title}`));
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
                type: 'list',
                message: 'What Role to delete?',
                name: 'role',
                when: ({ confirmId }) => confirmId,
                choices: roleArr
            }]
        ).then(answer => {
            let roleId;
            rolesData.forEach(role => {
                if (role.title === answer.role) {
                    roleId = role.id;
                }
            });
            db.query(`DELETE FROM roles WHERE id = ?`,
                roleId,
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
// ================================================END ROLES=====================================================


// ==================================Departments Options=========================================================
function deptOptions() {
    inquirer
        .prompt(
            {
                name: 'action',
                type: 'list',
                message: 'What would you like to do?',
                choices: [
                    'View all Departments',
                    'View the Cost by Department',
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

                case 'View the Cost by Department':
                    salaryDept();
                    break;

                case 'Add a Department':
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
// delete a department
function deleteDept() {
    // get departments to populate the prompt
    const sqlDept = `SELECT * FROM departments;`;
    let deptArr = [];
    let deptData = [];
    db.query(sqlDept, (err, res) => {
        if (err) throw err;
        deptData = res;
        res.forEach((dept) => deptArr.push(`${dept.title}`));
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
                type: 'list',
                message: 'What Department to delete?',
                name: 'department',
                when: ({ confirmId }) => confirmId,
                choices: deptArr
            }]
        ).then(answer => {
            let deptId;
            deptData.forEach(dept => {
                if (dept.title === answer.department) {
                    deptId = dept.id;
                }
            });
            db.query(`DELETE FROM departments WHERE id = ?`,
                deptId,
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
// =======================================END DEPARTMENTS========================================================

// View total salary cost of department
function salaryDept() {
    // get departments to populate the prompt
    const sqlDept = `SELECT * FROM departments;`;
    let deptArr = [];
    let deptData = [];
    db.query(sqlDept, (err, res) => {
        if (err) throw err;
        deptData = res;
        res.forEach((dept) => deptArr.push(`${dept.title}`));
        inquirer
            .prompt([
                {
                    type: 'list',
                    name: 'department',
                    message: "Which department would you like to see the total salary cost for?",
                    choices: deptArr
                }
            ])
            .then(answer => {
                // Gets department id
                let deptId;
                deptData.forEach(dept => {
                    if (dept.title === answer.department) {
                        deptId = dept.id;
                    }
                });
                const sqlRole = `SELECT SUM(salary) AS total_salary_cost FROM roles WHERE department_id = ?;`;
                db.query(sqlRole, deptId, (err, res) => {
                    if (err) throw err;
                    console.log(`
                    Total department cost
                    `);
                    console.table(res);
                    deptOptions();
                })
            })
    })
};

module.exports = init;