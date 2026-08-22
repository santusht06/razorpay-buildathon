import numpy as np
import re
from typing import List

class EmbeddingEngine:
    """
    Embedding Engine for vector retrieval.
    Generates TF-IDF normalized vector embeddings for policy document chunks and queries.
    """
    def __init__(self):
        self.vocab = {}

    def fit_transform(self, documents: List[str]) -> np.ndarray:
        words = set()
        tokenized_docs = []
        for doc in documents:
            tokens = self._tokenize(doc)
            tokenized_docs.append(tokens)
            words.update(tokens)

        self.vocab = {word: idx for idx, word in enumerate(sorted(list(words)))}
        
        vectors = []
        for tokens in tokenized_docs:
            vec = self._vectorize_tokens(tokens)
            vectors.append(vec)
        return np.array(vectors)

    def transform_query(self, query: str) -> np.ndarray:
        tokens = self._tokenize(query)
        return self._vectorize_tokens(tokens)

    def _tokenize(self, text: str) -> List[str]:
        cleaned = text.lower().replace('_', ' ').replace('-', ' ')
        tokens = re.findall(r'\w+', cleaned)
        return [t for t in tokens if len(t) > 2]

    def _vectorize_tokens(self, tokens: List[str]) -> np.ndarray:
        vec = np.zeros(len(self.vocab))
        for t in tokens:
            if t in self.vocab:
                vec[self.vocab[t]] += 1.0
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        return vec
