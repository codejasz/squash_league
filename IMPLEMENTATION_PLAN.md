# Squash League - Analiza i Plan Reimplementacji

## 1. Analiza obecnej aplikacji

### Idea aplikacji
Squash League to platforma do zarządzania ligą squasha, umożliwiająca:
- **Rezerwacje meczów** - tworzenie i dołączanie do rezerwacji na korty squasha
- **Dopasowanie umiejętności** - gracze mają poziomy (Beginner → Expert), system filtruje rezerwacje po poziomie
- **Śledzenie wyników** - rejestrowanie wyników meczów z potwierdzeniem obu graczy
- **Statystyki i ranking** - wygrane, przegrane, sety, pozycja w rankingu
- **Zarządzanie centrami sportowymi** - lokalizacje, korty, dostępność
- **System powiadomień** - wiadomości dla użytkowników

### Problemy obecnej implementacji

| Kategoria | Problem |
|-----------|---------|
| **Framework** | Django 1.11 - wersja EOL od 2020, brak wsparcia bezpieczeństwa |
| **Architektura** | Monolityczne server-side rendering, brak API REST/GraphQL |
| **Bezpieczeństwo** | Hardcoded SECRET_KEY, DEBUG=True, brak HTTPS enforcement |
| **Testy** | Zero testów - puste `tests.py` |
| **Frontend** | Bootstrap 4 + jQuery - przestarzały stack, brak reaktywności |
| **Real-time** | Brak WebSocket/SSE - powiadomienia wymagają odświeżenia strony |
| **DevOps** | Brak Docker, CI/CD, environment variables |
| **Kod** | Zakomentowany kod, nieużywane modele (Rooms, SquashCourt), dead templates |
| **i18n** | Hardcoded polski tekst w szablonach, brak infrastruktury tłumaczeń |
| **Deployment** | Brak konfiguracji produkcyjnej |

---

## 2. Rekomendowany stack technologiczny

### Porównanie rozważanych opcji

| Kryterium | Next.js (TS) | FastAPI + React | Django 5 + DRF | SvelteKit |
|-----------|:---:|:---:|:---:|:---:|
| DX (Developer Experience) | ★★★★★ | ★★★★ | ★★★★ | ★★★★★ |
| Ekosystem / biblioteki | ★★★★★ | ★★★★ | ★★★★★ | ★★★ |
| Wydajność | ★★★★★ | ★★★★★ | ★★★ | ★★★★★ |
| Type-safety | ★★★★★ | ★★★★ | ★★ | ★★★★ |
| Real-time | ★★★★ | ★★★★★ | ★★★ | ★★★★ |
| SEO (SSR) | ★★★★★ | ★★★ | ★★★★ | ★★★★★ |
| Łatwość deploymentu | ★★★★★ | ★★★★ | ★★★ | ★★★★ |
| Community / hiring | ★★★★★ | ★★★★ | ★★★★★ | ★★★ |

### Wybrana architektura: Next.js Full-Stack (TypeScript)

```
┌─────────────────────────────────────────────────────────┐
│                      FRONTEND                            │
│  Next.js 15 (App Router) + React 19 + Tailwind CSS      │
│  shadcn/ui components + React Hook Form + Zod            │
├─────────────────────────────────────────────────────────┤
│                    API LAYER                              │
│  Next.js Server Actions + Route Handlers (REST)          │
│  tRPC (optional - end-to-end type safety)                │
├─────────────────────────────────────────────────────────┤
│                   DATA LAYER                             │
│  Prisma ORM + PostgreSQL 16                              │
├─────────────────────────────────────────────────────────┤
│                  INFRASTRUKTURA                           │
│  Docker Compose + GitHub Actions CI/CD                   │
│  Vercel / Self-hosted (Node.js)                          │
└─────────────────────────────────────────────────────────┘
```

### Uzasadnienie wyboru

**Next.js 15 (App Router)** - jeden framework dla frontend + backend:
- React Server Components eliminują potrzebę osobnego API dla większości operacji
- Server Actions dla mutacji danych (formularze, akcje)
- Route Handlers dla REST API (jeśli potrzebny mobilny klient)
- Wbudowane SSR/SSG dla SEO i wydajności
- Middleware do ochrony tras i zarządzania sesją

**TypeScript** - type-safety na całym stacku:
- Wspólne typy między frontend a backend
- Automatyczna walidacja w IDE
- Refactoring bez strachu

