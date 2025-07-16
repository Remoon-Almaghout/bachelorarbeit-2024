import { EducationalPackage } from './EducationalPackage';

export interface Topic {
  ID: number;
  title: string;
  description?: string;
  educational_packages?: EducationalPackage[];
  created_at?: Date;
  updated_at?: Date;
  lang?: string;
  completed : boolean;
  total? : number;
  progress? : number;
  previousCompleted? : boolean;
}
