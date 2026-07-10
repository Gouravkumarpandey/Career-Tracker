let pipeline;
let AutoModelForSequenceClassification;
let AutoTokenizer;

const initModels = async () => {
  if (!pipeline) {
    const transformers = await import('@xenova/transformers');
    pipeline = transformers.pipeline;
    AutoModelForSequenceClassification = transformers.AutoModelForSequenceClassification;
    AutoTokenizer = transformers.AutoTokenizer;
  }
};

/**
 * Generate Embeddings for a given text.
 * Uses BAAI/bge-small-en-v1.5 as default for better quality, or sentence-transformers/all-MiniLM-L6-v2.
 */
const getEmbeddings = async (text, modelName = 'Xenova/bge-small-en-v1.5') => {
  await initModels();
  const embedder = await pipeline('feature-extraction', modelName);
  const output = await embedder(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
};

/**
 * Rerank documents relative to a query.
 * Uses BAAI/bge-reranker-base.
 */
const rerank = async (query, documents, modelName = 'Xenova/bge-reranker-base', topK = null) => {
  await initModels();
  
  const tokenizer = await AutoTokenizer.from_pretrained(modelName);
  const model = await AutoModelForSequenceClassification.from_pretrained(modelName);

  const pairs = documents.map(doc => [query, doc]);
  const inputs = await tokenizer(pairs, { padding: true, truncation: true });
  const { logits } = await model(inputs);

  // Softmax or direct score extraction
  const scores = Array.from(logits.data);

  // Combine scores with documents and sort
  const results = documents.map((doc, index) => ({
    document: doc,
    score: scores[index],
    index
  })).sort((a, b) => b.score - a.score);

  return topK ? results.slice(0, topK) : results;
};

module.exports = {
  getEmbeddings,
  rerank
};
