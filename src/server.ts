import './util/module-alias'
import {Server} from '@overnightjs/core'
import bodyParser from 'body-parser'
import { ForecastController } from './controllers/forecast'
import { Application } from 'express'
import * as database from '@src/database'
import { BeachesController } from './controllers/beaches'
import { UsersController } from './controllers/users'

export class SetupServer extends Server {
    constructor(private port = 3000) {
      super();
    }
  

    public async init(): Promise<void> {
      this.setupExpress();
      this.setupControllers();
      await this.databaseSetup();
    }
  
    private setupExpress(): void {
      this.app.use(bodyParser.json());
      this.setupControllers();
    }
  
    private setupControllers(): void {
      const forecastController = new ForecastController();
      const beachesController = new BeachesController()
      const userController = new UsersController()
      this.addControllers([forecastController, beachesController, userController]);
    }
  
    public getApp(): Application {
      return this.app;
    }
  
    private async databaseSetup(): Promise<void> {
      await database.connect();
    }
    public start (){
      this.app.listen(this.port, ()=>{
        console.info(`Server running of port ${this.port}`)
      })
    }
    public async close(): Promise<void> {
      await database.close();
    }
  }