**Prisma** - nowoczesny ORM:
- Type-safe queries generowane z schematu
- Automatyczne migracje
- Prisma Studio do zarządzania danymi (zastępuje Django Admin)
- Seed data z plików TypeScript

**Auth.js v5 (NextAuth)** - kompletna autentykacja:
- Email/password (credentials)
- Google, Facebook OAuth (realizuje brakujące TODO z README)
- Weryfikacja email
- Session management (JWT + database sessions)

**Tailwind CSS + shadcn/ui** - nowoczesny UI:
- Utility-first CSS = mniej kodu, lepsze DX
- shadcn/ui = gotowe, dostępne (a11y) komponenty
- Ciemny motyw out-of-the-box
- Responsive design by default

**Zod** - walidacja schematów:
- Wspólna walidacja na frontendzie i backendzie
- Integracja z React Hook Form
- Integracja z Prisma (zod-prisma)

---

## 3. Schemat bazy danych (Prisma)

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum SkillLevel {
  BEGINNER     // Szturmowiec
  INTERMEDIATE // Padawan
  ADVANCED     // Rycerz Jedi
  EXPERT       // Mistrz Yoda
}

enum ReservationStatus {
  OPEN       // Szuka partnera
  CONFIRMED  // Partner dołączył
  COMPLETED  // Mecz rozegrany
  CANCELLED  // Anulowana
}

enum MatchResultStatus {
  PENDING           // Oczekuje na wpisanie wyniku
  AWAITING_CONFIRM  // Jeden gracz wpisał, drugi musi potwierdzić
  CONFIRMED         // Obaj potwierdzili
  DISPUTED          // Rozbieżność wyników
}

model User {
  id             String    @id @default(cuid())
  email          String    @unique
  username       String    @unique
  passwordHash   String
  firstName      String
  lastName       String
  skillLevel     SkillLevel @default(BEGINNER)
  avatarUrl      String?
  emailVerified  DateTime?
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  // Relacje
  createdReservations  Reservation[] @relation("CreatedBy")
  joinedReservations   Reservation[] @relation("JoinedBy")
  matchResultsAsHome   MatchResult[] @relation("HomePlayer")
  matchResultsAsGuest  MatchResult[] @relation("GuestPlayer")
  stats                UserStats?
  sentMessages         Message[]     @relation("Sender")
  receivedMessages     Message[]     @relation("Receiver")
  notifications        Notification[]
  accounts             Account[]     // OAuth accounts
  sessions             Session[]     // Auth sessions

  @@index([skillLevel])
  @@index([email])
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model SportCenter {
  id           String   @id @default(cuid())
  name         String
  address      String
  city         String
  phoneNumber  String?
  website      String?
  slug         String   @unique
  imageUrl     String?
  latitude     Float?
  longitude    Float?
  createdAt    DateTime @default(now())

  courts       Court[]
  reservations Reservation[]

  @@index([city])
  @@index([slug])
}

model Court {
  id             String      @id @default(cuid())
  courtNumber    Int
  sportCenterId  String
  isActive       Boolean     @default(true)

  sportCenter    SportCenter @relation(fields: [sportCenterId], references: [id], onDelete: Cascade)
  reservations   Reservation[]

  @@unique([sportCenterId, courtNumber])
}

model Reservation {
  id           String             @id @default(cuid())
  creatorId    String
  partnerId    String?
  sportCenterId String
  courtId      String?
  date         DateTime           @db.Date
  timeStart    DateTime           @db.Time()
  timeEnd      DateTime           @db.Time()
  status       ReservationStatus  @default(OPEN)
  comment      String?
  skillLevel   SkillLevel         // Wymagany poziom partnera
  createdAt    DateTime           @default(now())
  updatedAt    DateTime           @updatedAt

  creator      User               @relation("CreatedBy", fields: [creatorId], references: [id])
  partner      User?              @relation("JoinedBy", fields: [partnerId], references: [id])
  sportCenter  SportCenter        @relation(fields: [sportCenterId], references: [id])
  court        Court?             @relation(fields: [courtId], references: [id])
  matchResult  MatchResult?

  @@index([date, status])
  @@index([skillLevel, status])
  @@index([creatorId])
  @@index([partnerId])
}

model MatchResult {
  id              String             @id @default(cuid())
  reservationId   String             @unique
  homePlayerId    String
  guestPlayerId   String
  homeSetsWon     Int                @default(0)
  guestSetsWon    Int                @default(0)
  setScores       Json?              // Np. [{home: 11, guest: 9}, {home: 7, guest: 11}, ...]
  status          MatchResultStatus  @default(PENDING)
  submittedById   String?
  createdAt       DateTime           @default(now())
  updatedAt       DateTime           @updatedAt

  reservation     Reservation        @relation(fields: [reservationId], references: [id], onDelete: Cascade)
  homePlayer      User               @relation("HomePlayer", fields: [homePlayerId], references: [id])
  guestPlayer     User               @relation("GuestPlayer", fields: [GuestPlayerId], references: [id])

  @@index([homePlayerId])
  @@index([guestPlayerId])
}

model UserStats {
  id           String  @id @default(cuid())
  userId       String  @unique
  gamesPlayed  Int     @default(0)
  gamesWon     Int     @default(0)
  gamesLost    Int     @default(0)
  setsWon      Int     @default(0)
  setsLost     Int     @default(0)
  winStreak    Int     @default(0)
  bestStreak   Int     @default(0)
  eloRating    Int     @default(1200)  // System ELO zamiast prostego rankingu
  rankPosition Int?

  user         User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([eloRating])
  @@index([rankPosition])
}

model Notification {
  id        String   @id @default(cuid())
  userId    String
  title     String
  content   String
  type      String   // "match_invite", "score_submitted", "score_confirmed", etc.
  isRead    Boolean  @default(false)
  link      String?  // Link do powiązanej rezerwacji/meczu
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, isRead])
  @@index([createdAt])
}

