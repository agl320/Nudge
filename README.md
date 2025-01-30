# Nudge
Nudge is our project for Nwhacks 2025, LLM track finalist. Nudge offers a convenient meeting solution designed to enhance efficiency by analyzing speech in real time to determine if discussions are on-topic, issuing warnings when necessary, and providing statistical insights to further improve meeting productivity.

Users can schedule meetings, define time blocks, and set specific topics for structured and efficient discussions, ensuring every meeting stays focused and productive.
 
Built with peer-to-peer services and WebRTC, it streams audio batches to a Flask backend via WebSockets. A locally embedded Llama 3 instance is then used to generate sentences that are very likely to be included into the meeting. The information is then used by our sentence transformer to produce a vector which represents the sentences in a mathematical way. These vectors are then compared together using cosine similarity which determines the on-topicness of the users.

Quick demo of on topic check (does not show the schedule or functionality of other features because we were submitted last minute)
https://www.youtube.com/watch?v=pD73LgNNiEw

Devpost page
https://devpost.com/software/nudge-1lf8dr

Graphics
![nudge_logo2](https://github.com/user-attachments/assets/17892133-2fe5-486d-9c48-c0ac61e3ab77)
![nudge_slide2](https://github.com/user-attachments/assets/59f6b29a-0497-443b-9076-1d3fc42905d6)
![nudge_slide4](https://github.com/user-attachments/assets/871af16e-bf00-4e31-a170-eba261cc0f37)
![nudge_slide3](https://github.com/user-attachments/assets/fcc0afc2-07e2-4547-b4b6-6314d5d2e20c)
