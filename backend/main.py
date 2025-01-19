import logging
from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit, join_room, leave_room
from transformer import ContextualOutlierDetector
from transcriber import Transcriber
from transformer import sentence_queue
from llm import LLM
from firebase import firebaseClientInstance
from firebase import FirebaseClient
import threading
import time


# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*", max_http_buffer_size=10**8, async_mode='threading')
socketio.init_app(app)

meetings = {}  # Dictionary to keep track of meetings and participants
context_detectors = {}  # Map<meeting_id, ContextOutlierDetector>

transcriber = Transcriber()  # 1 instance is enough
llm = LLM()


@app.route('/api/create_meeting', methods=['POST'])
def create_meeting():
    # create Meeting document in Firestore
    data = request.json
    print(data)
    meeting_id = data.get('meeting_id')
    current_activity = data.get('current_activity')
    start_time = data.get('start_time')
    role = data.get('role')
    setting = data.get('setting')
    activities = data.get('activities')

    firebaseClientInstance.create_meeting(meeting_id, current_activity, start_time, role, setting, activities)

    # Use LLM to create the initial list of sentences to populate meeting context
    llm.queue.put((meeting_id, role, setting, activities))

    return jsonify({'message': 'Meeting created successfully'}), 200


@app.route('/api/switch_activity', methods=['POST'])
def initialize_context():
    data = request.json
    meeting_id = data.get('meeting_id')
    next_activity = data.get('next_acitivity')
    current_epoch_time = int(time.time())
    firebaseClientInstance.update_meeting(meeting_id, current_activity=next_activity, start_time=current_epoch_time)

    return jsonify({'message': 'Activity switched successfully'}), 200



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
        try:
            FirebaseClient.delete_meeting(meeting_id)
        except Exception as e:
            logger.error(f"Error removing meeting {meeting_id} from Firestore: {str(e)}")


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

@socketio.on("user_talking")
def handleUserTalking(data):
    user_id = request.sid
    meeting_id = data['meeting_id']
    emit('user_talking', {'user_id': user_id}, room=meeting_id)
    print("user talking emitted to ", user_id)
    
@socketio.on("user_not_talking")
def handleUserNotTalking(data):
    user_id = request.sid
    meeting_id = data['meeting_id']
    emit('user_not_talking', {'user_id': user_id}, room=meeting_id)
    

def context_detection_worker():
    logger.info("Starting context detection worker")
    while True:
        # stuff I can use directly
        timestamp, meeting_id, user_id, sentence = sentence_queue.get()
        emit("transcription", {'time_stamp':timestamp,'user_id': user_id, 'sentence': sentence}, room=meeting_id)
        detector = context_detectors.get(meeting_id)
        if not detector:
            context_detectors[meeting_id] = ContextualOutlierDetector()
            detector = context_detectors[meeting_id]
        # outlier result
        is_outlier = detector.process_sentence(sentence)
        if is_outlier:
            # TODO: Increment off topic bar
            logger.warning(f"Outlier detected for user {user_id} in meeting {meeting_id}: {sentence}")
            socketio.emit('outlier_detected', {'user_id': user_id, 'sentence': sentence}, room=meeting_id)
        # TODO: else Decrement off topic bar

def llm_worker():
    logger.info("Starting LLM worker")
    while True:
        meeting_id, role, setting, activities = llm.queue.get()
        print(f"Fetched from queue, creating context for meeting {meeting_id}")
        llm.create_context(meeting_id, role, setting, activities)


if __name__ == '__main__':
    logger.info("Starting server...")
    threading.Thread(target=context_detection_worker, daemon=True).start()
    threading.Thread(target=transcriber.transcribe_worker, daemon=True).start()
    threading.Thread(target=llm_worker, daemon=True).start()
    socketio.run(app, host='0.0.0.0', port=5555, debug=True, allow_unsafe_werkzeug=True)
