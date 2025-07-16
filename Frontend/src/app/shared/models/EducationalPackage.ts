import { OER, RemoteOER } from './OER';

export interface EducationalPackage {
  ID: number;
  title: string;
  description?: string;
  oers?: RemoteOER[];
  educational_contents?: OER[];
  created_at?: Date;
  updated_at?: Date;
  completed? : boolean;
  total? : number;
  progress? : number;
  previousCompleted? : boolean;
}
