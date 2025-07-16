import { Topic } from './Topic';

export interface Course {
  ID: number;
  title: string;
  description?: string;
  topics?: Topic[];
  created_at?: Date;
  updated_at?: Date;
  lang?: string;
  number_of_weeks?: number;
  hours_per_week?: number;
  level_of_detail?: number;
  education_content_length?: number;
  completed?: boolean;
  level? : string;
  total? : number;
  progress? : number;
  previousCompleted? : boolean;
}
