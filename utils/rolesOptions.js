const { table } = require('console');
const inquirer = require('inquirer');
const db = require('../db/connection');
const init = require('./prompts');


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
    let roleData = [];
    db.query(sqlRole, (err, res) => {
        if (err) throw err;
        roleData = res;
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
            roleData.forEach(role => {
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

module.exports = roleOptions;