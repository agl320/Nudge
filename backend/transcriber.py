import numpy as np
import whisper
from io import BytesIO
from scipy.io.wavfile import read
from faster_whisper.audio import decode_audio
import torch
from queue import Queue
from transformer import sentence_queue

class Transcriber:
    def __init__(self):
        # Initialize the Whisper model (using the base model for faster processing)
        if torch.backends.mps.is_available():
            device = torch.device("mps")
        else:
            device = torch.device("cpu")
            print("MPS device not found.")

        self.model = whisper.load_model("base")

        try:
            self.model.to(device)
        except Exception as e:
            print(f"Error pointing model to custom device")
        
        self.audio_queue = Queue() # <timestamp: int, meeting_id: str, user_id: str, audioBuffer: bytes>
                
    def transcribe(self, timestamp, meeting_id, user_id, audio_data):
        """Transcribe the audio data using Whisper"""
        try:
            # Convert audio bytes to the required format
            print("Converting audio buffer...")
            audio_array = BytesIO(audio_data)
            audio_array = decode_audio(audio_array)
            print("audio buffer converted")

            audio_array = np.copy(audio_array)

            # Transcribe using Whisper
            result = self.model.transcribe(audio_array, language="en")
            
            # Extract the transcribed text
            transcribed_text = result["text"]
            
            # Print or process the transcription as needed
            print(f"Transcription: {transcribed_text}")

            # Add the transcribed text to the sentence queue
            if len(transcribed_text) > 0:
                sentence_queue.put((timestamp, meeting_id, user_id, transcribed_text))
            
        except Exception as e:
            print(f"Transcription error: {str(e)}")
    
    
    def transcribe_worker(self):
        print("Starting transcribe worker")
        while True:
            timestamp, meeting_id, user_id, audio_data =  self.audio_queue.get()
            print("Queue not empty, transcribing audio...")
            self.transcribe(timestamp, meeting_id, user_id, audio_data)
            

    

