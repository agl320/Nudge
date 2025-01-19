export interface IActivity {
  duration: number; // expected duration in ms
  description: string;
  title: string;
  context: string[]; // LLM Generated
}
