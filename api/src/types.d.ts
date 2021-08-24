export declare namespace Database {
  interface User {
    id: number
    username: string
    display_name: string
    email: string
    password: string
    bio: string | null
    avatar: number | null
    gender: Gender
    is_active: MySQLBool
    is_admin: MySQLBool
  }

  interface File {
    id: number
    filename: string
    created: Date
    uploader: number
  }

  interface UserWithAvatar {
    id: number
    username: string
    display_name: string
    email: string
    password: string
    bio: string | null
    avatar_id: number | null
    avatar_filename: string | null
    avatar_ctime: Date | null
    gender: Gender
    is_active: MySQLBool
    is_admin: MySQLBool
  }

  interface FileWithUploader {
    id: number
    filename: string
    created: Date
    uploader_id: number
    username: string
    display_name: string
    email: string
    password: string
    bio: string|null
    avatar_id: number|null
    avatar_filename: string|null
    avatar_ctime: Date|null
    gender: Gender
    is_active: MySQLBool
    is_admin: MySQLBool
  }

  interface Committee {
    id: number
    start: Date
    end: Date | null
    hero_img: number | null
    rules_of_procedure: string | null
  }

  interface CommitteeRole {
    id: number
    title: string
    title_f: string
    title_m: string
    is_advisory: MySQLBool
  }

  interface CommitteeMember {
    user_id: number
    committee: number
    role_id: number
    start: Date
    end: Date | null
  }

  interface ApplicationCategory {
    id: number
    title: string
    application: MySQLBool
    single_resolution: MySQLBool
  }

  interface Application {
    committee_period: number
    number: number
    category: number
    start: Date
    end: Date | null
    title: string
    text: string
    reason: string | null
    status: 'new' | 'postponed' | 'rejected' | 'accepted' | 'dismissed' | 'retracted' | 'in consultation'
    applicant_is_user: MySQLBool
    applicant_user_id: number | null
    applicant_name: string | null
    implementation_is_user: MySQLBool
    implementation_user_id: number | null
    implementation_name: string | null
    is_circular: MySQLBool
    cost: number
    re_reference: number | null
  }

  interface ApplicationHistory {
    id: number
    committee_period: number
    number: number
    editor: number
    timestamp: Date
    changes: string
  }

  interface Vote {
    user_id: number
    committee_period: number
    application_number: number
    behaviour: 'in favor' | 'oppose' | 'abstained' | null
  }

  interface VoteHistory {
    id: number
    user_id: number
    committee_period: number
    application_number: number
    editor: number
    timestamp: Date
    changes: string
  }

  interface SingleResolution {
    committee_period: number
    number: number
    category: number
    start: Date
    end: Date | null
    title: string
    text: string
    reason: string | null
    status: 'new' | 'in process' | 'postponed' | 'feedback' | 'done' | 'rejected' | 'retracted'
    cost: number
    rt_reference: number | null
  }

  interface SingleResolutionHistory {
    id: number
    committee_period: number
    number: number
    editor: number
    timestamp: Date
    data: string
  }
}

type MySQLBool = 0 | 1

type Gender = 'f' | 'm' | 'a'

export declare namespace API {
  interface User {
    id?: number
    username: string
    displayName: string
    email: string
    bio?: string
    avatar?: string
    gender: Gender
    isActive?: bool
    isAdmin?: bool
  }
}
