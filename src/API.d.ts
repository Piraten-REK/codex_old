export declare interface User {
  id: number
  username: string
  displayName: string
  email: string
  bio: string
  avatar?: string
  gender: Gender
  isActive?: boolean
  isAdmin?: boolean
}

export declare type Gender = 'f' | 'm' | 'a'

export declare interface ApiError {
  error: number
  reason: string
  msg: string
}

export declare interface LoginResponse {
  token: string
  data: User
}
