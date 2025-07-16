import { Course } from "./Course";

export interface Journey {
  ID: number;
  title: string;
  industry: string;
  description: string;
  courses? : Course[];
}
