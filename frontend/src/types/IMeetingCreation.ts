interface IMeetingCreation {
    // software engineer, etc.
    role: string;
    // what you are doing (activities, etc)
    setting: string;

    activites: { duration: number; description: string; title: string }[];
}
