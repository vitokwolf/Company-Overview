INSERT INTO
    departments (title)
VALUES
    ("Sales"),
    ("Engineering"),
    ("Finance"),
    ("Legal");

SELECT * FROM departments;

INSERT INTO
    roles (title, salary, department_id)
VALUES
    ("Sales Lead", 60000, 1),
    ("Salesperson", 45000, 1),
    ("Lead Engineer", 80000, 2),
    ("Software Engineer", 70000, 2),
    ("Manager", 85000, 3),
    ("Accountant", 70000, 3),
    ("Legal Team Lead", 80000, 4),
    ("Lawyer", 90000, 4);

SELECT * FROM roles;

INSERT INTO
    employees (first_name, last_name, role_id, manager_id)
VALUES
    ("John", "Doe", 1, Null),
    ("Sarah", "Larsen", 2, 5),
    ("Nancy", "Gomez", 3, 5),
    ("Mike", "Joe", 4, 1),
    ("Rob", "Bert", 5, Null),
    ("Jane", "Doe", 6, 1),
    ("Brian", "Matt", 7, 1),
    ("Mary", "Jane", 8, 1);

SELECT * FROM employees;

SELECT
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
    LEFT JOIN employees AS managers ON employees.manager_id = managers.id;