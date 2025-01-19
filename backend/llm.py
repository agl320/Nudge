from llama_cpp import Llama
from queue import Queue
from firebase import firebaseClientInstance
# <meeting_id: str, role: str, setting: str, activities: List[{duration: int, description: str, title: str}]>


class LLM:
    def __init__(self, model_path='./model/Meta-Llama-3-8B-Instruct.Q4_1.gguf', max_tokens=256):
        self.llm = Llama(model_path=model_path)
        print("Model loaded successfully")
        self.queue = Queue()
        self.max_tokens = max_tokens
    
    def create_context(self, meeting_id, role, setting, activities):
        # role: str, setting: str, activities: List[{duration: int, description: str, title: str}]
        for activity in activities:
            result = self.llm.create_chat_completion(
                messages = [
                    {
                        "role": "system",
                        "content": f"You are a {role} in a {setting} setting. You will be {activity['description']}."
                    },
                    {
                        "role": "user",
                        "content": "Say something"
                    }
                ],
                temperature=0.7,
                max_tokens=self.max_tokens,
            )
            content = result['choices'][0]['message']['content']
            print("Generated content: ", content)
            # process generated llm content
            sentences = content.split('.')
            if sentences[-1][-1] != '.':
                # remove last incomplete sentence
                sentences = sentences[:-1]
            # strip for better formatting    
            sentences = [sentence.strip() for sentence in sentences]
            print("Processed sentences: ", sentences)
            # create new activity object
            new_activity = {
                'duration': activity['duration'],
                'description': activity['description'],
                'title': activity['title'],
                'context': sentences
            }

        ## add activity to MeetingCollection.meetingId.activities
            # get MeetingCollection.meetingId.activities as new_activities
            meeting_document = firebaseClientInstance.get_meeting(meeting_id)
            # update the activities list based on title
            new_activities = meeting_document['activities']
            for i, act in enumerate(new_activities):
                if act['title'] == new_activity['title']:
                    new_activities[i] = new_activity
                    break
            print("Updated activities: ", new_activities)
            # update MeetingCollection.meetingId.activities = new_activities
            firebaseClientInstance.update_meeting(meeting_id=meeting_id, activities=new_activities)
            print("Context created successfully")
            


    


    
