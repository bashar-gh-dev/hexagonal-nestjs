import {
  DynamicModule,
  Module,
  ModuleMetadata,
  Provider,
  Type,
} from '@nestjs/common';
import { Db, MongoClient } from 'mongodb';
import { NestMongodbService } from './nest-mongodb.service';

/**
 * This module needs to be reimplemented *_*
 */

const NestMongodbModuleOptions = 'NestMongodbModuleOptions';
const NestMongodbModuleId = 'NestMongodbModuleId';

type NestMongodbModuleOptions = {
  userName: string;
  password: string;
  database: string;
};

interface NestMongodbOptionsFactory {
  createNestMongodbOptions():
    | Promise<NestMongodbModuleOptions>
    | NestMongodbModuleOptions;
}

interface NestMongodbModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  name?: string;
  useExisting?: Type<NestMongodbOptionsFactory>;
  useClass?: Type<NestMongodbOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<NestMongodbModuleOptions> | NestMongodbModuleOptions;
  dataSourceFactory?: NestMongodbOptionsFactory;
  inject?: any[];
  extraProviders?: Provider[];
}

@Module({})
export class NestMongodbModule {
  // internal injection token only for sharing the returned dbRef between forRoot and forFeature modules
  private static _dbRefToken = 'DbRef';

  static forFeature(): DynamicModule {
    return {
      module: NestMongodbModule,
      providers: [
        {
          provide: NestMongodbService,
          inject: [NestMongodbModule._dbRefToken],
          useFactory: (db: Db) => {
            if (!db)
              throw new Error(
                'No db connection found, please make sure you imported forRoot module in AppModule.',
              );
            return db;
          },
        },
      ],
      exports: [NestMongodbService],
    };
  }

  static forRoot(options: NestMongodbModuleAsyncOptions): DynamicModule {
    const asyncProviders = this.createAsyncProviders(options);

    const dataSourceProvider = {
      provide: NestMongodbModule._dbRefToken,
      useFactory: async ({
        userName,
        password,
        database,
      }: NestMongodbModuleOptions) => {
        return await MongoClient.connect(
          `mongodb+srv://${userName}:${password}@cluster0.s0uxofe.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`,
        ).then((res) => res.db(database));
      },
      inject: [NestMongodbModuleOptions],
    };
    const providers = [
      ...asyncProviders,
      dataSourceProvider,
      {
        provide: NestMongodbModuleId,
        useValue: NestMongodbModuleId,
      },
      ...(options.extraProviders || []),
    ];
    const exports = [NestMongodbModule._dbRefToken];

    return {
      global: true,
      module: NestMongodbModule,
      imports: options.imports,
      providers,
      exports,
    };
  }

  private static createAsyncProviders(
    options: NestMongodbModuleAsyncOptions,
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }
    const useClass = options.useClass as Type<NestMongodbOptionsFactory>;
    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: useClass,
        useClass,
      },
    ];
  }

  private static createAsyncOptionsProvider(
    options: NestMongodbModuleAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: NestMongodbModuleOptions,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }
    const inject = [
      (options.useClass ||
        options.useExisting) as Type<NestMongodbOptionsFactory>,
    ];
    return {
      provide: NestMongodbModuleOptions,
      useFactory: async (optionsFactory: NestMongodbOptionsFactory) =>
        await optionsFactory.createNestMongodbOptions(),
      inject,
    };
  }
}
