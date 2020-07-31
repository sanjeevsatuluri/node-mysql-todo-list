DROP DATABASE IF EXISTS node_todo;

CREATE DATABASE IF NOT EXISTS node_todo;

USE node_todo;


/*===========================================================================================
                           USER LOGIN & REGISTRATION CONFIGURATION
=============================================================================================*/

CREATE TABLE IF NOT EXISTS USERS(
id BIGINT(20) AUTO_INCREMENT NOT NULL,
user_name VARCHAR(100) UNIQUE NOT NULL,
password VARCHAR(100) NOT NULL,
email VARCHAR(100) UNIQUE NOT NULL,
PRIMARY KEY (id)
);

DROP PROCEDURE IF EXISTS sp_insertUsers;
DELIMITER //
CREATE PROCEDURE sp_insertUsers
(
IN puser_name VARCHAR(100),
IN ppassword VARCHAR(100),
IN pemail VARCHAR(100)
)
BEGIN
INSERT INTO users
(
user_name,
password,
email
) 
VALUES 
(
puser_name,
ppassword,
pemail
);
END //
DELIMITER ;

call sp_insertUsers("xyz","xyz","xyz@email.com");

DROP PROCEDURE IF EXISTS sp_userLogin;
DELIMITER //
CREATE PROCEDURE sp_userLogin
(
IN pemail VARCHAR(100),
IN ppassword VARCHAR(100)
)
BEGIN
SELECT count(*) AS isValid
FROM 
users u
WHERE u.email = pemail && u.password = ppassword;         
END //
DELIMITER ;



/*===========================================================================================
                           TASKS LIST & ITS OPERATIONS
=============================================================================================*/

CREATE TABLE IF NOT EXISTS tasks(
id BIGINT(20) AUTO_INCREMENT NOT NULL,
task_name VARCHAR(100) NOT NULL,
creation_time DATETIME default now(),
edit_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
expiry DATE NOT NULL,
completion_status VARCHAR(100),
created_by VARCHAR(100) NOT NULL,
PRIMARY KEY (id),
FOREIGN KEY fk_author(created_by) REFERENCES users(user_name)
);


DROP PROCEDURE IF EXISTS sp_insertTask;
DELIMITER //
CREATE PROCEDURE sp_insertTask
(
IN ptask_name VARCHAR(100),
IN pexpiry DATE,
IN pcompletion_status VARCHAR(100),
IN pcreated_by VARCHAR(100)
)
BEGIN
INSERT INTO tasks
(
task_name,
expiry,
completion_status,
created_by
) 
VALUES 
(
ptask_name,
pexpiry,
pcompletion_status,
pcreated_by
);
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_updateTask;

DELIMITER //
CREATE PROCEDURE sp_updateTask
(
IN pid BIGINT(20),
IN ptask_name VARCHAR(100),
IN pexpiry DATE,
IN pcompletion_status VARCHAR(100)
)
BEGIN
UPDATE tasks SET
task_name = ptask_name,
expiry = pexpiry,
edit_time = now(),
completion_status = pcompletion_status
WHERE id = pid;
END //
DELIMITER ;
select * from tasks;
DROP PROCEDURE IF EXISTS sp_getAllTasks;

DELIMITER //
CREATE PROCEDURE sp_getAllTasks()
BEGIN
SELECT * FROM tasks;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_getTasks;

DELIMITER //
CREATE PROCEDURE sp_getTasks
(
IN pemail VARCHAR(100)
)
BEGIN
DECLARE u_name VARCHAR(100);
SET u_name = (SELECT user_name FROM users WHERE email = pemail);
SELECT * FROM tasks WHERE created_by = u_name;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_getAllTasksbyId;

DELIMITER //
CREATE PROCEDURE sp_getAllTasksbyId
(
IN pid BIGINT(20)
)
BEGIN
DECLARE u_name VARCHAR(100);
SET u_name = (SELECT created_by FROM tasks WHERE id = pid);
SELECT * FROM tasks WHERE created_by = u_name order by id;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_getTasksById;

DELIMITER //
CREATE PROCEDURE sp_getTasksById
(
IN pid BIGINT(20)
)
BEGIN
SELECT * FROM tasks WHERE id = pid;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_getNameById;

DELIMITER //
CREATE PROCEDURE sp_getNameById
(
IN pid BIGINT(20)
)
BEGIN
SELECT created_by as name FROM tasks WHERE id = pid;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_getAllTasksByName;
DELIMITER //
CREATE PROCEDURE sp_getAllTasksByName
(
IN pname VARCHAR(100)
)
BEGIN
SELECT * FROM tasks WHERE created_by = pname;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_deleteTask;

DELIMITER //
CREATE PROCEDURE sp_deleteTask
(
IN pid BIGINT(20)
)
BEGIN
DELETE FROM tasks WHERE id = pid; 
END //
DELIMITER ;