model Message {
  id         String   @id @default(cuid())
  senderId   String
  receiverId String
  content    String
  isRead     Boolean  @default(false)
  createdAt  DateTime @default(now())

  sender     User     @relation("Sender", fields: [senderId], references: [id])
  receiver   User     @relation("Receiver", fields: [receiverId], references: [id])

  @@index([receiverId, isRead])
  @@index([senderId])
}
```

---

## 4. Struktura projektu

```
squash-league/
├── .github/
│   └── workflows/
│       ├── ci.yml                    # Testy + lint na PR
│       └── deploy.yml                # Deploy na push do main
├── prisma/
│   ├── schema.prisma                 # Schemat bazy danych
│   ├── migrations/                   # Migracje DB
│   └── seed.ts                       # Dane początkowe
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # Root layout (providers, nav, footer)
│   │   ├── page.tsx                  # Strona główna (landing)
│   │   ├── globals.css               # Tailwind imports
│   │   ├── (auth)/                   # Grupa tras autentykacji
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   ├── forgot-password/page.tsx
│   │   │   └── verify-email/page.tsx
│   │   ├── (dashboard)/              # Grupa tras zalogowanego użytkownika
│   │   │   ├── layout.tsx            # Sidebar + nawigacja
│   │   │   ├── reservations/
│   │   │   │   ├── page.tsx          # Lista dostępnych rezerwacji
│   │   │   │   ├── new/page.tsx      # Tworzenie rezerwacji
│   │   │   │   └── [id]/page.tsx     # Szczegóły rezerwacji
│   │   │   ├── my-games/
│   │   │   │   ├── page.tsx          # Nadchodzące mecze
│   │   │   │   └── history/page.tsx  # Historia meczów
│   │   │   ├── profile/
│   │   │   │   ├── page.tsx          # Mój profil
│   │   │   │   ├── edit/page.tsx     # Edycja profilu
│   │   │   │   └── [id]/page.tsx     # Profil innego gracza
│   │   │   ├── ranking/page.tsx      # Ranking graczy (ELO)
│   │   │   ├── sport-centers/
│   │   │   │   ├── page.tsx          # Lista centrów
│   │   │   │   └── [slug]/page.tsx   # Szczegóły centrum
│   │   │   ├── messages/
│   │   │   │   ├── page.tsx          # Lista konwersacji
│   │   │   │   └── [userId]/page.tsx # Czat z graczem
│   │   │   └── notifications/page.tsx
│   │   └── api/                      # REST API (opcjonalnie)
│   │       ├── auth/[...nextauth]/route.ts
│   │       ├── reservations/route.ts
│   │       ├── users/route.ts
│   │       └── stats/route.ts
│   ├── components/
│   │   ├── ui/                       # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── form.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── table.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── calendar.tsx
│   │   │   └── ...
│   │   ├── layout/
│   │   │   ├── navbar.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── footer.tsx
│   │   │   └── mobile-nav.tsx
│   │   ├── reservations/
│   │   │   ├── reservation-card.tsx
│   │   │   ├── reservation-form.tsx
│   │   │   ├── reservation-filters.tsx
│   │   │   ├── join-button.tsx
│   │   │   └── score-form.tsx
│   │   ├── profile/
│   │   │   ├── stats-card.tsx
│   │   │   ├── skill-badge.tsx
│   │   │   ├── avatar-upload.tsx
│   │   │   └── match-history-table.tsx
│   │   ├── ranking/
│   │   │   ├── ranking-table.tsx
│   │   │   └── elo-chart.tsx
│   │   └── shared/
│   │       ├── data-table.tsx        # Reusable tabela z paginacją
│   │       ├── empty-state.tsx
│   │       ├── loading-skeleton.tsx
│   │       └── error-boundary.tsx
│   ├── lib/
│   │   ├── prisma.ts                 # Singleton Prisma client
│   │   ├── auth.ts                   # Auth.js config
│   │   ├── validators/               # Zod schemas
│   │   │   ├── reservation.ts
│   │   │   ├── user.ts
│   │   │   ├── score.ts
│   │   │   └── sport-center.ts
│   │   ├── utils.ts                  # Utility functions (cn, formatDate)
│   │   └── elo.ts                    # Algorytm ELO rating
│   ├── actions/                      # Server Actions
│   │   ├── reservations.ts           # CRUD rezerwacji
│   │   ├── auth.ts                   # Rejestracja, weryfikacja
│   │   ├── scores.ts                 # Wyniki meczów
│   │   ├── profile.ts                # Aktualizacja profilu
│   │   └── messages.ts               # Wysyłanie wiadomości
│   ├── hooks/                        # Custom React hooks
│   │   ├── use-notifications.ts
│   │   ├── use-reservation-filters.ts
│   │   └── use-debounce.ts
│   └── types/                        # Wspólne typy TypeScript
│       └── index.ts
├── public/
│   ├── images/
│   └── icons/
├── tests/
│   ├── unit/
│   │   ├── elo.test.ts
│   │   ├── validators.test.ts
│   │   └── utils.test.ts
│   ├── integration/
│   │   ├── reservations.test.ts
│   │   ├── auth.test.ts
│   │   └── scores.test.ts
│   └── e2e/
│       ├── reservation-flow.spec.ts
│       ├── auth-flow.spec.ts
│       └── score-flow.spec.ts
├── docker-compose.yml
├── Dockerfile
├── .env.example
├── .env.local                        # Lokalne zmienne (gitignored)
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 5. Kluczowe ulepszenia vs obecna wersja

