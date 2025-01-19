import { createContext, ReactNode, useContext } from "react";
import { setDoc, doc, getFirestore } from "firebase/firestore";
import { useFirebaseApp } from "reactfire";
import { IMeetingCreation } from "@/types/IMeetingCreation";

interface MeetingContextType {
    createMeeting: (meeting: IMeetingCreation) => Promise<void>;
}

const MeetingContext = createContext<MeetingContextType | null>(null);

export function MeetingProvider({ children }: { children: ReactNode }) {
    const app = useFirebaseApp();
    const db = getFirestore(app);

    async function createMeeting(meeting: IMeetingCreation) {
        try {
            const meetingDocRef = doc(db, "meetings", meeting.meeting_id); // Use custom meeting_id as the document ID
            await setDoc(meetingDocRef, meeting); // Save the meeting with the specified ID
            console.log("Meeting added with ID:", meeting.meeting_id);
        } catch (error) {
            console.error("Error adding meeting:", error);
        }
    }

    const value = {
        createMeeting,
    };

    return (
        <MeetingContext.Provider value={value}>
            {children}
        </MeetingContext.Provider>
    );
}

export function useMeeting() {
    const context = useContext(MeetingContext);
    if (!context) {
        throw new Error("useMeeting must be used within a MeetingProvider");
    }
    return context;
}
