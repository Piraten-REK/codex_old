import User from './User'
import { Database } from '../types'
import db from '../db'
import fs from 'fs'
import path from 'path'
import mime from 'mime-types'

export default class File {
  public readonly id: number
  public readonly filename: string
  public readonly created: Date
  private _uploader?: User

  public get uploader (): User|undefined {
    return this._uploader
  }

  public get mime (): string {
    const mimetype = mime.lookup(this.filename)
    if (mimetype === false) return 'application/octet-stream'
    return mimetype
  }

  constructor (
    id: number,
    filename: string,
    created: Date,
    uploader?: User
  ) {
    this.id = id
    this.filename = filename
    this.created = created
    this._uploader = uploader
  }

  get data (): Buffer {
    return fs.readFileSync(path.resolve(__dirname, '../../files/', this.filename))
  }

  get base64 (): string {
    return `data:${mime.lookup(this.filename) as string};base64,${fs.readFileSync(path.resolve(__dirname, '../../files/', this.filename), { encoding: 'base64' })}`
  }

  setUploaderExplicitly (uploader: User): void {
    if (this._uploader !== undefined) throw new SyntaxError('Uploader has already been set')
    this._uploader = uploader
  }

  static createFromDb (input: Omit<Database.File, 'uploader'> & { uploader: User }): File {
    return new File(
      input.id,
      input.filename,
      input.created,
      input.uploader
    )
  }

  static async getById (id: number): Promise<File> {
    const { data: dbFile } = await db.select<Database.FileWithUploader>('file_with_uploader', { id })

    const user = User.createFromDb({
      id: dbFile.uploader_id,
      username: dbFile.username,
      display_name: dbFile.display_name,
      email: dbFile.email,
      password: dbFile.password,
      bio: dbFile.bio,
      avatar_id: dbFile.avatar_id,
      avatar_filename: dbFile.avatar_filename,
      avatar_ctime: dbFile.avatar_ctime,
      gender: dbFile.gender,
      is_active: dbFile.is_active,
      is_admin: dbFile.is_admin
    })

    if (dbFile.id === dbFile.avatar_id) return user.avatar as File

    return File.createFromDb({
      id: dbFile.id,
      filename: dbFile.filename,
      created: dbFile.created,
      uploader: user
    })
  }
}
