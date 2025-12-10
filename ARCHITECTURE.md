# LGPD Guardian - SaaS Architecture & Project Structure

## 1. High-Level Architecture
The platform is designed as a **Multi-tenant SaaS** where data isolation is the highest priority. We utilize a "Shared Database, Separate Schema Logic" approach where all tables (except global configs) have a `tenant_id` Foreign Key.

### Tech Stack
*   **Frontend:** React 19, TypeScript, TailwindCSS, Lucide Icons, Recharts.
*   **AI Layer:** Google Gemini 2.5 Flash (via `@google/genai`) for document generation and incident analysis.
*   **Backend (Planned):** Python (FastAPI/Django) or Node.js (NestJS).
*   **Database:** PostgreSQL 14+ (Relational, ACID compliant).
*   **Auth:** OAuth 2.0 (Google) + Custom RBAC.

## 2. Project Folder Structure

```
/
├── backend/                # [Planned] API Source Code
│   ├── app/
│   │   ├── main.py         # Entry point
│   │   ├── api/            # Route controllers
│   │   ├── core/           # Config, Security, Middleware
│   │   ├── models/         # SQLAlcemy/Prisma models
│   │   ├── schemas/        # Pydantic/Zod schemas
│   │   └── services/       # Business logic (ROPA, Incidents)
│   └── Dockerfile
│
├── frontend/               # Current React Application
│   ├── src/
│   │   ├── components/     # Reusable UI components (Layout, Cards, Forms)
│   │   ├── pages/          # Page views (Dashboard, RopaManager, etc.)
│   │   ├── services/       # API clients (Gemini, Backend fetchers)
│   │   ├── types.ts        # Shared TypeScript interfaces
│   │   ├── constants.ts    # Global constants
│   │   └── App.tsx         # Main Router
│   ├── index.html
│   └── metadata.json
│
├── database/
│   ├── schema.sql          # DDL for PostgreSQL
│   └── seeds.sql           # Initial seed data for dev
│
└── docs/
    └── architecture.md     # This file
```

## 3. Database Schema (ER Diagram)

The following diagram represents the PostgreSQL schema defined in `schema.sql`.

```mermaid
erDiagram
    TENANT ||--o{ USER : "has members"
    TENANT ||--o{ ROPA_ENTRY : "owns"
    TENANT ||--o{ INCIDENT : "tracks"
    TENANT ||--o{ DSAR_REQUEST : "receives"
    TENANT ||--o{ DOCUMENT : "stores"
    TENANT ||--o{ VENDOR : "contracts"
    TENANT ||--o{ AWARENESS_POST : "publishes"

    TENANT {
        uuid id PK
        string cnpj UK
        string name
        string plan_status
        jsonb settings
    }

    USER {
        uuid id PK
        uuid tenant_id FK
        string email UK
        string role "Enum: admin, dpo, user"
    }

    ROPA_ENTRY {
        uuid id PK
        uuid tenant_id FK
        string process_name
        string department
        string[] data_types
        string legal_basis
    }

    INCIDENT {
        uuid id PK
        uuid tenant_id FK
        string title
        enum severity
        enum status
        text analysis_report
    }

    DSAR_REQUEST {
        uuid id PK
        uuid tenant_id FK
        string protocol_number
        string subject_email
        enum status
        timestamp deadline
    }

    DOCUMENT {
        uuid id PK
        uuid tenant_id FK
        string title
        text content
        enum type
    }
```

## 4. Security & Compliance Strategy
*   **Isolation:** Every SQL query in the backend MUST include `WHERE tenant_id = :current_user_tenant_id`.
*   **Audit Logging:** Critical actions (deleting ROPA, changing Incident status) will be logged to a separate `audit_logs` table (future implementation).
*   **Encryption:** Sensitive columns (like `subject_email` in DSAR) should be encrypted at rest using pgcrypto or application-level encryption.
