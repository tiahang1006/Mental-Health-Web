import firebase_admin
from firebase_admin import credentials, firestore

cred = credentials.Certificate("mentalhealthwebthang-firebase-adminsdk-fbsvc-b6f003819b.json")
firebase_admin.initialize_app(cred)

db = firestore.client()

collection_name = "mental_health_embeddings"
docs = db.collection(collection_name).stream()

count = 0
for doc in docs:
    doc.reference.delete()
    count += 1

print(f" Deleted {count} documents from '{collection_name}'")