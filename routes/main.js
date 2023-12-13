const multer = require('multer');
const path = require('path');
const session = require('express-session');


const imageFilter = function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('Error: Images Only!');
    }
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage, fileFilter: imageFilter });
let selectedItems = [];


module.exports = function(app, shopData) {

    function requireLogin(req, res, next) {
        if (req.session.userId) {
            next();
        } else {
            res.redirect('/login');
        }
    }
    app.use(session({
        secret: 'your-secret-key',
        resave: false,
        saveUninitialized: true
      }));

    app.get('/', function(req, res) {
        const shopDataWithLoggedIn = { ...shopData, loggedIn: req.session.loggedIn };
    
        res.render('index.ejs', shopDataWithLoggedIn);
    });

    app.get('/about', function(req, res) {
        const shopDataWithLoggedIn = { ...shopData, loggedIn: req.session.loggedIn };
        res.render('about.ejs', shopDataWithLoggedIn);
    });
    app.get('/search', function(req, res) {
        const shopDataWithLoggedIn = { ...shopData, loggedIn: req.session.loggedIn };
        res.render("search.ejs", shopDataWithLoggedIn);
    });
   // app.get('/search-result', function (req, res) {
        //searching in the database
      //  res.send("You searched for: " + req.query.keyword);
  //  });
    app.get('/register', function (req,res) {
        const shopDataWithLoggedIn = { ...shopData, loggedIn: req.session.loggedIn };
        res.render("register.ejs", shopDataWithLoggedIn);                                                                     
    });                                                                                                 
    app.post('/registered', function (req,res) {
        const bcrypt = require('bcrypt');
        const saltRounds = 10;
        const plainPassword = req.body.password;
        let hashPassword;
        bcrypt.hash(plainPassword, saltRounds, function(err, hashedPassword) {
            if (err) {
                res.redirect('./');
            }
            // Store hashed password in your database.
            hashPassword=hashedPassword
            //console.log(hashPassword)
            let sqlquery = "INSERT INTO users (username, first, last, email, hashedPassword) VALUES (?,?,?,?,?)";
            let newrecord = [req.body.username, req.body.first, req.body.last, req.body.email, hashPassword];
            db.query(sqlquery, newrecord, (err, result) => {
                if (err) {
                    return console.error(err.message);
                }
                else
                res.redirect('/login');
                console.log(newrecord)
            });
        })
                                                          
    }); 
    app.get('/list', function(req, res) {
        let sqlquery = "SELECT * FROM items"; 
        db.query(sqlquery, (err, result) => {
            if (err) {
                res.redirect('./');
            }
            let newData = Object.assign({}, shopData, {availableItems:result, selectedItems: selectedItems, loggedIn: req.session.loggedIn});
            console.log(newData)
            console.log("Item Paths:", newData.availableItems.map(item => item.image_path));
            res.render("list.ejs", newData)
        });
    });
    app.get('/login', function (req, res) {
        const shopDataWithLoggedIn = { ...shopData, loggedIn: req.session.loggedIn };
        res.render('login.ejs', shopDataWithLoggedIn);
    });
    app.post('/loggedin', function (req, res) {
        const bcrypt = require('bcrypt');
    
        let username = req.body.username;
        let password = req.body.password;
    
        // Retrieve the hashed password from the database based on the username
        let sqlquery = 'SELECT userId, hashedPassword FROM users WHERE username=?';
        db.query(sqlquery, [username], function (err, rows) {
            if (err) {
                // Log the error details
                console.error('Error retrieving user data:', err);
                res.status(500).send('An error occurred while retrieving the user data.');
            } else if (rows.length === 0) {
                res.status(401).send('No user found with that username.');
            } else {
                const hashedPassword = rows[0].hashedPassword;
    
                // Compare the user's password with the hashed password from the database
                bcrypt.compare(password, hashedPassword, function (err, result) {
                    if (err) {
                        console.error('Error comparing passwords:', err);
                        res.status(500).send('An error occurred while comparing passwords.');
                    } else if (result === true) {
                        // Set the user as logged in
                        req.session.loggedIn = true;
                        req.session.userId = rows[0].userId;
    
                        // Redirect to the basket
                        res.redirect('/basket');
                    } else {
                        res.status(401).send('Incorrect password.');
                    }
                });
            }
        });
    });
    
    
    
    
    
    
/*     app.post('/loggedin', function (req,res) {
        const bcrypt = require('bcrypt');
        
        let sqlquery = 'SELECT hashedPassword FROM users WHERE username=?'
        let username = req.body.username;
        // Compare the password supplied with the password in the database
        bcrypt.compare(req.body.password, sqlquery, function(err, result) {
        if (err) {
            // TODO: Handle error
        }
        else if (result == true) {
            message = 'Hello '+ req.body.first + ' '+ req.body.last +' you are now signed in!';
            res.send(message)
        }
        else {
            message = 'Hello '+ req.body.username +'that was the wrong password';
            res.send(message)
        }
        });
 

                                                                            
    
    });   
*/
    app.get('/listusers', function(req, res) {
        let sqlquery = "SELECT * FROM users"; 
        db.query(sqlquery, (err, result) => {
            if (err) {
                res.redirect('./');
            }
            let newData = { ...shopData, users: result, loggedIn: req.session.loggedIn };
            console.log(newData)
            res.render("listusers.ejs", newData);
        });
    });
    app.get('/additem', requireLogin, function (req, res) {
        const shopDataWithLoggedIn = { ...shopData, loggedIn: req.session.loggedIn };
        res.render('additem.ejs', shopDataWithLoggedIn);
    });                                                      
    app.post('/itemadded', upload.single('image'), function (req, res) {
        const imagePath = req.file ? req.file.path.replace(/\\/g, '/').replace('public/', '') : null;
        const userId = req.session.userId; 
    
        let sqlquery = "INSERT INTO items (name, brand, price, image_path, UserId) VALUES (?,?,?,?,?)";
        let newrecord = [req.body.name, req.body.brand, req.body.price, imagePath, userId];
    
        db.query(sqlquery, newrecord, (err, result) => {
            if (err) {
                return console.error(err.message); 
            }
    
            res.send(`
                <p>Item added to the database:</p>
                <p>Name: ${req.body.name}</p>
                <p>Brand: ${req.body.brand}</p>
                <p>Price: ${req.body.price}</p>
                <p>Image: ${imagePath ? imagePath : 'No image uploaded'}</p>
                <form action="/list" method="get">
                    <button type="submit">Go to List</button>
                </form>
            `);
        });
    });
    app.get('/bargainitems', function(req, res) {
        let sqlquery = "SELECT * FROM items WHERE price<=20"; 
        db.query(sqlquery, (err, result) => {
            if (err) {
                res.redirect('./');
            }
            let newData = { ...shopData, availableItems: result, loggedIn: req.session.loggedIn };
            console.log(newData);
            res.render("bargainitems.ejs", newData);
        });
    });
    
    app.get('/search-result', function (req, res) {
        let sqlquery = `SELECT * FROM items WHERE name LIKE "%${req.query.keyword}%"`;
        db.query(sqlquery, (err, result) => {
            if (err) {
                res.redirect('./');
            }
            let newData = { ...shopData, availableItems: result, loggedIn: req.session.loggedIn };
            console.log(newData);
            res.render("search-result.ejs", newData);
        });
    });
    app.get('/basket', function (req, res) {
        const loggedInUserId = req.session.userId;
    
        if (loggedInUserId) {
            // User is logged in, filter items that belong to the current user
            const userBasketItems = selectedItems.filter(item => item.addedByUserId === loggedInUserId);
    
            res.render('basket.ejs', { userBasketItems, loggedIn: req.session.loggedIn });
        } else {
            // User is not logged in, redirect to login page
            res.redirect('/login');
        }
    });
    app.post('/addToBasket', function (req, res) {
        const itemName = req.body.name;
        const itemBrand = req.body.brand;
        const itemPrice = parseFloat(req.body.price);
        const itemImage = req.body.image;
        const userId = req.session.userId; // User who added the item to the basket
    
        // Add the selected item to the array and associate it with the user ID
        selectedItems.push({ name: itemName, brand: itemBrand, price: itemPrice, image: itemImage, addedByUserId: userId });
    
        // Update the 'addedByUserId' field in the database for the selected item
        const sqlUpdate = 'UPDATE items SET addedByUserId = ? WHERE name = ? AND brand = ? AND price = ?';
        db.query(sqlUpdate, [userId, itemName, itemBrand, itemPrice], function (err, result) {
            if (err) {
                console.error(err.message);
                res.status(500).send('An error occurred while updating the addedByUserId.');
            } else {
                // Redirect back to the item list
                res.redirect('/list');
            }
        });
    });
    app.post('/removeFromBasket', function (req, res) {
        const itemIndex = parseInt(req.body.index);
        
        // Remove the item from the selectedItems array
        selectedItems.splice(itemIndex, 1);
      
        // Redirect back to the basket
        res.redirect('/basket');
    });

    app.post('/makePayment', function (req, res) {
        // Check if the user is logged in
        const loggedInUserId = req.session.userId;
    
        if (loggedInUserId) {

    
            // Remove items from the database for the logged-in user only
            const sqlquery = 'DELETE FROM items WHERE addedByUserId = ?';
            db.query(sqlquery, [loggedInUserId], function (err, result) {
                if (err) {
                    console.error(err.message);
                    res.status(500).send('An error occurred while processing the payment.');
                } else {
                    // Thank the user for the purchase
                    res.send('Thank you for your purchase! <a href="/">Return to the home page</a>');
          
                    selectedItems = [];
                }
            });
        } else {
            // If not logged in, redirect to the login page
            res.redirect('/login');
        }
    });
    app.get('/logout', function (req, res) {
        req.session.destroy(function(err) {
            if (err) {
                console.error('Error logging out:', err);
            }
            // Redirect to the home page after logout
            res.redirect('/');
        });
    });
    
}
