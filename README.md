<h1 align=center>🗓️ Birthday Database</h1>

<p align=center>
The Birthday Database app is a versatile tool that helps users keep track of important birthdays, including those of their loved ones. It features real-time age display in Hijri and Georgian calendars.  
</p>

---


<div align=center>
       

![Open Source](https://img.shields.io/badge/Open%20Source-%E2%9D%A4-red?style=flat) [![Hits](https://hits.seeyoufarm.com/api/count/incr/badge.svg?url=https%3A%2F%2Fgithub.com%2FAbdelrahmanBayoumi%2Fbirthday-database&count_bg=%2379C83D&title_bg=%23555555&icon=&icon_color=%23E7E7E7&title=Visitors+%5Btoday%2Fall+time%5D&edge_flat=false)](https://hits.seeyoufarm.com) [![license](https://img.shields.io/github/license/AbdelrahmanBayoumi/birthday-database)](https://github.com/AbdelrahmanBayoumi/birthday-database/blob/main/LICENSE)


</div>

## 👨🏻‍💻 Technologies Used

- **[Nest.js](https://nestjs.com/)**: A progressive Node.js framework for building efficient and scalable server-side applications.
- **[PostgreSQL](https://www.postgresql.org/)** (or choose your preferred database system): A powerful and reliable open-source relational database management system.
- **[Prisma](https://www.prisma.io/)**: A modern database toolkit that provides an ORM, query builder, and migration tool.
- **[Passport.js](http://www.passportjs.org/)**: An authentication middleware for Node.js that supports various authentication strategies.
- **[JWT](https://jwt.io/)**: JSON Web Tokens for secure authentication and authorization.
- **[Jest](https://jestjs.io/)**: A popular JavaScript testing framework for unit testing the backend code.
- **[Pino](https://github.com/pinojs/pino)**: A fast and low-overhead logger for Node.js.

---

## 📦 API Documentation

The backend API provides the following endpoints:

### Auth

1. **`POST /auth/signup`**- User signup endpoint.
2. **`POST /auth/login`** - User login endpoint.
3. **`GET /auth/check`** - Check user Token
4. **`POST /auth/refresh`**: Refresh the authentication token.
5. **`POST /auth/forgot-password`**: Initiate the password reset process by sending a reset link to the user's email.
6. **`POST /auth/active-email`**: Verify the user's email address by confirming the provided verification token.

### User

1. **`PATCH /users/:id`** - Update user [ `fullName` or `birthday`]
2. **`DELETE /users/:id`** - Delete the authenticated user

### Birthdays

1. **`GET /birthdays`**: Retrieve all birthdays for the authenticated user.
2. **`POST /birthdays`**: Create a new birthday for the authenticated user.
3. **`GET /birthdays/:id`**: Retrieve a specific birthday by ID.
4. **`PUT /birthdays/:id`**: Update a specific birthday by ID.
5. **`DELETE /birthdays/:id`**: Delete a specific birthday by ID.

Refer to the API documentation for detailed information on request/response structures and authentication requirements. ⇒ https://documenter.getpostman.com/view/19740088/2s93z5A5NX


## 💡 Contributing 
If you want to contribute to this project and make it better with new ideas, your pull request is very welcomed.
If you find any issue just put it in the repository issue section, thank you.


<div align=center>

<h2>🌟Star this repository🌟</h2>

Please ⭐️ this repo and share it with others
       
       
</div>
<br>

-----------

<h6 align="center">سبحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، أَشْهَدُ أَنْ لا إِلهَ إِلأَ انْتَ أَسْتَغْفِرُكَ وَأَتْوبُ إِلَيْكَ</h6>
