# 📘 EchoTrace  
### Event-Based Personal Timeline Reconstruction System

---

## 🧩 Introduction

EchoTrace is a **day-to-day personal timeline system** that helps users understand **how their day actually unfolded**, rather than how it was planned. Instead of managing tasks or goals, EchoTrace focuses on **logging small, timestamped micro-events** and reconstructing them into a meaningful daily timeline.

Modern productivity tools emphasize planning, reminders, and habits. However, people often lose track of **context switches**, **idle gaps**, and **small distractions** that accumulate throughout the day. EchoTrace addresses this gap by acting as a lightweight **event stream for personal activity**, enabling reflection, awareness, and future insight.

The system is intentionally designed to start **simple and synchronous**, while remaining **architecturally ready** for background processing, analytics, and rich frontend upgrades in later phases.

---

## 🎯 Problem Statement

People frequently struggle to answer questions like:
- *Where did my time actually go today?*
- *Why did I feel busy but not productive?*
- *How often do I switch contexts during the day?*

Most tools focus on **what should be done**, not **what actually happened**. EchoTrace fills this gap by capturing reality through micro-events and reconstructing daily timelines that highlight gaps, switches, and patterns.

---

## 💡 Solution Overview

EchoTrace allows users to:
- Log short, frictionless micro-events throughout the day
- Automatically timestamp and store events
- View a reconstructed daily timeline
- Identify inactivity gaps and frequent context switches

Rather than enforcing structure, EchoTrace passively records activity and derives insight later.

---

## 🏗️ High-Level Architecture (Phase-0)

# 📘 EchoTrace  
### Event-Based Personal Timeline Reconstruction System

---

## 🧩 Introduction

EchoTrace is a **day-to-day personal timeline system** that helps users understand **how their day actually unfolded**, rather than how it was planned. Instead of managing tasks or goals, EchoTrace focuses on **logging small, timestamped micro-events** and reconstructing them into a meaningful daily timeline.

Modern productivity tools emphasize planning, reminders, and habits. However, people often lose track of **context switches**, **idle gaps**, and **small distractions** that accumulate throughout the day. EchoTrace addresses this gap by acting as a lightweight **event stream for personal activity**, enabling reflection, awareness, and future insight.

The system is intentionally designed to start **simple and synchronous**, while remaining **architecturally ready** for background processing, analytics, and rich frontend upgrades in later phases.

---

## 🎯 Problem Statement

People frequently struggle to answer questions like:
- *Where did my time actually go today?*
- *Why did I feel busy but not productive?*
- *How often do I switch contexts during the day?*

Most tools focus on **what should be done**, not **what actually happened**. EchoTrace fills this gap by capturing reality through micro-events and reconstructing daily timelines that highlight gaps, switches, and patterns.

---

## 💡 Solution Overview

EchoTrace allows users to:
- Log short, frictionless micro-events throughout the day
- Automatically timestamp and store events
- View a reconstructed daily timeline
- Identify inactivity gaps and frequent context switches

Rather than enforcing structure, EchoTrace passively records activity and derives insight later.

---

## 🏗️ High-Level Architecture (Phase-0)

Browser (HTML + JavaScript)  
↓  
Node.js REST API  
↓  
MongoDB


The system follows a **clean separation of concerns**, allowing future enhancements (background jobs, analytics, React UI) without refactoring core logic.

---

## ✅ Functional Requirements (FR)

### FR-1: Event Logging
The system shall allow users to log micro-events with minimal effort.  
Each event includes:
- a short label (description)
- an optional category
- an automatically assigned timestamp

---

### FR-2: Automatic Timestamping
The system shall automatically record the timestamp of each event at the time of submission.

---

### FR-3: Daily Timeline View
The system shall allow users to view a chronological timeline of events for a selected day.  
Events must be ordered strictly by timestamp.

---

### FR-4: Inactivity Gap Detection
The system shall detect inactivity gaps between consecutive events when the gap duration exceeds a configurable threshold (e.g., 30 minutes).

---

### FR-5: Event Categorization
The system shall support optional categorization of events (e.g., Work, Personal, Distraction).

---

### FR-6: Event Retrieval by Date
The system shall allow users to retrieve and view events for a specific calendar date.

---

### FR-7: Timeline Consistency
The system shall maintain a consistent timeline even if events are added out of order by insertion time.

---

## ⚙️ Non-Functional Requirements (NFR)

### NFR-1: Low Interaction Friction
Event logging should take no more than a few seconds and require minimal user input.

---

### NFR-2: Reliability
Once an event is successfully logged, the system shall not lose or alter it.

---

### NFR-3: Data Integrity
Event timestamps must remain immutable after creation to preserve accurate timeline reconstruction.

---

### NFR-4: Scalability (Design-Level)
The system shall be designed so that event analysis and timeline reconstruction can be moved to background processing in future phases without changing APIs.

---

### NFR-5: Performance
Retrieval of daily timelines should be optimized for recent data and complete within acceptable latency for daily use.

---

### NFR-6: Maintainability
The codebase shall maintain clear separation between:
- request handling
- business logic
- analysis logic
- persistence

---

### NFR-7: Extensibility
The system shall support future extensions such as:
- background analysis (Celery)
- caching (Redis)
- event pipelines (RabbitMQ)
- dashboards (React)
- observability (Prometheus, ELK)

without major architectural changes.

---

### NFR-8: Privacy Awareness
EchoTrace records only **explicitly user-submitted events**.  
No automatic tracking or background surveillance is performed.

---

## 🚀 Future Enhancements

- Background timeline reconstruction and analytics
- Detection of focus blocks and context switches
- Interactive timeline visualization using React
- Daily summaries generated asynchronously
- Metrics and observability for event processing

---

## 🧠 Project Philosophy

> *Understanding behavior starts with observing reality, not enforcing plans.*

EchoTrace prioritizes **clarity, correctness, and extensibility** over premature optimization or unnecessary complexity.
