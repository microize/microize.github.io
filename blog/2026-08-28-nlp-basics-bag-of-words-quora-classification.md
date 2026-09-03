---
title: "NLP Basics: Bag of Words, Text Preprocessing, and a Real Kaggle Walkthrough"
date: 2026-08-28
excerpt: "Notes on how NLP turns text into numbers a model can use — Bag of Words, tokenization, stemming vs. lemmatization — worked through end-to-end on the Quora Insincere Questions Classification dataset."
tags: ["nlp", "machine-learning", "python", "learning-notes"]
layout: post.njk
image: ""
---

**Natural Language Processing (NLP)** is, at its core, about making a computer understand human language — text a person wrote, in a form a machine learning model can actually work with. These are my notes on the fundamentals, plus a walkthrough of applying them to a real dataset: the **Quora Insincere Question Classification** problem.

---

## Bag of Words

The simplest way to turn text into numbers:

1. Collect every unique word across the entire corpus (all documents combined) — this is your **vocabulary**.
2. For each document, build a vector: one slot per vocabulary word, filled with **how many times that word appears** in this specific document.

That's it — "bag" because word *order* is thrown away entirely. Two sentences with the same words in a different order produce the exact same vector.

**Limitation:** with a real corpus, the vocabulary can run into tens of thousands of words. Every document's vector then has that many dimensions, and most of them are zero (a given document only uses a tiny fraction of the total vocabulary) — a sparse, high-dimensional representation that gets expensive fast, and one that still can't tell "not good" from "good" since order is gone.

---

## The Text Preprocessing Pipeline

Before Bag of Words is even built, raw text usually passes through a few cleanup steps:

### Tokenization
Breaking text into smaller pieces — usually words ("tokens"). `"NLP is fun"` → `["NLP", "is", "fun"]`.

### Stemming
Chopping a word down to its **root**, using fairly crude rules (mostly suffix-stripping), without necessarily caring if the result is a real word.

- `"running"` → `"run"`
- `"studies"` → `"studi"` *(not even a real word — that's the trade-off: fast, but rough)*

### Lemmatization
Reducing a word to its **meaningful base form** — the dictionary form (the "lemma") — by actually consulting knowledge of the language (vocabulary + grammar), not just chopping suffixes.

- `"running"` → `"run"`
- `"better"` → `"good"` *(stemming would leave "better" untouched — it can't make this jump; lemmatization can, because it knows "better" is a form of "good")*

**Rule of thumb:** stemming is faster and cruder; lemmatization is slower but linguistically correct. Which one you need depends on whether the output needs to be human-readable or just consistent enough for a model to use.

---

## Applying It: Quora Insincere Question Classification

To make all of this concrete, I worked through the **Quora Insincere Question Classification** problem — a real Kaggle competition: classify whether a submitted question is genuine, or "insincere" (trolling, rhetorical, or intended to make a point rather than genuinely seek an answer).

### 1. Get the data

```bash
# authenticate first — place your Kaggle API token at ~/.kaggle/kaggle.json
kaggle competitions download -c quora-insincere-questions-classification

unzip quora-insincere-questions-classification.zip
# → train.csv, test.csv, sample_submission.csv
```

### 2. Explore the data (EDA)

The first thing worth checking on any classification problem is the target variable's balance:

```python
import pandas as pd

train = pd.read_csv("train.csv")
train["target"].value_counts(normalize=True)
```

For this dataset, that comes back heavily skewed — the large majority of questions are sincere, with only a small fraction (roughly 6%) flagged insincere. That imbalance matters a lot for what comes later (more on that below).

### 3. Work with a small sample first

Full training data is slow to iterate on. Take a small, reproducible slice while building the pipeline:

```python
sample = train.sample(n=20000, random_state=42)
```

Fixing `random_state` matters here — it's what makes the "random" sample reproducible between runs, so you're debugging against the same data each time.

### 4. Preprocess the text

```python
import nltk
from nltk.corpus import stopwords
from nltk.stem import PorterStemmer
from nltk.tokenize import word_tokenize

stop_words = set(stopwords.words("english"))
stemmer = PorterStemmer()

def preprocess(text):
    tokens = word_tokenize(text.lower())
    tokens = [t for t in tokens if t.isalpha() and t not in stop_words]
    return " ".join(stemmer.stem(t) for t in tokens)

sample["clean_text"] = sample["question_text"].apply(preprocess)
```

Tokenize → drop stop words (`"the"`, `"is"`, `"and"`, …, which carry little classification signal but inflate the vocabulary) → stem what's left.

### 5. Build the Bag of Words features

```python
from sklearn.feature_extraction.text import CountVectorizer

vectorizer = CountVectorizer(max_features=5000)
X = vectorizer.fit_transform(sample["clean_text"])
```

`fit` learns the vocabulary from the training text; `transform` converts each document into its word-count vector against that vocabulary. Capping `max_features` keeps the vocabulary — and the sparse matrix — from exploding, directly addressing Bag of Words' "too many words" limitation from earlier.

Worth timing this step in a notebook — vectorizing text at scale is often the slowest part of the pipeline:

```python
%%time
X = vectorizer.fit_transform(sample["clean_text"])
```

### 6. Train a model

```python
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, f1_score

X_train, X_test, y_train, y_test = train_test_split(
    X, sample["target"], test_size=0.2, random_state=42
)

model = LogisticRegression(max_iter=1000)
model.fit(X_train, y_train)

preds = model.predict(X_test)
print("Accuracy:", accuracy_score(y_test, preds))
print("F1:", f1_score(y_test, preds))
```

**A caveat that matters here:** because the classes are so imbalanced (~94% sincere), a model that just predicts "sincere" for everything would already score ~94% accuracy while being useless. That's exactly why I checked **F1 score** alongside accuracy — it accounts for precision and recall together, and won't let a lazy majority-class model look good on paper.

### 7. Submit predictions

```python
test["clean_text"] = test["question_text"].apply(preprocess)
X_submit = vectorizer.transform(test["clean_text"])
test_preds = model.predict(X_submit)

submission = pd.DataFrame({
    "qid": test["qid"],
    "prediction": test_preds
})
submission.to_csv("submission.csv", index=False)
```

Note `vectorizer.transform` here, **not** `fit_transform` — the vocabulary was already learned from training data; test data has to be mapped into that *same* vector space, not given a new one of its own.

---

## Takeaways

1. Bag of Words turns text into vectors by word count, discarding order entirely — simple, but sparse and high-dimensional at scale.
2. Stemming is fast and crude (chops suffixes, output may not be a real word); lemmatization is slower but linguistically grounded (`"better"` → `"good"`).
3. Stop-word removal before vectorizing directly shrinks the vocabulary explosion Bag of Words is prone to.
4. `fit` learns vocabulary from training data; `transform` applies it — test data always gets `transform` only, never `fit_transform`.
5. On imbalanced classification (like ~6% positive class here), **accuracy alone is misleading** — check F1/precision/recall too.
