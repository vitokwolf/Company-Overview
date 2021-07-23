-- add data to tables and render
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
    ("Accounting Manager", 85000, 3),
    ("Accountant", 70000, 3),
    ("Legal Team Lead", 80000, 4),
    ("Lawyer", 90000, 4);

SELECT * FROM roles;

INSERT INTO
    managers (first_name, last_name, department_id)
VALUES
    ("John", "Doe", 1),
    ("Sarah", "Larsen", 2),
    ("Nancy", "Gomez", 3),
    ("Mike", "Joe", 4);


SELECT
    *
FROM
    managers;


INSERT INTO
    employees (first_name, last_name, role_id, manager_id)
VALUES
    ("John", "Doe", 1, Null),
    ("Sarah", "Larsen", 3, Null),
    ("Nancy", "Gomez", 5, Null),
    ("Mike", "Joe", 7, Null),
    ("Rob", "Bert", 2, 1),
    ("Jane", "Doe", 4, 2),
    ("Brian", "Matt", 6, 3),
    ("Mary", "Jane", 8, 4);

SELECT * FROM employees;