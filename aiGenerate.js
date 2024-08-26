const dotenv = require("dotenv");
dotenv.config();
const {
  AzureAISearchVectorStore,
  AzureAISearchQueryType,
} = require("@langchain/community/vectorstores/azure_aisearch");
const { ChatPromptTemplate } = require("@langchain/core/prompts");
const { AzureChatOpenAI, OpenAIEmbeddings } = require("@langchain/openai");
const {
  createStuffDocumentsChain,
} = require("langchain/chains/combine_documents");
const { createRetrievalChain } = require("langchain/chains/retrieval");
const { RecursiveCharacterTextSplitter } = require("@langchain/textsplitters");

module.exports = async function () {
  //1536
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 0,
  });
  const documents = await splitter.splitDocuments(docs);

  // Create Azure AI Search vector store
  const store = await AzureAISearchVectorStore.fromDocuments(
    documents,
    new OpenAIEmbeddings({
      verbose: true,
      openAIApiKey: "3eda829ac2fe47409250d53bda9b36fd",
    }),
    {
      search: {
        type: AzureAISearchQueryType.SimilarityHybrid,
      },
    }
  );
  // Performs a similarity search
  const resultDocuments = await store.similaritySearch(
    "Give brief about IllustrisTNG project."
  );

  console.log("Similarity search results:");
  console.log(resultDocuments[0].pageContent);

  // Use the store as part of a chain
  const model = new AzureChatOpenAI({});
  const questionAnsweringPrompt = ChatPromptTemplate.fromMessages([
    ["system", "You are content writer of blockchain blogs."],
    ["human", "{input}"],
  ]);

  const combineDocsChain = await createStuffDocumentsChain({
    llm: model,
    prompt: questionAnsweringPrompt,
  });

  const chain = await createRetrievalChain({
    retriever: store.asRetriever(),
    combineDocsChain,
  });

  const response = await chain.invoke({
    input: "Give brief about IllustrisTNG project.",
  });

  console.log("Chain response:");
  console.log(response.answer);

  return response.answer;
};
