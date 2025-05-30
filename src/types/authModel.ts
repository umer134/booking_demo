import { User } from "@supabase/supabase-js"
import { IUser } from "./userModel"
import { IError } from "./errorModel"

export interface IAuthState {
    user: User | null,
    profile: IUser | null,
    loading: boolean,
    error: IError | null,
    authStatus: string | null
}