### 5.1 System rankingowy ELO (nowy)
Zamiast prostego "ranking" (integer), implementacja algorytmu ELO:

```typescript
// lib/elo.ts
const K_FACTOR = 32;

export function calculateElo(
  winnerRating: number,
  loserRating: number
): { newWinnerRating: number; newLoserRating: number } {
  const expectedWinner = 1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));
  const expectedLoser = 1 / (1 + Math.pow(10, (winnerRating - loserRating) / 400));

  return {
    newWinnerRating: Math.round(winnerRating + K_FACTOR * (1 - expectedWinner)),
    newLoserRating: Math.round(loserRating + K_FACTOR * (0 - expectedLoser)),
  };
}
```

### 5.2 System potwierdzenia wyników (ulepszony)
Obecny flow jest niekompletny. Nowy flow:

```
Gracz A wpisuje wynik → Status: AWAITING_CONFIRM
    → Notyfikacja do Gracza B
Gracz B potwierdza → Status: CONFIRMED
    → Aktualizacja UserStats + ELO
    → Notyfikacja do obu graczy
Gracz B kwestionuje → Status: DISPUTED
    → Gracz A może poprawić wynik
```

### 5.3 Real-time powiadomienia
- Server-Sent Events (SSE) dla powiadomień push
- Polling fallback dla starszych przeglądarek
- Toast notifications w UI

### 5.4 Wiadomości bezpośrednie (ulepszony)
- Pełny czat między graczami
- Historia konwersacji
- Wskaźnik nieprzeczytanych wiadomości w nawigacji

