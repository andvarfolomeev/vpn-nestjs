import { join } from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: 'postgres_wireguard_proxy',
  port: 5432,
  username: 'root',
  password: 'root',
  database: 'wg_proxy',
  logging: true,
  synchronize: false,
  entities: [join(__dirname, 'entities/*.entity.{js,ts}')],
  migrations: [join(__dirname, 'migrations/*.{js,ts}')],
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
