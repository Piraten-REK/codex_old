import { config as dotenv } from 'dotenv'
import { resolve as path } from 'path'
import mysql from 'mysql'

dotenv({ path: path(__dirname, '../.env') })

class Database {
    private db: mysql.Connection

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
        return new Promise((resolve, reject) => this.db.query(
            fields ? 'SELECT ?? FROM ??' : 'SELECT * FROM ??',
            fields ? [fields, table] : [table],
            (error, results) => {
                if (error) reject(error)
                else resolve({
                    data: results as T[]
                })
            }
        ))
    }

    stop () {
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
