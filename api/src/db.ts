import { config as dotenv } from 'dotenv'
import { resolve as path } from 'path'
import mysql from 'mysql'

dotenv({ path: path(__dirname, '../.env') })

class Database {
  private readonly db: mysql.Connection

  constructor () {
    this.db = mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME
    })
    this.db.connect()
  }

  async selectAll <T> (table: string, fields?: string[]): Promise<{ data: T[] }> {
    return await new Promise((resolve, reject) => this.db.query(
      (fields != null) ? 'SELECT ?? FROM ??' : 'SELECT * FROM ??',
      (fields != null) ? [fields, table] : [table],
      (error, results) => {
        if (error != null) reject(error)
        else {
          resolve({
            data: results as T[]
          })
        }
      }
    ))
  }

  stop (): void {
    this.db.end()
  }
}

const db = new Database()

process.once('SIGTERM', () => {
  db.stop()
  process.exit()
})
process.once('SIGINT', () => {
  db.stop()
  process.exit()
})

export default db
