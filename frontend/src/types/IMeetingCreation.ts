import { IActivity } from "./IActivity"; 

export interface IMeetingCreation {
  meeting_id: string;
  current_activity: string;
  start_time: number; // (epoch time)
  role: string;
  setting: string;
  activities: IActivity[];
}
