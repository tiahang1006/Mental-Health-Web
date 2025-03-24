import pandas as pd
import openai
import firebase_admin
from firebase_admin import credentials, firestore
from tqdm import tqdm

# Initialize OpenAI client (new version)
client = openai.OpenAI(api_key="XXX")

# Initialize Firebase
cred = credentials.Certificate("mentalhealthwebthang-firebase-adminsdk-fbsvc-b6f003819b.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

# Read CSV data
df = pd.read_csv("cleaned_train.csv")

# Embedding generation function (new version)
def get_embedding(text):
    text = text.replace("\n", " ")
    response = client.embeddings.create(
        input=[text],
        model="text-embedding-3-small"
    )
    return response.data[0].embedding

# ☁️ Upload to Firestore
collection = db.collection("mental_health_embeddings")

for _, row in tqdm(df.iterrows(), total=len(df)):
    context = row["Context"]
    response = row["Response"]
    embedding = get_embedding(context)

    doc = {
        "context": context,
        "response": response,
        "embedding": embedding
    }
    collection.add(doc)

print("All data with embeddings has been uploaded successfully")
