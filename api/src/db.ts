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

  async select <T> (table: string, where: Record<string, any>, joiner: 'OR'|'AND' = 'OR', fields?: string[]): Promise<{ data: T }> {
    return await new Promise((resolve, reject) => this.db.query(
      `SELECT ${fields != null ? fields.map(() => '??').join(', ') : '*'} FROM ?? WHERE ${Object.keys(where).map(() => '?? = ?').join(` ${joiner} `)}`,
      fields != null ? [fields, table, ...Object.entries(where).flat()] : [table, ...Object.entries(where).flat()],
      (error, results) => {
        if (error != null) reject(error)
        else {
          resolve({
            data: results[0] ?? null
          })
        }
      }
    ))
  }

  async exists (table: string, where: Record<string, any>, joiner: 'OR'|'AND' = 'OR'): Promise<boolean> {
    return await new Promise((resolve, reject) => this.db.query(
      `SELECT COUNT(*) AS exists FROM ?? WHERE ${Object.keys(where).map(() => '?? = ?').join(` ${joiner} `)}`,
      [table, ...Object.entries(where).flat()],
      (error, results) => {
        if (error != null) reject(error)
        else resolve(results[0].exists > 0)
      }
    ))
  }

  async insert <T> (table: string, fields: Record<string, any>, id: string = 'id'): Promise<{ insertId: number, data: T }> {
    const results: { insertId: number } = await new Promise((resolve, reject) => this.db.query(
      `INSERT INTO ?? (${Object.keys(fields).map(() => '??').join(', ')}) VALUES(${Object.keys(fields).map(() => '?').join(', ')})`,
      [table, ...Object.keys(fields), ...Object.values(fields)],
      (error, results: { insertId: number }) => {
        if (error != null) reject(error)
        else resolve(results)
      }
    ))
    const data = await this.select<T>(table, Object.fromEntries([[id, id in fields ? fields[id] : results.insertId]]))
    return {
      ...data,
      insertId: id in fields ? fields[id] : results.insertId
    }
  }

  async delete (table: string, where: Record<string, any>, joiner: 'OR'|'AND' = 'OR'): Promise<{ deleted: number }> {
    return await new Promise((resolve, reject) => this.db.query(
      `DELETE FROM ?? WHERE ${Object.keys(where).map(() => '?? = ?').join(` ${joiner} `)}`,
      [table, ...Object.entries(where).flat()],
      (error, results: { changedRows: number }) => {
        if (error != null) reject(error)
        else resolve({ deleted: results.changedRows })
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
