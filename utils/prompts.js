const { table } = require('console');
const inquirer = require('inquirer');
const db = require('../db/connection');
const employeeOptions = require('./employeeOptions');
const deptOptions = require('./departmentsOtions');
const roleOptions = require('./rolesOptions');

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

module.exports = init;