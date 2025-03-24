from openai import OpenAI
import firebase_admin
from firebase_admin import credentials, firestore
import numpy as np

client = OpenAI(api_key = "XXX")

cred = credentials.Certificate("mentalhealthwebthang-firebase-adminsdk-fbsvc-b6f003819b.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

def get_embedding(text):
    text = text.replace("\n", " ")
    response = client.embeddings.create(
        input=[text],
        model="text-embedding-3-small"
    )
    return response.data[0].embedding

def cosine_similarity(vec1, vec2):
    vec1 = np.array(vec1)
    vec2 = np.array(vec2)
    return np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2))

def search_similar_cases(query, top_n=5):
    query_embedding = get_embedding(query)

    docs = db.collection("mental_health_embeddings").stream()
    results = []

    for doc in docs:
        data = doc.to_dict()
        sim = cosine_similarity(query_embedding, data["embedding"])
        results.append({
            "context": data["context"],
            "response": data["response"],
            "similarity": sim
        })

    results.sort(key=lambda x: x["similarity"], reverse=True)
    return results[:top_n]

if __name__ == "__main__":
    user_input = input("Please type your question：")
    top_matches = search_similar_cases(user_input)

    print("\nTop 5 similar cases：\n")
    for i, match in enumerate(top_matches, 1):
        print(f"#{i} similarity: {match['similarity']:.4f}")
        print(f"user: {match['context']}")
        print(f"doctor: {match['response']}")
        print("--------------------------------------------------")
