from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_distances
import numpy as np
from collections import deque
import torch
from queue import PriorityQueue

MODEL = SentenceTransformer('all-mpnet-base-v2')

sentence_queue = PriorityQueue()  # <timestamp: int, meeting_id: str, user_id: str, text: str>

class ContextualOutlierDetector:
    def __init__(self, distance_threshold=0.8, max_window_size=100):
        self.model = MODEL
        self.distance_threshold = distance_threshold
        self.max_window_size = max_window_size

        self.sentences = deque(maxlen=max_window_size)
        self.embeddings = np.zeros((max_window_size, 768))
        self.current_size = 0
        if torch.backends.mps.is_available():
            device = torch.device("mps")
        else:
            device = torch.device("cpu")
            print("MPS device not found.")
        self.model.to(device)

    def process_sentence(self, new_sentence):
        print(f"Processing sentence: '{new_sentence}'")

        new_embedding = self.model.encode([new_sentence])

        is_outlier = False
        if self.current_size > 0:
            recent_embeddings = self.embeddings[:self.current_size]
            distances = cosine_distances(new_embedding, recent_embeddings)[0]
            if all(dist > self.distance_threshold for dist in distances):
                is_outlier = True

        self.sentences.append(new_sentence)
        if self.current_size < self.max_window_size:
            self.embeddings[self.current_size] = new_embedding
            self.current_size += 1
        else:
            self.embeddings[:-1] = self.embeddings[1:]
            self.embeddings[-1] = new_embedding

        if is_outlier:
            print(f"Outlier Detected: '{new_sentence}'")
        else:
            print(f"'{new_sentence}' is consistent with topic.")
        return is_outlier



