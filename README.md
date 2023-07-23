<h1 align=center>🗓️ Birthday Database</h1>

<p align=center>
The Birthday Database app is a versatile tool that helps users keep track of important birthdays, including those of their loved ones. It features real-time age display in Hijri and Georgian calendars.  
</p>

- [x] Backend API ([Nest.js + PostgreSQL](#📦-api-documentation))
- [x] UI/UX Design ([Figma](#-uiux-design))
- [ ] Frontend Web App

<br>


<div align=center>
       

![Open Source](https://img.shields.io/badge/Open%20Source-%E2%9D%A4-red?style=flat) [![Hits](https://hits.seeyoufarm.com/api/count/incr/badge.svg?url=https%3A%2F%2Fgithub.com%2FAbdelrahmanBayoumi%2Fbirthday-database&count_bg=%2379C83D&title_bg=%23555555&icon=&icon_color=%23E7E7E7&title=Visitors+%5Btoday%2Fall+time%5D&edge_flat=false)](https://hits.seeyoufarm.com) [![license](https://img.shields.io/github/license/AbdelrahmanBayoumi/birthday-database)](https://github.com/AbdelrahmanBayoumi/birthday-database/blob/main/LICENSE)


</div>

<!-- This app consitst of front-end and backend and UI UX Design -->



## 🚀 How to run
1. Clone the repository

    ```bash
    git clone https://github.com/AbdelrahmanBayoumi/birthday-database.git
    ```

2. Install the dependencies
    
    ```bash
    npm install
    ```
3. Create a `.env` file in the root directory like `.env.example` and fill in the required environment variables:
    - `DATABASE_URL`: The connection URL for the PostgreSQL database.
    - `JWT_ACCESS_SECRET`: The secret key used to sign the JWT tokens.
    - `JWT_REFRESH_SECRET`: The secret key used to sign the JWT refresh tokens.
    - `JWT_EMAIL_SECRET`: The secret key used to sign the JWT email verification tokens.
    - `FROM_EMAIL`: The email address of the sender (e.g. `Birthday Database <no-reply@birthday-datbase.com>`).
    - `EMAIL_PASS`: The password of the sender's email address.
    - `HOST_URL`: The URL of the frontend application.
    - `PORT`: The port number for the server.
5. Push the database schema to the database using Prisma CLI
    ```bash
    npx prisma db push
    ```
6. Start the server
    ```bash
    npm run start:dev
    ```




## 👨🏻‍💻 Technologies Used

- **[Nest.js](https://nestjs.com/)**: A progressive Node.js framework for building efficient and scalable server-side applications.
- **[PostgreSQL](https://www.postgresql.org/)** (or choose your preferred database system): A powerful and reliable open-source relational database management system.
- **[Prisma](https://www.prisma.io/)**: A modern database toolkit that provides an ORM, query builder, and migration tool.
- **[Passport.js](http://www.passportjs.org/)**: An authentication middleware for Node.js that supports various authentication strategies.
- **[JWT](https://jwt.io/)**: JSON Web Tokens for secure authentication and authorization.
- **[Jest](https://jestjs.io/)**: A popular JavaScript testing framework for unit testing the backend code.
- **[Pino](https://github.com/pinojs/pino)**: A fast and low-overhead logger for Node.js.
- **[Swagger](https://docs.nestjs.com/openapi/introduction)**: The Swagger UI is an open source project to visually render documentation for 
an API defined with the OpenAPI (Swagger) Specification


---

## 📦 API Documentation

- Refer to the API documentation for detailed information on request/response structures and authentication requirements. ⇒ [Postman](https://documenter.getpostman.com/view/19740088/2s93z5A5NX) or [Swagger](https://birthday-database.azurewebsites.net/api)

The backend API provides the following endpoints:

### General
1. **`GET /api`** - Get the API Swagger documentation.
2. **`GET /health-check`** - Check the health of the API.

### Auth

1. **`POST /auth/signup`**- User signup endpoint.
2. **`POST /auth/login`** - User login endpoint.
3. **`GET /auth/check`** - Check user Token
4. **`POST /auth/logout`** - User logout endpoint.
5. **`POST /auth/refresh`**: Refresh the authentication token.
6. **`GET /auth/verification/{token}`**: Verify the user's email address by confirming the provided verification token.
7. **`POST /auth/resend-verification`**: Resend the verification email to the user's email address.
8. **`POST /auth/forgot-password`**: Initiate the password reset process by sending a reset link to the user's email.

### User

1. **`PATCH /users/:id`** - Update user [ `fullName` or `birthday`]
2. **`PATCH /users/{id}/change-password`** - Change user password
2. **`DELETE /users/:id`** - Delete the authenticated user

### Birthdays

1. **`GET /birthdays`**: Retrieve all birthdays for the authenticated user.
2. **`POST /birthdays`**: Create a new birthday for the authenticated user.
3. **`GET /birthdays/:id`**: Retrieve a specific birthday by ID.
4. **`PATCH /birthdays/:id`**: Update a specific birthday by ID.
5. **`DELETE /birthdays/:id`**: Delete a specific birthday by ID.
6. **`GET /birthday/relationships`**: Retrieve all distinct relationships for the authenticated user.

## 🎨 UI/UX Design


<p align=center>
See <a href="https://www.figma.com/file/fQummxaRmDPtuE8zaglFRW/Age-Tracker-App?type=design&node-id=0%3A1&mode=design&t=iQSoKL7BNwAdGmjn-1">Figma UI Prototype</a><br>
<a href="https://www.figma.com/file/fQummxaRmDPtuE8zaglFRW/Age-Tracker-App?type=design&node-id=0%3A1&mode=design&t=iQSoKL7BNwAdGmjn-1">
<img src="https://github.com/AbdelrahmanBayoumi/birthday-database/assets/48678280/23b329cb-628f-4589-8aa1-0166ee02c308" alt="UI Prototype">
</a>
</p>


## 💡 Contributing 
If you want to contribute to this project and make it better with new ideas, your pull request is very welcomed.
If you find any issue just put it in the repository issue section, thank you.

## 📝 License
This project is licensed under the GPL-3.0 License - see the [LICENSE](LICENSE) file for details.

<div align=center>

<h2>🌟Star this repository🌟</h2>

Please ⭐️ this repo and share it with others
       
       
</div>
<br>

-----------

<h6 align="center">سبحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، أَشْهَدُ أَنْ لا إِلهَ إِلأَ انْتَ أَسْتَغْفِرُكَ وَأَتْوبُ إِلَيْكَ</h6>
