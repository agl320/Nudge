import logging
from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit, join_room, leave_room
from transformer import ContextualOutlierDetector
from transcriber import Transcriber
from transformer import sentence_queue

import threading

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*", max_http_buffer_size=10**8, async_mode='threading')
socketio.init_app(app)

meetings = {}  # Dictionary to keep track of meetings and participants
context_detectors = {}  # Map<meeting_id, ContextOutlierDetector>
transcriber = Transcriber()  # 1 instance is enough


@socketio.on('join_meeting')
def join_meeting(data):
    meeting_id = data.get('meeting_id')
    user_id = request.sid  # Use WebSocket session ID as user ID

    if meeting_id not in meetings:
        meetings[meeting_id] = []
        context_detectors[meeting_id] = ContextualOutlierDetector()

    if user_id not in meetings[meeting_id]:
        meetings[meeting_id].append(user_id)

    join_room(meeting_id)  # this allows all the events emitted from this socket sid to only be sent to the room
    emit('user_joined', {'user_id': user_id}, room=meeting_id, skip_sid=user_id)
    logger.info(f"User {user_id} joined meeting {meeting_id}")


@socketio.on('leave_meeting')
def leave_meeting(data):
    meeting_id = data.get('meeting_id')
    user_id = request.sid

    if meeting_id in meetings and user_id in meetings[meeting_id]:
        meetings[meeting_id].remove(user_id)
        leave_room(meeting_id)
        emit('user_left', {'user_id': user_id}, room=meeting_id)
        logger.info(f"User {user_id} left meeting {meeting_id}")

    if meeting_id in meetings and not meetings[meeting_id]:
        del meetings[meeting_id]


@socketio.on('connect')
def on_connect():
    logger.info(f"Client connected: {request.sid}")


@socketio.on('disconnect')
def on_disconnect():
    logger.info(f"Client disconnected: {request.sid}")
    # Cleanup: Remove user from any meetings they were part of
    for meeting_id, participants in list(meetings.items()):
        if request.sid in participants:
            participants.remove(request.sid)
            if not participants:
                del meetings[meeting_id]
            emit('user_left', {'user_id': request.sid}, room=meeting_id)
            leave_room(meeting_id)


@socketio.on('signal')
def signaling(data):
    sender = request.sid  # Use the sender's socket ID
    data['sender'] = sender  # Add the sender's ID to the signal payload
    logger.info(f"Forwarding signal from {sender} to {data['target']}")
    emit('signal', data, room=data['target'])


@socketio.on('audio')
def handleAudio(data):
    user_id = request.sid
    audio = data['audio']
    meeting_id = data['meeting_id']
    timestamp = data['timestamp']
    logger.info(f"Audio received from {user_id} in meeting {meeting_id} at {timestamp}")
    transcriber.audio_queue.put_nowait((timestamp, meeting_id, user_id, audio))  # pipeline starts, go to transcriber.py


def context_detection_worker():
    logger.info("Starting context detection worker")
    while True:
        timestamp, meeting_id, user_id, sentence = sentence_queue.get()
        detector = context_detectors.get(meeting_id)
        if not detector:
            context_detectors[meeting_id] = ContextualOutlierDetector()
            detector = context_detectors[meeting_id]
        is_outlier = detector.process_sentence(sentence)
        if is_outlier:
            logger.warning(f"Outlier detected for user {user_id} in meeting {meeting_id}: {sentence}")
            socketio.emit('outlier_detected', {'user_id': user_id, 'sentence': sentence}, room=meeting_id)


if __name__ == '__main__':
    logger.info("Starting server...")
    threading.Thread(target=context_detection_worker, daemon=True).start()
    threading.Thread(target=transcriber.transcribe_worker, daemon=True).start()
    socketio.run(app, host='0.0.0.0', port=5555, debug=True, allow_unsafe_werkzeug=True)
