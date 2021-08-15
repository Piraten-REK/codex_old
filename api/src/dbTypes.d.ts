declare namespace Database {
    namespace Tables {
        type User = {
            id: number
            username: string
            display_name: string
            email: string
            password: string
            bio: string | null
            avatar: number | null
            gender: 'f' | 'm' | 'a',
            is_active: MySQLBool,
            is_admin: MySQLBool
        }

        type File = {
            id: number
            filename: string
            created: Date
            uploader: number
        }

        type Committee = {
            id: number
            start: Date
            end: Date | null
            hero_img: number | null
            rules_of_procedure: string | null
        }

        type CommitteeRole = {
            id: number
            title: string
            title_f: string
            title_m: string
            is_advisory: MySQLBool
        }

        type CommitteeMember = {
            user_id: number
            committee: number
            role_id: number
            start: Date
            end: Date | null
        }

        type ApplicationCategory = {
            id: number
            title: string
            application: MySQLBool
            single_resolution: MySQLBool
        }

        type Application = {
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

        type ApplicationHistory = {
            id: number
            committee_period: number
            number: number
            editor: number
            timestamp: Date
            changes: string
        }

        type Vote = {
            user_id: number
            committee_period: number
            application_number: number
            behaviour: 'in favor' | 'oppose' | 'abstained' | null
        }

        type VoteHistory = {
            id: number
            user_id: number
            committee_period: number
            application_number: number
            editor: number
            timestamp: Date
            changes: string
        }

        type SingleResolution = {
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

        type SingleResolutionHistory = {
            id: number
            committee_period: number
            number: number
            editor: number
            timestamp: Date
            data: string
        }
    }

    type MySQLBool = 0 | 1
}

export default Database
