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
