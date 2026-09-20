# Nextify

Nextify is a Next.js application built to demonstrate state management
using Zustand, form handling with Formik, and form validation with Yup.

## 🚀 Tech Stack

- Next.js
- React
- TypeScript
- Zustand
- Formik
- Yup
- Tailwind CSS
- Lucide React

## 📁 Project Structure

```text
app/
├── page.tsx
├── login/
│   └── page.tsx
└── dashboard/
    └── page.tsx

components/
├── ui/
└── Navbar.tsx

store/
└── auth.ts

types/
└── user.ts
```

## Docker

The application requires the server-side values in `.env` at runtime. Do not
put `JWT_SECRET` or other credentials in the Dockerfile or bake them into the
image.

Start the application with Docker Compose:

```bash
docker compose up -d --build
```

For an existing image, pass the environment file when starting the container:

```bash
docker run -d --name nextify --env-file .env -p 3000:3000 nextify_app
```
