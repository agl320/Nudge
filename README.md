# Nudge
Nudge offers a convenient meeting solution designed to enhance efficiency by analyzing speech in real time to determine if discussions are on-topic, issuing warnings when necessary, and providing statistical insights to further improve meeting productivity.

Users can schedule meetings, define time blocks, and set specific topics for structured and efficient discussions, ensuring every meeting stays focused and productive.
 
Built with peer-to-peer services and WebRTC, it streams audio batches to a Flask backend via WebSockets. A locally embedded Llama 3 instance is then used to generate sentences that are very likely to be included into the meeting. The information is then used by our sentence transformer to produce a vector which represents the sentences in a mathematical way. These vectors are then compared together using cosine similarity which determines the on-topicness of the users.
