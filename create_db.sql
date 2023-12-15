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



CREATE TABLE users (username varchar(255),first varchar(255),last varchar(255),email varchar(255),hashedPassword varchar(255),UserId int NOT NULL AUTO_INCREMENT,PRIMARY KEY (UserId));



CREATE TABLE items (id INT PRIMARY KEY AUTO_INCREMENT,name VARCHAR(255) NOT NULL,brand VARCHAR(255) NOT NULL,price INT NOT NULL,image_path VARCHAR(255),UserId INT,addedByUserId INT,FOREIGN KEY (UserId) REFERENCES users(userId),FOREIGN KEY (addedByUserId) REFERENCES users(userId));




