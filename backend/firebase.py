import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

cred = credentials.Certificate("./firebase_credentials.json")

class FirebaseClient:
    def __init__(self):
        self.app = firebase_admin.initialize_app(cred)
        self.db = firestore.client()
    
    def create_meeting(self, meeting_id, current_activity, start_time, role, setting, activities):
        print(f"Creating meeting {meeting_id} in Firestore with data: {current_activity}, {start_time}, {role}, {setting}, {activities}")
        try: 
            doc_ref = self.db.collection(u'meetings').document(meeting_id)
            doc_ref.set({
                u'meeting_id': meeting_id,
                u'current_activity': current_activity,
                u'start_time': start_time,
                u'role': role,
                u'setting': setting,
                u'activities': activities
            })
            print(f"Meeting {meeting_id} created successfully in Firestore")
        except Exception as e:
            print(f"Error creating meeting {meeting_id} in Firestore: {str(e)}")
    
    def delete_meeting(self, meeting_id):
        doc_ref = self.db.collection(u'meetings').document(meeting_id)
        doc_ref.delete()
        print(f"Meeting {meeting_id} deleted successfully from Firestore")
    
    def update_meeting(self, meeting_id, current_activity=None, start_time=None, role=None, setting=None, activities=None):
        try:
            doc_ref = self.db.collection(u'meetings').document(meeting_id)
            update_data = {}
            if current_activity is not None:
                update_data[u'current_activity'] = current_activity
            if start_time is not None:
                update_data[u'start_time'] = start_time
            if role is not None:
                update_data[u'role'] = role
            if setting is not None:
                update_data[u'setting'] = setting
            if activities is not None:
                update_data[u'activities'] = activities
            
            if update_data:
                doc_ref.update(update_data)
                print(f"Meeting {meeting_id} updated successfully in Firestore")
            else:
                print(f"No fields to update for meeting {meeting_id}")
        except Exception as e:
            print(f"Error updating meeting {meeting_id} in Firestore: {str(e)}")

    def get_meeting(self, meeting_id):
        try:
            doc_ref = self.db.collection(u'meetings').document(meeting_id)
            doc = doc_ref.get()
            if doc.exists:
                return doc.to_dict()
            else:
                return None
        except Exception as e:
            print(f"Error getting meeting {meeting_id} from Firestore: {str(e)}")
            return None
        
firebaseClientInstance = FirebaseClient()