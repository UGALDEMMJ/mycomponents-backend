export interface User {
    id:string;
    name: string;
    email: string;
    password: string;
    created_at: Date;
    token: string;
    confirmed: boolean;
}