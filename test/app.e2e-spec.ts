import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';
import { AppModule } from '../src/app.module';
import { EditUserDto } from '../src/user/dto';
import { CreateBirthdayDto } from 'src/birthday/dto';
import { PrismaService } from '../src/prisma/prisma.service';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const userDto = {
    email: `test@example.com`,
    fullName: 'Abdelrahman',
    birthday: '1999-03-11',
    password: 'abc1244',
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
    await app.listen(3334);
    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:3334');
    pactum.request.setDefaultTimeout(10000);
  });

  afterAll(() => {
    app.close();
  });

  describe('Helth Check', () => {
    it('should return status ok', () => {
      return pactum.spec().get('/health-check').expectStatus(200);
    });

    // it('should throw if too many requests', async () => {
    //   for (let i = 1; i <= 9; i++) {
    //     await pactum.spec().get('/health-check').expectStatus(200);
    //   }
    //   return pactum.spec().get('/health-check').expectStatus(429);
    // });
  });

  describe('Auth', () => {
    describe('Signup', () => {
      it('should throw if email empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            password: userDto.password,
            fullName: userDto.fullName,
            birthday: userDto.birthday,
          })
          .expectStatus(400);
      });

      it('should throw if fullName not exist', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            email: userDto.email,
            password: userDto.password,
            birthday: userDto.birthday,
          })
          .expectStatus(400);
      });

      it('should throw if password not exist', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            email: userDto.email,
            fullName: userDto.fullName,
            birthday: userDto.birthday,
          })
          .expectStatus(400);
      });

      it('should throw if birthday not exist', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            email: userDto.email,
            fullName: userDto.fullName,
            password: userDto.password,
          })
          .expectStatus(400);
      });

      it('should throw if no body provided', () => {
        return pactum.spec().post('/auth/signup').expectStatus(400);
      });

      it('should signup', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(userDto)
          .expectStatus(201)
          .withRequestTimeout(5000);
      });

      it('should throw if email is already used', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(userDto)
          .expectStatus(409);
      });
    });

    describe('Verify Email', () => {
      it('should throw if token is invalid', () => {
        return pactum
          .spec()
          .get('/auth/verification/invalid_token')
          .expectStatus(400);
      });

      it('should throw if token is expired', () => {
        const emailToken =
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjk5LCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJpYXQiOjE2MjQ0NjYwNzAsImV4cCI6MTYyNDU1MjA3MH0.4ZrZk3ZvQf0zQgN2Xr3QJ4W1oIY8K6Q5C3zvRq4FQcM';
        return pactum
          .spec()
          .get(`/auth/verification/${emailToken}`)
          .expectStatus(400);
      });

      // it('should verify email', () => {
      //   return pactum
      //     .spec()
      //     .get(`/auth/verification/$S{emailToken}`)
      //     .expectStatus(200);
      // });
    });

    describe('Login', () => {
      it('should throw if email empty', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody({
            password: userDto.password,
          })
          .expectStatus(400);
      });

      it('should throw if password empty', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody({
            email: userDto.email,
          })
          .expectStatus(400);
      });

      it('should throw if no body provided', () => {
        return pactum.spec().post('/auth/login').expectStatus(400);
      });

      it('should throw if password is wrong', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody({
            email: userDto.email,
            password: 'fake_password',
          })
          .expectStatus(401);
      });

      it('should throw if email is wrong', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody({
            email: 'fake_email@example.com',
            password: userDto.password,
          })
          .expectStatus(401);
      });

      it('should login', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody(userDto)
          .expectStatus(200)
          .stores('userAt', 'access_token')
          .stores('userRt', 'refresh_token');
      });
    });

    describe('Check Token', () => {
      it('should get current user if token is valid', () => {
        return pactum
          .spec()
          .get('/auth/check')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .stores('id', 'id');
      });
    });

    describe('Logout', () => {
      it('should throw when no access token provided', () => {
        return pactum.spec().post('/auth/logout').expectStatus(401);
      });

      it('should logout', () => {
        return pactum
          .spec()
          .post('/auth/logout')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody({
            refresh_token: '$S{userRt}',
          })
          .expectStatus(200);
      });

      describe('Login', () => {
        it('should login again after logout', () => {
          return pactum
            .spec()
            .post('/auth/login')
            .withBody(userDto)
            .expectStatus(200)
            .stores('userAt', 'access_token')
            .stores('userRt', 'refresh_token');
        });
      });
    });

    describe('Refresh Token', () => {
      it('should throw when no refresh token provided', () => {
        return pactum.spec().post('/auth/refresh').expectStatus(401);
      });

      it('should get new access token and refresh token', () => {
        return pactum
          .spec()
          .post('/auth/refresh')
          .withHeaders({
            Authorization: 'Bearer $S{userRt}',
          })
          .expectStatus(200)
          .stores('userAt', 'access_token')
          .stores('userRt', 'refresh_token');
      });
    });
  });

  describe('User', () => {
    describe('Edit user', () => {
      const dto: EditUserDto = {
        fullName: 'Ahmed Mahmoud',
        birthday: '1980-09-12',
      };
      it('should throw if no body provided', () => {
        return pactum
          .spec()
          .patch('/users/$S{id}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(400);
      });

      it('should edit user', () => {
        return pactum
          .spec()
          .patch('/users/$S{id}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.fullName)
          .expectBodyContains(dto.birthday);
      });
    });
    describe('Change password', () => {
      it('should throw if no body provided', () => {
        return pactum
          .spec()
          .patch('/users/$S{id}/change-password')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(400);
      });
      it('should throw if old password is wrong', () => {
        return pactum
          .spec()
          .patch('/users/$S{id}/change-password')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody({
            currentPassword: 'WRONG_PASSWORD',
            newPassword: '123456',
          })
          .expectStatus(401);
      });
      it('should throw if new password is short', () => {
        return pactum
          .spec()
          .patch('/users/$S{id}/change-password')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody({ currentPassword: userDto.password, newPassword: '12' })
          .expectStatus(400);
      });
      it('should change password', () => {
        return pactum
          .spec()
          .patch('/users/$S{id}/change-password')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody({
            currentPassword: userDto.password,
            newPassword: '123456',
          })
          .expectStatus(200);
      });
    });

    describe('Forget Password', () => {
      it('should throw if email not entered', () => {
        return pactum.spec().post('/auth/forget-password').expectStatus(400);
      });

      it('should throw if email not valid', () => {
        return pactum
          .spec()
          .post('/auth/forget-password')
          .withBody({
            email: 'fake_email',
          })
          .expectStatus(400);
      });

      it('should submit forget password', () => {
        return pactum
          .spec()
          .post('/auth/forget-password')
          .withBody({
            email: userDto.email,
          })
          .expectStatus(200);
      });
    });
  });

  describe('Auth', () => {
    const dto = {
      email: `test2@gmail.com`,
      fullName: 'Mustafa Hamdy',
      birthday: '1963-08-14',
      password: 'abc1244',
    };
    describe('Signup', () => {
      it('should signup to second test user', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201)
          .stores('userAt2', 'access_token')
          .stores('userRt2', 'refresh_token');
      });
    });
    describe('Check Token', () => {
      it('should get second user if token is valid', () => {
        return pactum
          .spec()
          .get('/auth/check')
          .withHeaders({
            Authorization: 'Bearer $S{userAt2}',
          })
          .expectStatus(200)
          .stores('id2', 'id');
      });
    });
  });

  describe('Birthday', () => {
    const dto: CreateBirthdayDto = {
      name: 'Ahmed',
      birthday: '1999-03-11',
      relationship: 'friend',
      notes: 'test notes',
    };
    describe('Create birthday', () => {
      it('should throw if no auth token', () => {
        return pactum.spec().post('/birthday').expectStatus(401);
      });

      it('should throw if WRONG auth token', () => {
        return pactum
          .spec()
          .post('/birthday')
          .withHeaders({
            Authorization: 'Bearer 1',
          })
          .expectStatus(401);
      });

      it('should throw if user does not verifiy his email', () => {
        return pactum
          .spec()
          .post('/birthday')
          .withBody(dto)
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(403)
          .stores('birthdayId', 'id');
      });

      describe('Auth', () => {
        it('should verify first & second user email', async () => {
          const id1 = await pactum
            .spec()
            .get('/auth/check')
            .withHeaders({
              Authorization: 'Bearer $S{userAt}',
            })
            .expectStatus(200)
            .returns('id');

          const id2 = await pactum
            .spec()
            .get('/auth/check')
            .withHeaders({
              Authorization: 'Bearer $S{userAt2}',
            })
            .expectStatus(200)
            .returns('id');

          await prisma.verifiyUserById(parseInt(id1));
          await prisma.verifiyUserById(parseInt(id2));
          return true;
        });
      });

      it('should throw if no body provided', () => {
        return pactum
          .spec()
          .post('/birthday')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(400);
      });

      it('should throw if no name provided', () => {
        return pactum
          .spec()
          .post('/birthday')
          .withBody({
            birthday: dto.birthday,
          })
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(400);
      });

      it('should throw if no birthday provided', () => {
        return pactum
          .spec()
          .post('/birthday')
          .withBody({
            name: dto.name,
          })
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(400);
      });

      it('should throw if birthday is not IsISO8601 type', () => {
        return pactum
          .spec()
          .post('/birthday')
          .withBody({
            name: dto.name,
            birthday: '01-01-2021',
          })
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(400);
      });

      it('should create birthday', () => {
        return pactum
          .spec()
          .post('/birthday')
          .withBody(dto)
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(201)
          .stores('birthdayId', 'id');
      });
    });
    describe('Get all birthdays', () => {
      it('should throw if no auth token', () => {
        return pactum.spec().get('/birthday').expectStatus(401);
      });

      it('should get all birthdays', () => {
        return pactum
          .spec()
          .get('/birthday')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectJsonLength(1);
      });
    });

    describe('Get one birthday by id', () => {
      it('should throw if no auth token', () => {
        return pactum.spec().get('/birthday/$S{birthdayId}').expectStatus(401);
      });

      it('should throw if birthdayId is not found', () => {
        return pactum
          .spec()
          .get('/birthday/-1')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(404);
      });

      it('should throw if birthdayId is not match user', () => {
        return pactum
          .spec()
          .get('/birthday/$S{birthdayId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt2}',
          })
          .expectStatus(403);
      });

      it('should get one birthday by id', () => {
        return pactum
          .spec()
          .get('/birthday/$S{birthdayId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectBodyContains(dto.name)
          .expectBodyContains(dto.birthday);
      });
    });

    describe('Edit birthday', () => {
      it('should throw if no auth token', () => {
        return pactum
          .spec()
          .patch('/birthday/$S{birthdayId}')
          .expectStatus(401);
      });

      it('should throw if birthdayId is not found', () => {
        return pactum
          .spec()
          .patch('/birthday/-1')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(404);
      });

      it('should throw if birthdayId is not match user', () => {
        return pactum
          .spec()
          .patch('/birthday/$S{birthdayId}')
          .withBody({
            notes: 'new notes',
          })
          .withHeaders({
            Authorization: 'Bearer $S{userAt2}',
          })
          .expectStatus(403);
      });

      it('should edit birthday by id', () => {
        return pactum
          .spec()
          .patch('/birthday/$S{birthdayId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody({
            notes: 'new notes',
          })
          .expectStatus(200)
          .expectBodyContains('new notes');
      });
    });

    describe('Delete birthday', () => {
      it('should throw if no auth token', () => {
        return pactum
          .spec()
          .delete('/birthday/$S{birthdayId}')
          .expectStatus(401);
      });

      it('should throw if birthdayId is not found', () => {
        return pactum
          .spec()
          .delete('/birthday/-1')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(404);
      });

      it('should throw if birthdayId is not match user', () => {
        return pactum
          .spec()
          .delete('/birthday/$S{birthdayId}')
          .withBody({
            notes: 'new notes',
          })
          .withHeaders({
            Authorization: 'Bearer $S{userAt2}',
          })
          .expectStatus(403);
      });

      it('should delete birthday by id', () => {
        return pactum
          .spec()
          .delete('/birthday/$S{birthdayId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(204);
      });
    });
  });

  // delete users after birthday test
  describe('User', () => {
    describe('Delete user', () => {
      it('should throw if user id is not equal authorized user', () => {
        return pactum
          .spec()
          .delete('/users/-1')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(403);
      });

      it('should delete user', () => {
        return pactum
          .spec()
          .delete('/users/$S{id}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(204);
      });

      it('should delete second user', () => {
        return pactum
          .spec()
          .delete('/users/$S{id2}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt2}',
          })
          .expectStatus(204);
      });
    });
  });
});
