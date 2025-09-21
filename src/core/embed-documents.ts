import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";

export async function embedDocuments(docsPath: string) {
    const loader = new DirectoryLoader(
        docsPath,
        {
            ".txt": (path) => new TextLoader(path),
        }
    );
    const docs = await loader.load();

    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
    });
    const splits = await splitter.splitDocuments(docs);

    const embeddings = new GoogleGenerativeAIEmbeddings({
        apiKey: process.env.GEMINI_API_KEY as string,
        model: "text-embedding-004", // or "text-embedding-004"
    });

    const vectorStore = await MemoryVectorStore.fromDocuments(
        splits,
        embeddings
    );

    return vectorStore;
}