### 5.5 Zaawansowane wyszukiwanie rezerwacji
- Filtry: data, lokalizacja, poziom umiejętności, pora dnia
- Sortowanie: data, odległość, ELO przeciwnika
- Paginacja server-side
- URL state (parametry w URL = shareable filters)

### 5.6 Responsywny dashboard
- Sidebar z nawigacją (desktop) / bottom nav (mobile)
- Ciemny/jasny motyw
- Widgety: nadchodzące mecze, statystyki, ranking

---

## 6. Plan implementacji - fazy

### Faza 1: Fundament (tydzień 1-2)
**Cel:** Działający projekt z autentykacją i podstawowymi stronami

| # | Zadanie | Priorytet |
|---|---------|-----------|
| 1.1 | Inicjalizacja Next.js 15 + TypeScript + Tailwind | KRYTYCZNY |
| 1.2 | Konfiguracja Prisma + PostgreSQL (Docker Compose) | KRYTYCZNY |
| 1.3 | Schema Prisma - wszystkie modele + migracje | KRYTYCZNY |
| 1.4 | Auth.js v5 - email/password + Google OAuth | KRYTYCZNY |
| 1.5 | Rejestracja z wyborem poziomu umiejętności | KRYTYCZNY |
| 1.6 | Layout: navbar, sidebar, footer (shadcn/ui) | KRYTYCZNY |
| 1.7 | Strona główna (landing page) | ŚREDNI |
| 1.8 | Seed data - centra sportowe, testowi użytkownicy | ŚREDNI |

### Faza 2: Core - Rezerwacje (tydzień 3-4)
**Cel:** Pełen cykl rezerwacji: tworzenie → wyszukiwanie → dołączanie

| # | Zadanie | Priorytet |
|---|---------|-----------|
| 2.1 | Formularz tworzenia rezerwacji (React Hook Form + Zod) | KRYTYCZNY |
| 2.2 | Server Action: createReservation | KRYTYCZNY |
| 2.3 | Lista rezerwacji z filtrami i paginacją | KRYTYCZNY |
| 2.4 | Strona szczegółów rezerwacji | KRYTYCZNY |
| 2.5 | Funkcja dołączania do rezerwacji | KRYTYCZNY |
| 2.6 | Moje rezerwacje - nadchodzące mecze | KRYTYCZNY |
| 2.7 | Anulowanie rezerwacji | ŚREDNI |
| 2.8 | Walidacja dat/godzin (nie w przeszłości, godziny pracy) | ŚREDNI |

### Faza 3: Wyniki i ranking (tydzień 5-6)
**Cel:** Pełny system wyników z ELO

| # | Zadanie | Priorytet |
|---|---------|-----------|
| 3.1 | Formularz wpisywania wyników | KRYTYCZNY |
| 3.2 | Flow potwierdzenia wyników (obie strony) | KRYTYCZNY |
| 3.3 | Automatyczna aktualizacja UserStats po potwierdzeniu | KRYTYCZNY |
| 3.4 | Algorytm ELO - implementacja + testy | KRYTYCZNY |
| 3.5 | Strona rankingu (tabela z paginacją, sortowanie) | ŚREDNI |
| 3.6 | Historia meczów z wynikami | ŚREDNI |
| 3.7 | Wykres ELO gracza (trend) | NISKI |

### Faza 4: Profile i społeczność (tydzień 7)
**Cel:** Kompletne profile, wiadomości, powiadomienia

| # | Zadanie | Priorytet |
|---|---------|-----------|
| 4.1 | Strona profilu (statystyki, ostatnie mecze, ELO) | KRYTYCZNY |
| 4.2 | Edycja profilu (avatar upload do S3/local) | ŚREDNI |
| 4.3 | System powiadomień (DB + SSE) | ŚREDNI |
| 4.4 | Wiadomości bezpośrednie między graczami | NISKI |
| 4.5 | Strona centrum sportowego (szczegóły + mapa) | NISKI |

### Faza 5: Jakość i deployment (tydzień 8)
**Cel:** Testy, CI/CD, produkcja

