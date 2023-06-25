import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';
import { AppModule } from '../src/app.module';
import { EditUserDto } from '../src/user/dto';
import { CreateBirthdayDto } from 'src/birthday/dto';

describe('App e2e', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
    await app.listen(3334);

    pactum.request.setBaseUrl('http://localhost:3334');
  });

  afterAll(() => {
    app.close();
  });

  describe('Helth Check', () => {
    it('should return status ok', () => {
      return pactum.spec().get('/health-check').expectStatus(200);
    });
  });

  describe('Auth', () => {
    const dto = {
      email: `test@gmail.com`,
      fullName: 'Abdelrahman',
      birthday: '1999-03-11',
      password: 'abc1244',
    };

    describe('Signup', () => {
      it('should throw if email empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            password: dto.password,
            fullName: dto.fullName,
            birthday: dto.birthday,
          })
          .expectStatus(400);
      });

      it('should throw if fullName not exist', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            email: dto.email,
            password: dto.password,
            birthday: dto.birthday,
          })
          .expectStatus(400);
      });

      it('should throw if password not exist', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            email: dto.email,
            fullName: dto.fullName,
            birthday: dto.birthday,
          })
          .expectStatus(400);
      });

      it('should throw if birthday not exist', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            email: dto.email,
            fullName: dto.fullName,
            password: dto.password,
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
          .withBody(dto)
          .expectStatus(201);
      });

      it('should throw if email is already used', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(409);
      });
    });

    describe('Login', () => {
      it('should throw if email empty', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });

      it('should throw if password empty', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody({
            email: dto.email,
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
            email: dto.email,
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
            password: dto.password,
          })
          .expectStatus(401);
      });

      it('should login', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody(dto)
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
          .expectStatus(200);
      });

      describe('Login', () => {
        it('should login again after logout', () => {
          return pactum
            .spec()
            .post('/auth/login')
            .withBody(dto)
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
