export interface Dictionary<T> {
   [key: string]: T;
}

export type Has$I = { $I: any };
export type PickTypeOf$I<P> = P extends Has$I ? P['$I'] : any;
export type Has$O = { $O: any };
export type PickTypeOf$O<P> = P extends Has$O ? P['$O'] : any;
