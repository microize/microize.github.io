---
title: "Semantic Search, Lesson 1: Why Keyword Search Only Gets You Halfway"
date: 2026-08-28
excerpt: "Notes from DeepLearning.AI's Large Language Models with Semantic Search course — how BM25 keyword search actually works, why it breaks on paraphrased queries, and where embeddings, dense retrieval, and rerank fit into the bigger RAG picture."
tags: ["nlp", "semantic-search", "rag", "learning-notes"]
layout: post.njk
image: ""
---

Most search bars you've used in your life do not understand you. They match you.

That distinction sounds academic until you type "how do I stop my laptop from dying so fast" into a support portal and get back three articles about laptop batteries being recalled, because the word *battery* never appeared in your question. The engine did exactly what it was built to do. It just wasn't built to understand what you meant.

This is the gap that semantic search closes, and it's the starting point of DeepLearning.AI's short course *Large Language Models with Semantic Search*, taught with Cohere and Weaviate. These are my notes from the first lesson, expanded into something readable.

## Two kinds of search

**Lexical search** matches keywords. It looks for exact text strings — or close morphological variants — inside your documents. If your query and the document share the right words, you get a hit. If they don't, you don't. The engine has no opinion about meaning.

**Semantic search** aims at intent and context. It tries to retrieve documents that *mean* the same thing as your query, whether or not they use the same vocabulary. "Cheap flights to Rome" and "budget airfare Italy" are lexically unrelated and semantically nearly identical, and a semantic system should know that.

The course builds up to semantic search deliberately, and it starts with keyword search — partly because you need the baseline to appreciate what dense retrieval adds, and partly because keyword search is genuinely good at some things and isn't going anywhere.

## The stack: Weaviate and Cohere

Two tools carry the course.

**Weaviate** is an open-source vector database. What makes it a convenient teaching tool is that it supports both modes in one place — classic keyword search *and* vector search — so you can run the same query both ways and compare results directly.

**Cohere** provides the language models: the embeddings that power dense retrieval later in the course, plus the rerank and generation endpoints that come after that.

The workflow in the first notebook is three steps:

1. Import the libraries (`cohere`, `weaviate-client`)
2. Connect a client to the database
3. Call the keyword search API through that client

Roughly:

```python
import weaviate

client = weaviate.Client(
    url="https://cohere-demo.weaviate.network/",
    auth_client_secret=auth_config,
    additional_headers={"X-Cohere-Api-Key": cohere_api_key},
)

response = (
    client.query
    .get("Articles", ["title", "url", "text"])
    .with_bm25(query="Who wrote Hamlet?")
    .with_limit(3)
    .do()
)
```

The course uses the v3 Python client. Weaviate's v4 client restructures this API considerably, so if you're following along today, check which version you've installed before copying syntax.

The dataset is a Weaviate-hosted demo instance of Wikipedia articles — millions of them, across multiple languages — which is large enough that the difference between search strategies actually shows up.

## What `with_bm25` is doing

That one method call hides the two ideas worth taking away from this lesson.

### The inverted index

A naive search engine would scan every document for your query terms. At millions of documents, that's hopeless.

An **inverted index** flips the data around. Instead of storing *document → words it contains*, you store *word → documents that contain it*:

```
"hamlet"      → [doc_14, doc_902, doc_7781, ...]
"shakespeare" → [doc_902, doc_1130, doc_7781, ...]
```

Now a query is a lookup and an intersection rather than a scan. This is the data structure underneath essentially every keyword search system you've ever used, and it's why they're fast.

### BM25

The inverted index tells you *which* documents match. It doesn't tell you which ones matter. That's ranking, and **BM25** is the standard algorithm for it.

The intuition here — how many words the query and the document have in common — is the right starting point, and BM25 refines it with three corrections:

- **Rare words count more.** A document matching "Hamlet" is more interesting than one matching "the." Common terms get discounted; distinctive ones get weighted up.
- **Repetition has diminishing returns.** A document mentioning "Hamlet" fifty times isn't fifty times more relevant than one mentioning it five times. BM25 saturates the term-frequency contribution rather than letting it grow linearly.
- **Length is normalized.** Long documents contain more words by accident, so they'd otherwise win on volume alone. BM25 penalizes that.

Score every candidate document, sort, return the top *n*. That's keyword search.

## Where it breaks

BM25 is fast, cheap, interpretable, and needs no training. It's also completely dependent on shared vocabulary.

Ask "who was the Bard of Avon" and a BM25 system will not find the Shakespeare article unless that exact phrase appears in it. Ask about "my car won't start in the cold" and it won't surface the page about battery performance at low temperatures. Synonyms, paraphrases, and questions phrased differently from the source material all fall through.

This is precisely the failure mode the rest of the course addresses:

- **Embeddings** — turn text into vectors where semantic similarity becomes geometric proximity
- **Dense retrieval** — search that vector space instead of a word index
- **ReRank** — a second pass that reorders candidate results by relevance to the query
- **Generating answers** — feed retrieved passages to an LLM to produce a direct response rather than a list of links

That last sequence — retrieve, rerank, generate — is the shape of most production RAG systems today.

## The takeaway

Keyword search isn't the wrong answer. It's the incomplete one. It's excellent at exact matches, product codes, names, and any query where the user already knows the vocabulary of the corpus. Many strong production systems run BM25 and dense retrieval together and fuse the results, precisely because each covers the other's blind spots.

But the moment your users start asking questions in their own words instead of your documentation's words, keyword matching alone stops being enough. That's the problem semantic search exists to solve.

---

*Notes from [Large Language Models with Semantic Search](https://www.deeplearning.ai/courses/large-language-models-semantic-search), a short course from DeepLearning.AI built with Cohere and Weaviate.*
