# Boilerplate for NodeJS Backend using ExpressJS and Prisma ORM
This is a boilerplate code for NodeJS backend. I have used ExpressJS and Prisma as ORM. Main purpose to use prisma is we can change database easily. 99% times we have to change prisma schema only.

If you are looking for Javascript, you can use `main` or `javascript` branch. If you want typescript support go with `typescript` branch.

If you are looking for contribution checkout the TODO list 👇

## TODO
- [ ] API Doc/Swagger
- [ ] Decide Testing Library
- [ ] Add Test
- [ ] Add Merging Rules

## Dependencies
- @prisma/client: Prisma Client Library
- prisma: To generate prisma schema and models
- bcryptjs: Password Hashing
- cookie-parser: To save and Process Cookies
- dotenv: To use environment variable
- jsonwebtoken: JWT tokens
- morgan: For logging
- nodemailer: For email testing
- express
- nodemon
- eslint (and other plugins)
- prettier

## Current Models and Features

1. User
    * User Authnetication
    * User Authorization
    * Create User
    * Read User
    * Update User/Password
    * Forgot Password
    * Delete User
2. Shopping List (One to One with User)
    * Create Shopping List to a User
    * Read Shopping List
    * Update Shopping List
    * Delete Shopping List
3. Items (Many to one with Shopping List)
    * Create Item to a Shopping List
    * Read Items (Route in Shopping List)
    * Update Item
    * Delete Item
4. Expenses (Many to one with Shopping List)
    * Create Expenses to a User List
    * Read Expense(s)
    * Update Expenses
    * Delete Expenses
    * Get Expenses based on Category and/or Date
