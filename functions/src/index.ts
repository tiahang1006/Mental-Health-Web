import { onRequest } from "firebase-functions/v2/https";
import { setGlobalOptions } from "firebase-functions/v2/options";
import { defineSecret } from "firebase-functions/params";
import OpenAI from "openai";
import corsLib from "cors";
import admin from "firebase-admin";
import { getCosineSimilarity } from "./utils/cosine";

// Set resource limits
setGlobalOptions({
  region: "us-central1",
  memory: "1GiB",
  timeoutSeconds: 60,
  cpu: 1,
});

const OPENAI_API_KEY = defineSecret("OPENAI_API_KEY");

// Initialize Firestore & enable CORS
if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();
const cors = corsLib({ origin: true });

// Cloud Function: getAdvice
export const getAdvice = onRequest({ secrets: [OPENAI_API_KEY] }, (req, res) => {
  cors(req, res, async () => {
    const userMessage = req.body.message;
      if (!userMessage) {
        res.status(400).send("Missing user message");
        return;
      }

      const openai = new OpenAI({ apiKey: OPENAI_API_KEY.value() });

      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `You are an AI assistant trained to help mental health counselors decide 
              how to best respond to their patients. You do not speak to patients directly. 
              Instead, you provide guidance, suggestions, and rationale to the counselor.`,
            },
            { role: "user", content: userMessage },
          ],
        });

        const reply = completion.choices[0].message?.content;
        res.send({ response: reply });
      } catch (err: any) {
        console.error("OpenAI Error:", err?.response?.data || err.message || err);
        res.status(500).json({ error: "OpenAI API call failed" });
      }
    });
  }
);

// Cloud Function: semanticSearch
export const semanticSearch = onRequest({ secrets: [OPENAI_API_KEY] }, (req, res) => {
  cors(req, res, async () => {
    try {
      const userQuery = req.body.query;
      if (!userQuery) {
        res.status(400).json({ 
          error: "Invalid request",
          message: "Missing 'query' in request body" 
      });
        return;
      }

      const openai = new OpenAI({ apiKey: OPENAI_API_KEY.value() });
      const embeddingRes = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: [userQuery],
      });

      const queryEmbedding = embeddingRes.data[0].embedding;
      const snapshot = await db.collection("mental_health_embeddings").get();

      const results: any[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (!data.embedding || !Array.isArray(data.embedding)) {
          return;
        }

        try {
          const score = getCosineSimilarity(queryEmbedding, data.embedding);
          results.push({
            context: data.context,
            response: data.response,
            similarity: score,
          });
        } catch (simErr) {
          console.error(`Error computing similarity for doc ${doc.id}:`, simErr);
        }
      });

      results.sort((a, b) => b.similarity - a.similarity);
      const top10 = results.slice(0, 10);
      res.json({ results: top10 });
    } catch (err: any) {
      console.error("Semantic Search Error:", err?.response?.data || err.message || err);
      res.status(500).json({
        error: "Failed to perform semantic search.",
        details: err?.message || err?.toString(),
      });
    }
  });
});
