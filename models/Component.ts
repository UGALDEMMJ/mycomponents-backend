export interface component{
    id:string;
    user_id:string;
    category_id:string | null;
    name:string;
    description:string;
    code:string;
    created_at: Date;
}