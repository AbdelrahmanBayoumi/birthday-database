import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { EditUserDto } from '../src/user/dto';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
    await app.listen(3334);

    prisma = app.get(PrismaService);
    // await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:3334');
  });

  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    const dto = {
      email: 'test@gmail.com',
      fullName: 'Abdelrahman',
      birthday: '1999-03-11',
      password: 'abc1244',
    };

    describe('Helth Check', () => {
      it('should return status ok', () => {
        return pactum.spec().get('/health-check').expectStatus(200);
      });
    });

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

    describe('login', () => {
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
          .stores('userAt', 'access_token');
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
    });
  });
});
