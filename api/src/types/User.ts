import File from './File'
import bcrypt from 'bcrypt'
import db from '../db'
import { Database, API } from '../types'

export default class User {
  public readonly id: number
  public readonly username: string
  public readonly displayName: string
  public readonly email: string
  private readonly password: string
  public readonly bio?: string
  public readonly avatar?: File
  public readonly gender: 'f'|'m'|'a'
  public readonly isActive: boolean
  public readonly isAdmin: boolean

  constructor (
    id: number,
    username: string,
    displayName: string,
    email: string,
    password: string,
    bio: string|undefined,
    avatar: File|undefined,
    gender: 'f'|'m'|'a',
    isActive: boolean,
    isAdmin: boolean
  ) {
    this.id = id
    this.username = username
    this.displayName = displayName
    this.email = email
    this.password = password
    this.bio = bio
    this.avatar = avatar
    this.gender = gender
    this.isActive = isActive
    this.isAdmin = isAdmin
  }

  checkPassword (password: string): boolean {
    return bcrypt.compareSync(password, this.password)
  }

  async changePassword (old: string, newP: string): Promise<User> {
    return await new Promise<string>((resolve, reject) => {
      if (!bcrypt.compareSync(old, this.password)) return reject(new EvalError('Password mismatch'))

      resolve(bcrypt.hashSync(newP, 12))
    })
      .then(async (hash) => await db.update<Database.UserWithAvatar>('user', { password: hash }, this.id))
      .then(({ data: user }) => User.createFromDb(user))
  }

  toJSON (full: boolean = false): API.User {
    const res: API.User = {
      username: this.username,
      displayName: this.displayName,
      email: this.email,
      bio: this.bio,
      avatar: this.avatar?.base64,
      gender: this.gender
    }
    if (full) {
      res.isActive = this.isActive
      res.isAdmin = this.isAdmin
    }
    return res
  }

  static createFromDb (input: Database.UserWithAvatar): User {
    const user = new User(
      input.id,
      input.username,
      input.display_name,
      input.email,
      input.password,
      input.bio ?? undefined,
      input.avatar_id !== null
        ? new File(
          input.avatar_id,
          input.avatar_filename as string,
          input.avatar_ctime as Date,
          undefined
        )
        : undefined,
      input.gender,
      input.is_active > 0,
      input.is_admin > 0
    )

    user.avatar?.setUploaderExplicitly(user)

    return user
  }

  static async getById (id: number): Promise<User|null> {
    const { data: user } = await db.select<Database.UserWithAvatar>('user_with_avatar', { id })

    if (user == null) return null

    return User.createFromDb(user)
  }

  static async getByUsernameOrEmail (usernameOrEmail: string): Promise<User|null> {
    const { data: user } = await db.select<Database.UserWithAvatar>(
      'user_with_avatar',
      {
        username: usernameOrEmail,
        email: usernameOrEmail
      }, 'OR')

    if (user == null) return null

    return User.createFromDb(user)
  }

  static async getAll (): Promise <User[]> {
    const { data: users } = await db.selectAll<Database.UserWithAvatar>('user_with_avatar')

    return users.map(user => User.createFromDb(user))
  }

  static async createNew (
    username: string,
    displayName: string,
    email: string,
    password: string,
    bio: string|undefined,
    gender: 'f'|'m'|'a',
    isActive: boolean = true,
    isAdmin: boolean = false
  ): Promise<User> {
    const data = {
      username,
      display_name: displayName,
      email,
      password: bcrypt.hashSync(password, 12),
      bio: bio ?? null,
      gender,
      is_active: isActive ? 1 : 0,
      is_admin: isAdmin ? 1 : 0
    }

    const { data: user } = await db.insert<Database.User>('user', data)

    return User.createFromDb({ ...user, avatar_id: null, avatar_filename: null, avatar_ctime: null })
  }
}
