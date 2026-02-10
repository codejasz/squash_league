# Squash League

Platforma do zarządzania ligą squasha z systemem rankingowym ELO. Rezerwuj korty, dopasowuj przeciwników po poziomie umiejętności, śledź wyniki i wspinaj się w rankingu.

## Stack technologiczny

- **Next.js 16** (App Router, TypeScript)
- **Prisma 6** + PostgreSQL
- **Auth.js v5** (credentials + Google OAuth)
- **Tailwind CSS 4** + shadcn/ui components
- **Zod** (walidacja), **Vitest** (testy)

## Funkcje

- Rejestracja z wyborem poziomu umiejętności (Szturmowiec / Padawan / Rycerz Jedi / Mistrz Yoda)
- Tworzenie i dołączanie do rezerwacji
- Wyszukiwanie rezerwacji po poziomie, dacie, centrum
- System wyników z potwierdzeniem obu graczy
- Ranking ELO automatycznie aktualizowany po meczu
- Profile graczy ze statystykami
- System powiadomień
- Zarządzanie centrami sportowymi

## Uruchomienie

```bash
# 1. Baza danych
docker compose up -d

# 2. Instalacja zależności
npm install

# 3. Schema → baza danych
npm run db:push

# 4. Dane testowe (5 centrów sportowych, 5 użytkowników)
npm run db:seed

# 5. Start dev server
npm run dev
```

Aplikacja dostępna pod: http://localhost:3000

Konta testowe (hasło: `Test1234`):
- jan@example.com, anna@example.com, piotr@example.com, marta@example.com, tomek@example.com

## Skrypty

| Komenda | Opis |
|---------|------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run test` | Testy jednostkowe |
| `npm run db:push` | Push schema do DB |
| `npm run db:seed` | Seed data |
| `npm run db:studio` | Prisma Studio (GUI) |
