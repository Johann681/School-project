# Greater Access Private Schools LMS

This repository contains the React/Vite school portal and its Express/MongoDB API.

## Legacy enrolled-student admin

The legacy admin login is separate from the LMS admin account system. It uses the `Admin` collection and stores its token as `adminToken`. Its dashboard only reads enrollment records from the `Student` collection.

1. Set `MONGO_URI`, `JWT_SECRET`, `LEGACY_ADMIN_USERNAME`, and `LEGACY_ADMIN_PASSWORD` in `backend/.env`. Use a legacy admin password of at least 12 characters.
2. From `backend`, run `npm run create:legacy-admin` once to create the separate account.
3. Start the backend and frontend as usual.
4. Open `/legacy-admin-login` to sign in. The student-only dashboard is at `/legacy-admin`.

The current LMS admin remains available at `/admin-login` and is not used by this legacy dashboard.
