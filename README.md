
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
