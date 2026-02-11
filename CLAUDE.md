# CLAUDE.md - AI Assistant Guide for squash_league

## Project Overview

Squash league web application for managing squash court reservations and player matchmaking. Users can register, create/join reservations, track game scores, view statistics and rankings, and message other players. The UI is in **Polish**.

## Tech Stack

- **Backend**: Django 1.11.14 (Python)
- **Database**: PostgreSQL (`lets_play_db`, user: `postgres`)
- **Frontend**: Bootstrap 4.0.0, jQuery 3.3.1, HTML templates
- **Image handling**: Pillow 3.1.2
- **Build tools**: Gulp (frontend assets), npm (frontend deps)

## Repository Structure

```
squash_league/
├── CLAUDE.md
├── README.md
├── LICENSE
├── .gitignore
└── lets_play/                      # Django project root (run commands from here)
    ├── manage.py                   # Django management entry point
    ├── db.json                     # Database fixture data
    ├── requirements.txt            # Python dependencies (pip)
    ├── lets_play/                  # Django project settings package
    │   ├── settings.py             # Configuration (DB, auth, static files)
    │   ├── urls.py                 # Root URL routing
    │   └── wsgi.py                 # WSGI entry point
    └── lets_play_app/              # Main application
        ├── models.py               # Data models (8 models)
        ├── views.py                # Class-based views (13 views)
        ├── forms.py                # Django forms (6 forms)
        ├── admin.py                # Admin registrations
        ├── tests.py                # Tests (currently empty)
        ├── migrations/             # Database migrations (8 files)
        ├── templates/              # HTML templates (~26 files)
        │   ├── base.html           # Base layout template
        │   ├── snippets/           # Reusable template fragments
        │   └── registration/       # Password reset flow templates
        ├── static/                 # CSS, JS, vendor assets
        │   ├── package.json        # Frontend dependencies
        │   └── gulpfile.js         # Gulp build config
        └── media/                  # User-uploaded files (avatars)
```

## Key Commands

All Django commands run from `lets_play/` directory:

```bash
cd lets_play

# Install dependencies
pip install -r requirements.txt

# Run development server
python manage.py runserver

# Run tests
python manage.py test
python manage.py test lets_play_app      # App-specific tests

# Database operations
python manage.py makemigrations
python manage.py migrate
python manage.py loaddata db.json        # Load fixture data

# Create superuser
python manage.py createsuperuser

# Frontend (from lets_play/lets_play_app/static/)
npm install
gulp                                     # Run gulp tasks
```

## Data Models (`lets_play_app/models.py`)

| Model | Purpose |
|-------|---------|
| `MyUser` | Custom user extending `AbstractUser`; adds `skill` (1-4 level) and `avatar` |
| `SportCenter` | Squash facility with name, address, phone, URL, slug |
| `Rooms` | Court rooms linked to a SportCenter |
| `SquashCourt` | Squash court linked to a SportCenter |
| `Reservation` | Game reservation with two users, date/time, location |
| `Score` | One-to-one with Reservation; stores set scores and confirmation flags |
| `UserStats` | Per-user stats: games played/won/lost, sets won/lost, ranking |
| `Messages` | User-to-user messages with timestamp |

Skill levels are defined as `SKILLS` tuple: 1=Szturmowiec, 2=Padawan, 3=Rycerz Jedi, 4=Mistrz Joda.

Custom manager `ScoreManager` on `UserStats` provides `add_winner_stats()` and `add_looser_stats()`.

## URL Routes (`lets_play/urls.py`)

| URL Pattern | View | Auth Required |
|-------------|------|---------------|
| `/` | `HomeView` | No |
| `/signup/` | `SignUpView` | No |
| `/login/` | Django auth login | No |
| `/logout/` | Django auth logout | No |
| `/profile/<user_id>` | `ShowProfileView` | No |
| `/create_reservation/` | `CreateReservationView` | Yes |
| `/sport_centres/` | `SportCenterListView` | No |
| `/sport_center/<slug>` | `SportCenterDetailView` | No |
| `/reservations_list/` | `JoinRoomView` | Yes |
| `/reservations_list/<room_id>` | `ReservationDetailView` | No |
| `/delete_room/<room_id>` | `DeleteRoom` | No |
| `/user_reservations/` | `UserReservationsView` | No |
| `/user_history/` | `UserHistoryView` | No |
| `/user_games/` | `UserFutureGamesView` | No |
| `/edit_profile/` | `EditProfileView` | No |
| `/messages/` | `MessagesView` | No |
| `/password_reset/...` | Django password reset flow | No |

## Architecture & Conventions

### Views
- All views are **class-based** using `django.views.View` with `get()`/`post()` methods.
- Login-protected views use `LoginRequiredMixin`.
- Views return `render()` with templates or `redirect()`.

### Forms
- Forms extend `forms.ModelForm` or `forms.Form`.
- Custom widgets `DateInput` and `TimeInput` use HTML5 input types.
- Form labels are in **Polish**.

### Templates
- `base.html` is the root layout; other templates extend it.
- Reusable components live in `templates/snippets/`.
- Registration templates are in `templates/registration/`.

### Database
- PostgreSQL is required. Config is hardcoded in `settings.py`.
- Custom user model: `AUTH_USER_MODEL = 'lets_play_app.MyUser'`.
- Migrations are in `lets_play_app/migrations/`.

### Localization
- Language is set to Polish (`LANGUAGE_CODE = 'pl'`).
- All user-facing labels, messages, and verbose names are in Polish.

## Configuration Notes

- `DEBUG = True` is hardcoded in settings.
- `SECRET_KEY` is hardcoded in settings (not environment-variable based).
- Database credentials are hardcoded in `settings.py`.
- `ALLOWED_HOSTS` is set to `['127.0.0.1']`.
- Email backend uses console output (`django.core.mail.backends.console.EmailBackend`).
- Static files served from `lets_play/lets_play/static/` (via `STATIC_ROOT`).
- Media files served from `lets_play/lets_play_app/media/`.

## Testing

- Test framework: Django `TestCase` (in `lets_play_app/tests.py`).
- Currently **no tests are written** - the file contains only the import.
- Run with: `python manage.py test` from `lets_play/` directory.

## What's Missing (No CI/CD, No Linting)

- No CI/CD pipeline configuration.
- No Docker support.
- No linting or formatting tools configured.
- No `.env` file for secrets management.
- No pre-commit hooks.
