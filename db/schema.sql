USE company_db;
-- delete tables if exist
DROP TABLE IF EXISTS departments;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS employees;
-- create tables and show them
CREATE TABLE departments (
    id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    title VARCHAR(30) NOT NULL
);

DESCRIBE departments;

CREATE TABLE roles (
    id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    title VARCHAR(30) NOT NULL,
    salary DECIMAL(10, 2) NOT NULL,
    department_id INT,
    CONSTRAINT fk_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE
    SET
        NULL
);

DESCRIBE roles;

CREATE TABLE employees (
    id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30) NOT NULL,
    role_id INT,
    manager_id INT NULL,
    CONSTRAINT fk_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE
    SET
        NULL
);

DESCRIBE employees;