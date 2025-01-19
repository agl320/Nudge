import { useNavigate, useParams } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import io from "socket.io-client";
import VoiceRecorder from "@/audio";
import InfoBar from "./InfoBar";

import { Button } from "../ui/button";
import { Slider } from "../ui/slider";
import { useFirestore, useUser } from "reactfire";
import { Separator } from "../ui/separator";
import NavBar from "../NavBar/NavBar";
import { ArrowLeft, ArrowRight, ChevronRight, Mic, MicOff } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    where,
} from "firebase/firestore";
import { Toaster } from "../ui/toaster";
import { useToast } from "@/hooks/use-toast";
import MeetingInfo from "./MeetingInfo";
import VideoSection from "./VideoSection";
import ActivityLog from "./ActivityLog";

const socket = io("http://127.0.0.1:5555");

interface SignalPayload {
    sender: string;
    sdp?: RTCSessionDescriptionInit;
    candidate?: RTCIceCandidateInit;
}

export default function Meeting() {
    const { status, data: user } = useUser();
    const { meetingID } = useParams();
    const navigate = useNavigate();
    const firestore = useFirestore();

    const [remoteStreams, setRemoteStreams] = useState<{
        [key: string]: MediaStream;
    }>({}); // remote user streams
    const [isAudioMuted, setIsAudioMuted] = useState(false);
    const [talkingRemoteUsers, setTalkingRemoteUsers] = useState<Set<string>>(
        new Set()
    );
    const [sliderValue, setSliderValue] = useState<number[]>([33]); // Initialize with default value
    const [chatStream, setChatStream] = useState<string[]>([]);

    const [meetingDocumentId, setMeetingDocumentId] = useState(null);
    const [loadingMeetingDoc, setLoadingMeetingDoc] = useState(true);
    const [meetingData, setMeetingData] = useState<MeetingData | null>(null); // State to store the document data

    // useEffect oo listen for document changes

    useEffect(() => {
        const fetchMeetingDocumentId = async () => {
            try {
                // Reference the Firestore "meetings" collection
                const meetingCollectionRef = collection(firestore, "meetings");

                // Create a query to find the document where meeting_id matches meetingID
                const q = query(
                    meetingCollectionRef,
                    where("meeting_id", "==", meetingID)
                );

                // Execute the query
                const querySnapshot = await getDocs(q);

                // Check if any document matches and extract the ID
                if (!querySnapshot.empty) {
                    const meetingDoc = querySnapshot.docs[0];
                    setMeetingDocumentId(meetingDoc.id); // Set the document ID
                } else {
                    console.warn(
                        "No matching meeting found for ID:",
                        meetingID
                    );
                }
            } catch (error) {
                console.error("Error fetching meeting document ID:", error);
            } finally {
                setLoadingMeetingDoc(false); // Stop loading spinner
            }
        };

        if (meetingID) {
            fetchMeetingDocumentId();
        }
    }, [firestore, meetingID]);

    // retrieve document data
    useEffect(() => {
        const fetchMeetingData = async () => {
            if (meetingDocumentId) {
                try {
                    // Reference the specific document in Firestore
                    const meetingDocRef = doc(
                        firestore,
                        "meetings",
                        meetingDocumentId
                    );

                    // Fetch the document data
                    const meetingDoc = await getDoc(meetingDocRef);

                    if (meetingDoc.exists()) {
                        console.log({ DATA: meetingDoc.data() });
                        setMeetingData(meetingDoc.data() as MeetingData); // Store the document data in state
                    } else {
                        console.warn(
                            "No document found for ID:",
                            meetingDocumentId
                        );
                    }
                } catch (error) {
                    console.error(
                        "Error fetching meeting document data:",
                        error
                    );
                }
            }
        };

        fetchMeetingData();
    }, [meetingDocumentId, firestore]); // Re-run when meetingDocumentId changes

    useEffect(() => {
        setOnTopic(
            meetingData?.current_activity ?? meetingData?.activities?.[0].title
        );
    }, [meetingData]);

    const handleChange = (value: number[]) => {
        setSliderValue(value); // Update the state when the slider changes
    };

    const localVideoRef = useRef<HTMLVideoElement>(null); // local video element
    const peerConnections = useRef<{ [key: string]: RTCPeerConnection }>({}); // map user ID to RTCPeerConnection
    const localStream = useRef<MediaStream | null>(null); // local media stream
    const voiceRecorderRef = useRef<VoiceRecorder | null>(null);

    // start local video/audio stream
    const startLocalStream = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: { echoCancellation: true, noiseSuppression: true },
            });
            localStream.current = stream; // save local stream
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream; // attach stream to video element
            }

            processAudio(stream);
        } catch (error) {
            console.error("Error accessing local media:", error);
        }
    };

    const processAudio = async (stream: MediaStream) => {
        voiceRecorderRef.current = new VoiceRecorder(
            stream,
            socket,
            meetingID || ""
        );
        voiceRecorderRef.current.start();
    };

    // set up WebRTC connections
    const setupWebRTC = async () => {
        const config = {
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        };

        // handle new user joining
        socket.on("user_joined", async ({ user_id }) => {
            const peerConnection = new RTCPeerConnection(config);
            peerConnections.current[user_id] = peerConnection; // save connection

            // add local stream tracks to peer connection
            localStream.current
                ?.getTracks()
                .forEach((track) =>
                    peerConnection.addTrack(track, localStream.current!)
                );

            // handle remote stream tracks
            peerConnection.ontrack = (event) => {
                setRemoteStreams((prev) => ({
                    ...prev,
                    [user_id]: event.streams[0], // save remote stream
                }));
            };

            // send ICE candidates
            peerConnection.onicecandidate = (event) => {
                if (event.candidate) {
                    socket.emit("signal", {
                        target: user_id,
                        candidate: event.candidate,
                    });
                }
            };

            // create offer and send to new user
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            socket.emit("signal", { target: user_id, sdp: offer });
        });

        // handle incoming signal (SDP/ICE)
        socket.on(
            "signal",
            async ({ sender, sdp, candidate }: SignalPayload) => {
                if (!peerConnections.current[sender]) {
                    const peerConnection = new RTCPeerConnection(config);
                    peerConnections.current[sender] = peerConnection;

                    localStream.current
                        ?.getTracks()
                        .forEach((track) =>
                            peerConnection.addTrack(track, localStream.current!)
                        );

                    peerConnection.ontrack = (event) => {
                        setRemoteStreams((prev) => ({
                            ...prev,
                            [sender]: event.streams[0],
                        }));
                    };

                    peerConnection.onicecandidate = (event) => {
                        if (event.candidate) {
                            socket.emit("signal", {
                                target: sender,
                                candidate: event.candidate,
                            });
                        }
                    };
                }

                const peerConnection = peerConnections.current[sender];

                if (sdp) {
                    await peerConnection.setRemoteDescription(
                        new RTCSessionDescription(sdp)
                    );
                    if (sdp.type === "offer") {
                        const answer = await peerConnection.createAnswer();
                        await peerConnection.setLocalDescription(answer);
                        socket.emit("signal", { target: sender, sdp: answer });
                    }
                } else if (candidate) {
                    await peerConnection.addIceCandidate(
                        new RTCIceCandidate(candidate)
                    );
                }
            }
        );

        // handle user leaving
        socket.on("user_left", ({ user_id }) => {
            if (peerConnections.current[user_id]) {
                peerConnections.current[user_id].close(); // close connection
                delete peerConnections.current[user_id];
            }
            setRemoteStreams((prev) => {
                const updatedStreams = { ...prev };
                delete updatedStreams[user_id]; // remove stream
                return updatedStreams;
            });
        });

        socket.on(
            "outlier_detected",
            ({ user_id, sentence }: { user_id: string; sentence: string }) => {}
        );

        socket.on("user_talking", ({ user_id }) => {
            console.log(`${user_id} is talking`);
            setTalkingRemoteUsers((prev) => {
                const newSet = new Set(prev);
                newSet.add(user_id);
                return newSet;
            });
            console.log(talkingRemoteUsers);
        });

        socket.on("user_not_talking", ({ user_id }) => {
            console.log(`${user_id} is not talking`);
            console.log(talkingRemoteUsers);
            setTalkingRemoteUsers((prev) => {
                const newSet = new Set(prev);
                newSet.delete(user_id);
                return newSet;
            });
            console.log(talkingRemoteUsers);
        });
    };

    // join meeting
    const joinMeeting = async () => {
        if (!meetingID) return; // require meeting ID
        await startLocalStream(); // start local video/audio
        await setupWebRTC(); // set up connections
        socket.emit("join_meeting", { meeting_id: meetingID }); // notify server
    };

    // leave meeting
    const leaveMeeting = () => {
        socket.emit("leave_meeting", { meeting_id: meetingID }); // notify server
        // stop recording audio
        voiceRecorderRef.current?.stop();
        // close all connections and stop local stream
        Object.values(peerConnections.current).forEach((pc) => pc.close());
        peerConnections.current = {};
        setRemoteStreams({});
        localStream.current?.getTracks().forEach((track) => track.stop());
        localStream.current = null;

        navigate("/meeting");
    };

    const toggleMute = () => {
        if (!localStream.current) return;
        const audioTrack = localStream.current.getAudioTracks()[0];
        if (audioTrack) {
            setIsAudioMuted(!isAudioMuted);
        }
        if (!audioTrack.enabled) {
            voiceRecorderRef.current?.start();
            audioTrack.enabled = true;
        } else {
            voiceRecorderRef.current?.stop();
            audioTrack.enabled = false;
        }
    };

    const removeSocketListeners = () => {
        socket.off("user_joined");
        socket.off("signal");
        socket.off("user_left");
        socket.off("user_talking");
        socket.off("user_not_talking");
        socket.off("transcription");
    };

    useEffect(() => {
        joinMeeting();
        socket.on("transcription", (data) => {
            console.log("----------------------------------------");
            const { time_stamp, user_id, sentence } = data;
            console.log({ time_stamp, user_id, sentence });
            setChatStream((prev) => {
                console.log(
                    `[${time_stamp}] User ${user_id} said: ${sentence}`
                );
                return [
                    ...prev,
                    `[${time_stamp}] User ${user_id} said: ${sentence}`,
                ];
            });
        });
        console.log(
            "socket transcription listener",
            socket.listeners("transcription")
        );
        return removeSocketListeners;
    }, []);

    const [currentSliceIndex, setCurrentSliceIndex] = useState(0); // New state for slicing remote streams

    const handleLeftClick = () => {
        setCurrentSliceIndex((prev) => Math.max(0, prev - 3));
    };

    const handleRightClick = () => {
        setCurrentSliceIndex((prev) => {
            const maxIndex = Math.max(0, Object.keys(remoteStreams).length - 3);
            return Math.min(maxIndex, prev + 3);
        });
    };

    const displayedStreams = Object.entries(remoteStreams).slice(
        currentSliceIndex,
        currentSliceIndex + 3
    );

    const [onTopic, setOnTopic] = useState<string>(
        meetingData?.activities[0].label
    );

    if (status === "loading") {
        return <p>Loading...</p>;
    }

    // TODO : send to backend
    const handleNextTopic = () => {
        if (!meetingData?.activities) {
            console.warn("No activities available");
            return;
        }

        // Find the index of the current topic by title
        const currentTopicIndex = meetingData.activities.findIndex(
            (activity) => activity.title === onTopic // `onTopic` is the current topic title
        );

        if (currentTopicIndex === -1) {
            console.warn("Current topic not found in activities");
            return;
        }

        // Calculate the next topic index
        const nextTopicIndex = currentTopicIndex + 1;

        // If there's no next topic, return early
        if (nextTopicIndex > meetingData.activities.length - 1) {
            console.log("No more topics available");
            return;
        }

        const url = "http://localhost:5555/api/switch_activity";

        // Prepare the object to send
        const toSendObj = {
            next_activity: meetingData.activities[nextTopicIndex].title,
            meeting_id: meetingID,
            meeting_document_id: meetingDocumentId,
        };

        try {
            fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(toSendObj),
            }).then((res) => console.log("response:", res));

            setOnTopic(meetingData.activities[nextTopicIndex].title);
        } catch (e: any) {
            console.log("error:", e);
        }
    };

    console.log({ chatStream });

    if (!user) {
        navigate("/");
    }

    return (
        <div className="h-screen w-screen bg-black bg-cover overflow-x-hidden">
            <div className="h-full w-full bg-black max-w-full mx-auto flex flex-col flex-1 px-24">
                <NavBar user={user} />
                <div className="flex py-8 h-full">
                    <MeetingInfo
                        meetingID={meetingID}
                        user={user}
                        remoteStreams={remoteStreams}
                        meetingData={meetingData}
                        onTopic={onTopic}
                        handleNextTopic={handleNextTopic}
                    />
                    <VideoSection
                        localVideoRef={localVideoRef}
                        displayedStreams={displayedStreams}
                        handleLeftClick={handleLeftClick}
                        handleRightClick={handleRightClick}
                        sliderValue={sliderValue}
                        handleChange={handleChange}
                        toggleMute={toggleMute}
                        leaveMeeting={leaveMeeting}
                        isAudioMuted={isAudioMuted}
                    />
                    <ActivityLog
                        chatStream={chatStream}
                        leaveMeeting={leaveMeeting}
                    />
                </div>
            </div>
        </div>
    );
}
