const { table } = require('console');
const inquirer = require('inquirer');
const db = require('../db/connection');
const init = require('./prompts');

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

module.exports = deptOptions;