import pg, {PoolConfig} from 'pg'

const {Pool} = pg

const config: PoolConfig = {
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
}

export const pool = new Pool(config)





