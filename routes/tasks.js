var express = require('express')
var app = express()

app.get('/login', function (req, res, next) {
    res.render('todo/login', {
        title: 'Login',
        email: '',
        password: ''
    })
});

app.post('/userLogin', function (req, res) {
    req.assert('email', 'Email is required').notEmpty()
    req.assert('password', 'passsword is required').notEmpty()

    var errors = req.validationErrors()
    if (!errors) {
        req.getConnection(function (error, conn) {
            var sql = "call sp_userLogin('" + req.body.email + "','" + req.body.password + "')";
            var sql2 = "call sp_getTasks('" + req.body.email + "')";
            conn.query(sql, function (err, rows, fields) {
                if (err) {
                    req.flash('error', err)
                    res.render('todo/login', {
                        title: 'Login',
                        email: '',
                        password: ''
                    })
                } else {
                    if (rows[0][0].isValid == 1) {
                        conn.query(sql2, function (err, rows, fields) {
                            if (err) {
                                req.flash('error', err)
                                res.render('todo/login', {
                                    title: 'Login',
                                    email: '',
                                    password: ''
                                })
                            } else {
                                res.render('todo/userlist', {
                                    title: 'Your Task List',
                                    data: rows[0]
                                })
                            }
                        })
                    }
                    else {
                        req.flash('error', 'Wrong credentials.')
                        res.render('todo/login', {
                            title: 'Login',
                            email: '',
                            password: ''
                        })
                    }
                }
            })
        })
    }
});

app.get('/registration', function (req, res, next) {
    res.render('todo/registration', {
        title: 'Registration',
        name: '',
        email: '',
        password: ''
    })
});

app.post('/userRegistration', function (req, res, next) {
    req.assert('name', 'Name is required').notEmpty()
    req.assert('email', 'Email is required').notEmpty()
    req.assert('password', 'passsword is required').notEmpty()

    var errors = req.validationErrors()

    if (!errors) {
        var user = {
            name: req.sanitize('name').escape().trim(),
            email: req.sanitize('email').escape().trim(),
            password: req.sanitize('password').escape().trim()
        }

        req.getConnection(function (error, conn) {
            var sql = "call sp_insertUsers('" + req.body.name + "','" + req.body.password + "','" + req.body.email + "')";
            conn.query(sql, function (err, result) {
                if (err) {
                    req.flash('error', err)
                    res.render('todo/registration', {
                        title: 'Registeration',
                        name: user.name,
                        email: user.email,
                        password: user.password,
                    })
                } else {
                    req.flash('success', 'User Added successfully, please login.')
                    res.render('todo/registration', {
                        title: 'Registeration',
                        name: '',
                        email: '',
                        password: '',
                    })
                }
            })
        })
    } else {
        var error_msg = ''
        errors.forEach(function (error) {
            error_msg += error.msg + '<br/>'
        })
        req.flash('error', error_msg)

        res.render('todo/registration', {
            title: 'registration',
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
        })
    }
})

app.get('/getAllTasks', function (req, res, next) {
    req.getConnection(function (error, conn) {
        let sql = "call sp_getAlltasks()";
        conn.query(sql, function (err, rows, fields) {
            if (err) {
                req.flash('error', err)
                res.render('todo/list', {
                    title: 'All Tasks List',
                    data: ''
                })
            } else {
                res.render('todo/list', {
                    title: 'All Tasks List',
                    data: rows[0]
                })
            }
        })
    })
})

app.get('/addNewTask', function (req, res, next) {
    res.render('todo/addTask', {
        title: 'Add New Task',
        task_name: '',
        expiry: '',
        completion_status: '',
        created_by: ''
    })
});

app.post('/addNewTask', function (req, res, next) {
    req.assert('task_name', 'Task Name is required').notEmpty()
    req.assert('expiry', 'Expiry date is required').notEmpty()
    req.assert('completion_status', 'status of the Task is required').notEmpty()
    req.assert('created_by', 'creatorName is required').notEmpty()
    var errors = req.validationErrors()

    if (!errors) {
        req.getConnection(function (error, conn) {
            var sql = "call sp_insertTask('" + req.body.task_name + "','" + req.body.expiry + "','" + req.body.completion_status + "','" + req.body.created_by + "')";
            conn.query(sql, function (err, result) {
                if (err) {
                    req.flash('error', err)
                    res.render('todo/addTask', {
                        title: 'Add New Task',
                        task_name: '',
                        expiry: '',
                        completion_status: '',
                        created_by: ''
                    })
                } else {
                    req.flash('success', 'Data added successfully!')
                    var sql2 = "call sp_getAllTasksByName('" + req.body.created_by + "')";
                    conn.query(sql2, function (err, rows, fields) {
                        if (err) {
                            req.flash('error', err)
                            res.render('todo/login', {
                                title: 'Login',
                                email: '',
                                password: ''
                            })
                        } else {
                            res.render('todo/userlist', {
                                title: 'Your Task List',
                                data: rows[0]
                            })
                        }
                    })
                }
            })
        })
    }
    else {
        var error_msg = ''
        errors.forEach(function (error) {
            error_msg += error.msg + '<br>'
        })
        req.flash('error', error_msg)
        res.render('todo/addTask', {
            title: 'Add New Task',
            task_name: '',
            expiry: '',
            completion_status: '',
            created_by: ''
        })
    }
})

