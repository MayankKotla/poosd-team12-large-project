# ShiftFlow Mobile (COP4331 Team 12)

Flutter mobile app for the ShiftFlow work-scheduling project. Screens and navigation follow the team flow chart.

```
Login <-> Sign-up
Login  -> Shifts View
Shifts View <-> Open Shifts <-> Settings <-> Shifts View
Settings <-> My Groups <-> Group Details <-> Assign Shift (admin)
Settings -> Log out -> Login
```

## Folder structure

```
lib/
  main.dart                  app entry point
  routes/routes.dart         route names -> screens (+ goToLogin helper)
  models/                    User, Shift, Group (JSON parsing)
  screens/
    login_screen.dart
    signup_screen.dart
    shifts_view_screen.dart  my shifts, list + calendar, offer / cancel offer
    open_shifts_screen.dart  shifts coworkers offered, claim
    settings_screen.dart     profile info, My Groups link, log out
    groups_screen.dart       my groups (role badge) + create-group dialog
    group_details_screen.dart  members list; admin: Add Member, Assign Shift
    assign_shift_screen.dart   admin form: member, weekday, start / end time
  utils/
    config.dart              mock-mode switch + API base URL
    api_client.dart          http wrapper (JSON, JWT header, errors)
    auth_service.dart        login / register / forgot password / logout
    shift_service.dart       my shifts / open shifts / offer / cancel / claim
    group_service.dart       list / create groups, add member, user directory
    global_data.dart         JWT + current user for this session
    formatters.dart          date/time text
  widgets/
    main_scaffold.dart       app bar + bottom navigation for the 3 main screens
    shift_card.dart
test/models_test.dart
```

## First-time setup

This folder has the Dart code only. Generate the Android/iOS folders once:

```bash
cd shiftflow_mobile
flutter create --platforms=android,ios --project-name shiftflow_mobile --org edu.ucf.team12 .
flutter pub get
flutter run
```

`flutter create .` should leave the existing `lib/`, `test/` and `pubspec.yaml` alone, but check `git status` after running it. If it replaced `test/widget_test.dart` or `lib/main.dart`, restore ours.

## Mock mode vs. real backend

By default the app runs in **mock mode** (fake data, no network), so every screen works before the API exists. Any email containing `@` with any password will log in.

With the backend running locally (`cd backend && npm install && npm run dev`, needs a `.env` with MONGODB_URI, JWT_SECRET, API_URL, APP_URL and SMTP settings):

```bash
flutter run --dart-define=USE_MOCK=false --dart-define=API_BASE_URL=http://10.0.2.2:5000/api
```

- `10.0.2.2` is how the Android emulator reaches your computer's localhost; iOS simulator uses `localhost`.
- For a deployed server, use its URL. If it is plain `http://` (not https) on Android, add `android:usesCleartextTraffic="true"` to the `<application>` tag in `android/app/src/main/AndroidManifest.xml`, and make sure the manifest has `<uses-permission android:name="android.permission.INTERNET"/>` (the debug one is added automatically, release is not).

## Backend (branch `MERNStack`, `backend/`)

The app now matches the real Express API. Base URL is `http://<host>:5000/api` (default in `lib/utils/config.dart`).

| Method | Path | Used for |
|---|---|---|
| POST | `/auth/register` | Sign-up (sends verification email; user must verify before login) |
| POST | `/auth/login` | Login -> `{ token, user }`; 403 if email not verified |
| POST | `/auth/forgot-password` | Forgot Password link on Login |
| GET | `/shifts/mine` | Shifts View |
| GET | `/shifts/open` | Open Shifts (also `/users`, `/groups` for names) |
| POST | `/shifts/:id/release` | Offer Shift (status -> `up_for_grabs`) |
| POST | `/shifts/:id/claim` | Claim Shift |
| GET | `/groups` | My Groups |
| POST | `/groups` | Create Group (creator becomes admin) |
| POST | `/groups/:id/members` | Add Member by email (admin only) |
| GET | `/users` | Member names / emails, Open Shifts names |
| POST | `/shifts` | Assign Shift (admin only) |
| POST | `/shifts/:id/unrelease` | Cancel Offer **(does not exist yet, see below)** |

### Things the backend still needs (tell your teammates)

1. **Cancel offer.** Add to `backend/routes/shifts.js`:
   ```js
   router.post("/:id/unrelease", async (req, res) => {
     const r = await Schedule.updateOne(
       { _id: req.params.id, user: req.userId, status: "up_for_grabs" },
       { status: "assigned" });
     if (!r.matchedCount) return res.status(404).json({ error: "Shift not found or not offered" });
     res.json({ message: "Shift taken back" });
   });
   ```
   Until then "Cancel Offer" shows an error in the app.
2. **Open shifts names (optional).** `/shifts/open` returns the owner as a bare id (the app works around this with `GET /users`). Adding `.populate("user", "firstName lastName").populate("group", "groupName")` to that route would be cleaner.
3. **Shifts have no calendar date**, only `dayOfWeek` + `"HH:mm"`, so the app shows a Monday-Sunday week view instead of a month calendar.
4. **Deploy.** Mobile needs a reachable server: the emulator uses `10.0.2.2:5000` for a backend running on your PC. The verification email links to `API_URL`, which must be reachable from wherever the user opens the email.