| # | Zadanie | Priorytet |
|---|---------|-----------|
| 5.1 | Testy jednostkowe (Vitest) - ELO, walidatory, utils | KRYTYCZNY |
| 5.2 | Testy integracyjne - Server Actions + Prisma | KRYTYCZNY |
| 5.3 | Testy E2E (Playwright) - główne flow | ŚREDNI |
| 5.4 | Dockerfile + docker-compose (dev + prod) | KRYTYCZNY |
| 5.5 | GitHub Actions CI/CD | ŚREDNI |
| 5.6 | Zmienne środowiskowe - .env.example | KRYTYCZNY |
| 5.7 | README z instrukcjami uruchomienia | ŚREDNI |

---

## 7. Kluczowe decyzje architektoniczne

### 7.1 Server Actions vs API Routes
- **Server Actions** (primary) - dla wszystkich mutacji danych z formularzy
- **API Routes** (secondary) - tylko jeśli potrzebny REST API dla klienta mobilnego

### 7.2 State management
- **React Server Components** - domyślnie server-side data fetching
- **nuqs** - URL state management dla filtrów
- Bez globalnego state managera (Redux/Zustand) - niepotrzebny przy RSC

### 7.3 Walidacja
- **Zod schemas** współdzielone między frontend (React Hook Form) i backend (Server Actions)
- Jedna definicja = jedna prawda

### 7.4 Autentykacja
- **Auth.js v5** z Prisma Adapter
- Middleware do ochrony tras `/dashboard/*`
- RBAC: user / admin role

### 7.5 Baza danych
- **PostgreSQL 16** w Docker
- **Prisma** z automatycznymi migracjami
- Indeksy na kolumnach używanych w filtrach/sortowaniu

### 7.6 Obsługa plików (avatary)
- Lokalne przechowywanie w `/public/uploads/` (dev)
- S3-compatible storage (prod) - via `@aws-sdk/client-s3`

---

## 8. Zależności (package.json)

```json
{
  "dependencies": {
    "next": "^15.1",
    "react": "^19.0",
    "react-dom": "^19.0",
    "@prisma/client": "^6.0",
    "next-auth": "^5.0",
    "@auth/prisma-adapter": "^2.0",
    "zod": "^3.23",
    "react-hook-form": "^7.54",
    "@hookform/resolvers": "^3.9",
    "tailwindcss": "^4.0",
    "@radix-ui/react-*": "latest",
    "class-variance-authority": "^0.7",
    "clsx": "^2.1",
    "tailwind-merge": "^2.6",
    "lucide-react": "^0.468",
    "bcryptjs": "^2.4",
    "date-fns": "^4.1",
    "nuqs": "^2.2"
  },
  "devDependencies": {
    "typescript": "^5.7",
    "prisma": "^6.0",
    "vitest": "^2.1",
    "@testing-library/react": "^16.1",
    "playwright": "^1.49",
    "eslint": "^9.0",
    "prettier": "^3.4",
    "@types/node": "^22",
    "@types/react": "^19"
  }
}
```

---

## 9. Docker Compose (development)

```yaml
# docker-compose.yml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: squash_league
      POSTGRES_USER: squash
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://squash:${DB_PASSWORD}@db:5432/squash_league
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
      NEXTAUTH_URL: http://localhost:3000
    depends_on:
      - db
    volumes:
      - .:/app
      - /app/node_modules

volumes:
  postgres_data:
```

---

## 10. Migracja danych

Obecne dane z Django (db.json) można zmigrować skryptem:

```typescript
// prisma/migrate-from-django.ts
// 1. Wczytaj db.json
// 2. Mapuj modele Django → Prisma
// 3. Transformuj pola (np. skill 1-4 → enum SkillLevel)
// 4. Wstaw dane przez Prisma client
// 5. Przelicz statystyki i ELO na podstawie historii meczów
```

---

## Podsumowanie

| Aspekt | Obecna wersja | Nowa wersja |
|--------|:---:|:---:|
| Framework | Django 1.11 (EOL) | Next.js 15 |
| Język | Python 3 | TypeScript |
| Frontend | jQuery + Bootstrap 4 | React 19 + Tailwind + shadcn/ui |
| ORM | Django ORM | Prisma |
| Auth | Django Auth | Auth.js v5 (+ OAuth) |
| Ranking | Prosty integer | Algorytm ELO |
| Testy | 0 | Unit + Integration + E2E |
| DevOps | Brak | Docker + GitHub Actions |
| Real-time | Brak | SSE notifications |
| Type-safety | Brak | Full-stack TypeScript + Zod |
| API | Brak (SSR only) | Server Actions + REST ready |
