import firebase_admin
from firebase_admin import credentials, firestore
import pandas as pd

# Load Firebase credentials
cred = credentials.Certificate("mentalhealthwebthang-firebase-adminsdk-fbsvc-b6f003819b.json")
firebase_admin.initialize_app(cred)

# Initialize Firestore
db = firestore.client()

# Load cleaned dataset
file_path = "cleaned_train1.csv"
df = pd.read_csv(file_path)

# Firestore collection name
collection_name = "mental_health_conversations"

# Upload data to Firestore
for index, row in df.iterrows():
    doc = {
        "context": row["Context"],
        "response": row["Response"]
    }
    db.collection(collection_name).add(doc)

print(f"Successfully uploaded {len(df)} records to Firestore!")
