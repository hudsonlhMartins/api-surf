import { SetupServer} from '@src/server';
import supertest from 'supertest';

let server: SetupServer;
jest.setTimeout(3 * 60 * 1000);
beforeAll(async () => {
  server = new SetupServer();
  await server.init();
  global.testRequest = supertest(server.getApp());
  return
});

afterAll(async () => await server.close());