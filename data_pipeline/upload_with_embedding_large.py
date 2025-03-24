import pandas as pd
import openai
import firebase_admin
from firebase_admin import credentials, firestore
from tqdm import tqdm

# Initialize OpenAI and Firebase
client = openai.OpenAI(api_key="XXX")
cred = credentials.Certificate("mentalhealthwebthang-firebase-adminsdk-fbsvc-b6f003819b.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

# Read CSV
df = pd.read_csv("cleaned_train.csv")

# Embedding function (using large model)
def get_embedding(text):
    text = text.replace("\n", " ")
    res = client.embeddings.create(
        input=[text],
        model="text-embedding-3-large"
    )
    return res.data[0].embedding

# Upload to new collection
target_collection = db.collection("mental_health_embeddings_large")

for _, row in tqdm(df.iterrows(), total=len(df)):
    context = row["Context"]
    response = row["Response"]
    embedding = get_embedding(context)

    doc = {
        "context": context,
        "response": response,
        "embedding": embedding,
        "model": "text-embedding-3-large"
    }

    target_collection.add(doc)

print("All embeddings (large) uploaded.")
