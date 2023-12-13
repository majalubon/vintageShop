# Make sure the database is created before you run this script
CREATE DATABASE myvintageshop;

# Select the database
USE myvintageshop;

# Create the user which the web app will use to access the database
DROP USER IF EXISTS 'appuser'@'localhost';
CREATE USER 'appuser'@'localhost' IDENTIFIED WITH mysql_native_password BY 'qwerty';
GRANT ALL PRIVILEGES ON myvintageshop.* TO 'appuser'@'localhost';      

# Remove the tables if they already exist
DROP TABLE IF EXISTS items;
DROP TABLE IF EXISTS users;


CREATE TABLE users (
  userID AUTO_INCREMENT PRIMARY KEY;
  username VARCHAR(20) NOT NULL,
  first VARCHAR(20) NOT NULL,
  last VARCHAR(15) NOT NULL UNIQUE,
  email VARCHAR(100),
  password VARCHAR(100),
  PRIMARY KEY(username)
);


# Create the items table to store the list of available items
CREATE TABLE items (
   name VARCHAR(255),
   brand VARCHAR(255),
   price VARCHAR(255),
   description TEXT,
   imagePath VARCHAR(255)
   PRIMARY KEY(name)
);




