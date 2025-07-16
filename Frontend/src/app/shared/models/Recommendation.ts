import { Course } from './Course';

export class Recommendation {
  id: number;
  title: string;
  description: string;
  industry: string;
  lang: string;
  company: string;
  country: string;
  city: string;
  created_at: Date;
  updated_at: Date;
  courses: Course[];
  recommended_journey? : any;
}
