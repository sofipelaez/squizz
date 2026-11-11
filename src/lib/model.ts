export type Role='Laura'|'Miguel';
export type Squish={id:string,user:Role,day:string,createdAt:string};
export type Update={id:string,title:string,body:string,createdAt:string,read:boolean};
export type Store={squishes:Squish[],sentAnonymous:string[],updates:Update[]};
export const STORE_KEY='squizze-usability-v1';
export const emptyStore:Store={squishes:[],sentAnonymous:[],updates:[]};
export function todayKey(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
