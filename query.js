import * as dotenv from 'dotenv';
dotenv.config();

import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { Pinecone } from '@pinecone-database/pinecone';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const History = [];

async function transformQuery(question){

History.push({
    role:'user',
    parts:[{text:question}]
    })  

const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: History,
    config: {
      systemInstruction: `You are a query rewriting expert. Based on the provided chat history, rephrase the "Follow Up user Question" into a complete, standalone question that can be understood without the chat history.
    Only output the rewritten question and nothing else.
      `,
    },
 });
 
 History.pop()
 
 return response.text


}



export async function genrate(userProblem) {
  try {
    userProblem = userProblem.trim();
    if (!userProblem) return "⚠️ Please enter a valid question.";

    // standalone ques mai convert
    //const standaloneQuestion = await transformQuery(userProblem);

    // question to vector
    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GEMINI_API_KEY,
      model: 'text-embedding-004',
    });
    const queryVector = await embeddings.embedQuery(userProblem);

    // pinecone db




    const pinecone = new Pinecone();
    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);

    const searchResults = await pineconeIndex.query({
      topK: 50,
      vector: queryVector,
      includeMetadata: true,
    });

    // context banega pinecone se
    const context = searchResults.matches.length > 0
      ? searchResults.matches.map(match => match.metadata.text).join("\n\n---\n\n")
      : null;

    // user messsage ko history mai push karo
    History.push({
      role: 'user',
      parts: [{ text: userProblem }]
    });

    //   Gemini  



    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: History,
      config: {
        systemInstruction: `You are a chatbot named Bit Buddy, You are a AI bot. you are part of BITP students community, made and developed by BITP student community,you are made to help the student of BIT patna students.
 
Answer the question with the help of context you can also use external sources. If no context, take the help of external sources. 

Context: ${context}`,
      },
    });

    // json
    console.log("Raw Gemini response:", JSON.stringify(response, null, 2));

    // answer from candidates
    let answer = "⚠️ Something went wrong while generating response.";
    if (response?.candidates?.[0]?.content?.parts?.[0]?.text) {
      answer = response.candidates[0].content.parts[0].text;
    } else if (!context) {
      answer = "I could not find the answer in my vector knowledgebase.";
    }

    // model response ko history mai push karo
    History.push({
      role: 'model',
      parts: [{ text: answer }]
    });

    return answer;
  } catch (err) {
    console.error("Error in genrate():", err);
    return "⚠️ Something went wrong while generating response.";
  }
}