app.get('/updateTask/(:id)', function (req, res, next) {
    req.getConnection(function (error, conn) {
        let sql = "call sp_getTasksById('" + req.params.id + "')";;
        conn.query(sql, function (err, rows, fields) {
            if (err) throw err
            if (rows.length <= 0) {
                req.flash('error', 'User not found with id = ' + req.params.id)
            }
            else { 
                res.render('todo/edit', {
                    title: 'Edit Task',
                    id: rows[0][0].id,
                    task_name: rows[0][0].task_name,
                    expiry: rows[0][0].expiry,
                    completion_status: rows[0][0].completion_status
                })
            }
        })
    })
});

app.put('/updateTask/(:id)', function (req, res, next) {
    req.assert('task_name', 'Task Name is required').notEmpty()
    req.assert('expiry', 'Expiry date is required').notEmpty()
    req.assert('completion_status', 'status of the Task is required').notEmpty()

    var errors = req.validationErrors()

    if (!errors) {
        req.getConnection(function (error, conn) {
            var name = '';
            var sql3 = "call sp_getNameById(" + req.params.id + ")"
            conn.query(sql3, function (err, rows, fields) {
                if (err) {
                    name = '';
                } else {
                    name = rows[0][0].name
                }
            });
            let sql = "call sp_updateTask(" + req.params.id + ",'" + req.body.task_name + "','" + req.body.expiry + "','" + req.body.completion_status + "')";
            conn.query(sql, function (err, result) {
                if (err) {
                    req.flash('error', err)
                    res.render('todo/edit', {
                        title: 'Edit Task',
                        id: req.params.id,
                        task_name: req.body.task_name,
                        expiry: req.body.expiry,
                        completion_status: req.body.completion_status
                    })
                } else {
                    req.flash('success', 'Data updated successfully!')
                    var sql2 = "call sp_getAllTasksByName('" + name + "')";
                    console.log(sql2);
                    conn.query(sql2, function (err, rows, fields) {
                        if (err) {
                            req.flash('error', err)
                            res.render('todo/login', {
                                title: 'Login',
                                email: '',
                                password: ''
                            })
                        } else {
                            res.render('todo/userlist', {
                                title: 'Your Task List',
                                data: rows[0]
                            })
                        }
                    })
                }
            })
        })
    }
    else {
        var error_msg = ''
        errors.forEach(function (error) {
            error_msg += error.msg + '<br>'
        })
        req.flash('error', error_msg)
        res.render('todo/edit', {
            title: 'Edit Task',
            id: req.params.id,
            task_name: req.body.task_name,
            expiry: req.body.expiry,
            completion_status: req.body.completion_status
        })
    }
});

app.delete('/deleteTask/(:id)', function (req, res, next) {
    req.getConnection(function (error, conn) {
        var sql = "call sp_deleteTask(" + req.params.id + ")";
        var name = '';
        var sql3 = "call sp_getNameById(" + req.params.id + ")"
        conn.query(sql3, function (err, rows, fields) {
            if (err) {
                name = '';
            } else {
                name = rows[0][0].name
            }
        })
        conn.query(sql, function (err, result) {
            if (err) {
                req.flash('error', err)
            } else {
                req.flash('success', 'task deleted successfully')
                var sql2 = "call sp_getAllTasksByName('" + name + "')";
                conn.query(sql2, function (err, rows, fields) {
                    if (err) {
                        req.flash('error', err)
                        res.render('todo/login', {
                            title: 'Login',
                            email: '',
                            password: ''
                        })
                    } else {
                        res.render('todo/userlist', {
                            title: 'Your Task List',
                            data: rows[0]
                        })
                    }
                })
            }
        })
    })
});

module.exports = app;