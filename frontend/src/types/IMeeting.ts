export interface IMeeting {
    uid: string;
    // meeting will be in ms?
    schedule: { duration: number; description: string }[];
}
