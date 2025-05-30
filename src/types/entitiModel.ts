import { IError } from "./errorModel";

export interface IEntity {
  id: string | null;
  name: string | null;
  address: string | null;
  capacity: number | null;
  pdf_path: string | null;
  image_url?: string | null;
}

export interface IEntitiState {
  entities: IEntity[];
  entity: IEntity | null;
  loading: boolean;
  error: IError | null;
  creatingEntityLoading: boolean | null
}