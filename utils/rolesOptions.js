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

module.exports = roleOptions;