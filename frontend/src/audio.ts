import { Socket } from 'socket.io-client';
class VoiceRecorder {
    private stream: MediaStream;
    private socket: Socket;
    private mediaRecorder: MediaRecorder | null;
    private audioContext: AudioContext;
    private chunks: Blob[];
    public isRecording: boolean;
    private silenceTimeout: NodeJS.Timeout | null;
    private silenceThreshold: number;
    private silenceDuration: number;
    private onDataAvailable: ((data: Uint8Array) => void) | null;
    private meetingID: string;

    constructor(stream: MediaStream, socket: Socket, meetingID: string) {
        const audioTrack = stream.getAudioTracks()[0];
        this.stream = new MediaStream([audioTrack]);
        this.socket = socket;
        this.mediaRecorder = null;
        this.audioContext = new AudioContext();
        this.chunks = [];
        this.isRecording = false;
        this.silenceTimeout = null;
        this.silenceThreshold = -45; // dB
        this.silenceDuration = 600; // ms
        this.onDataAvailable = null;
        this.meetingID = meetingID;
    }

    async start() {
        // Set up audio analysis
        const audioSource = this.audioContext.createMediaStreamSource(this.stream);
        const analyser = this.audioContext.createAnalyser();
        analyser.fftSize = 2048;
        audioSource.connect(analyser);

        const mimeType = this.getSupportedMimeType();
        if (!mimeType) {
            throw new Error('No supported audio MIME type found');
        }

        // Create MediaRecorder with supported format
        this.mediaRecorder = new MediaRecorder(this.stream, {
            mimeType: mimeType
        });

        this.mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                this.chunks.push(event.data);
            }
        };

        // Set up voice activity detection
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Float32Array(bufferLength);

        const checkAudioLevel = () => {
            if (!this.isRecording) return;

            analyser.getFloatTimeDomainData(dataArray);
            
            // Calculate RMS value
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
                sum += dataArray[i] * dataArray[i];
            }
            const rms = Math.sqrt(sum / bufferLength);
            const db = 20 * Math.log10(rms);

            if (db > this.silenceThreshold) {
                // Voice detected
                //console.log("voice detected")
                
                if (this.mediaRecorder?.state === 'inactive') {
                    try {
                        console.log("recording started")
                        this.socket.emit("user_talking", {meeting_id: this.meetingID})
                        this.mediaRecorder.start(100);
                    } catch (error) {
                        console.error('Failed to start MediaRecorder:', error);
                    }
                }
                if (this.silenceTimeout) {
                    clearTimeout(this.silenceTimeout);
                    this.silenceTimeout = null;
                }
            } else if (this.mediaRecorder?.state === 'recording' && !this.silenceTimeout) {
                // Start silence timer
                this.silenceTimeout = setTimeout(() => {
                    this.mediaRecorder!!.stop();
                    console.log("recording stopped")
                    this.socket.emit("user_not_talking", {meeting_id: this.meetingID})
                    console.log("user talking emitted")
                    this.convertAndEmit();
                }, this.silenceDuration);
            }

            requestAnimationFrame(checkAudioLevel);
        };

        this.isRecording = true;
        checkAudioLevel();
    }

    stop() {
        this.isRecording = false;
        this.socket.emit("user_not_talking", {meeting_id: this.meetingID});
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.mediaRecorder.stop();
        }
        if (this.silenceTimeout) {
            clearTimeout(this.silenceTimeout);
            this.silenceTimeout = null;
        }
    }

    async convertAndEmit() {
        if (this.chunks.length === 0) return;

        const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
        console.log("mimeType: ", mimeType)
        try {
            // Combine chunks into a single blob with the original recording format
            
            const audioBlob = new Blob(this.chunks, { type: mimeType });
            this.chunks = [this.chunks[0]]; // Reset chunks

            const file = new File([audioBlob], "recording.webm", { type: mimeType });
            this.socket.emit('audio', {audio: file, meeting_id: this.meetingID, timestamp: Date.now()});
            console.log("audio emitted")
        } catch (error) {
            console.error('Error converting to audio file and emitting', error);
        }
    }

    private getSupportedMimeType(): string | null {
        const types = [
            'audio/webm',
            'audio/webm;codecs=opus',
            'audio/ogg;codecs=opus',
            'audio/mp4'
        ];

        for (const type of types) {
            if (MediaRecorder.isTypeSupported(type)) {
                return type;
            }
        }
        return null;
    }
}


export default VoiceRecorder;