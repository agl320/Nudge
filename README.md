# Nudge

Nudge is an intelligent meeting assistant that keeps discussions on track. Powered by AI and real-time speech analysis, Nudge helps teams maximize productivity and minimize wasted time.

**nwHacks 2025** — LLM Track Finalist

---

## 🎯 Overview

Meetings often derail from their core objectives, wasting valuable company resources and employee time. Nudge solves this problem by:

- **Real-time topic detection** — Analyzes speech to determine if discussions stay on-topic
- **Smart notifications** — Issues warnings when the conversation drifts
- **Productivity insights** — Provides statistical analysis to improve future meetings
- **Structured planning** — Schedule meetings, define time blocks, and set specific topics

With Nudge, organizations save money while employees reclaim productivity.

---

## 🛠️ Technical Architecture

Nudge combines cutting-edge technologies for efficient meeting analysis:

- **Frontend**: React + TypeScript with real-time WebRTC video streaming
- **Backend**: Flask with WebSocket support for audio processing
- **AI Model**: Locally embedded Llama 3 for sentence generation and topic analysis
- **Vector Processing**: Sentence Transformers for semantic representations
- **Similarity Matching**: Cosine similarity algorithms for on-topic detection

**How it works:**
1. Audio batches are streamed via WebRTC to the Flask backend
2. Llama 3 generates candidate sentences likely to appear in the meeting
3. Sentence Transformer converts text to mathematical vectors
4. Cosine similarity compares vectors to determine topic relevance
5. Real-time feedback keeps discussions focused

---

## 📹 Demo & Resources

**Quick Demo** — [YouTube: On-Topic Check Demo](https://www.youtube.com/watch?v=pD73LgNNiEw)  
*(Note: Demo focuses on core feature; schedule and extended features added after submission)*

**Project Page** — [Devpost Submission](https://devpost.com/software/nudge-1lf8dr)

---

## 🎨 Graphics

![nudge_logo2](https://github.com/user-attachments/assets/17892133-2fe5-486d-9c48-c0ac61e3ab77)
![nudge_slide2](https://github.com/user-attachments/assets/59f6b29a-0497-443b-9076-1d3fc42905d6)
![nudge_slide4](https://github.com/user-attachments/assets/871af16e-bf00-4e31-a170-eba261cc0f37)
![nudge_slide3](https://github.com/user-attachments/assets/fcc0afc2-07e2-4547-b4b6-6314d5d2e20c)

---

## 👥 Contributors

**M T**
