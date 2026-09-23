# Lion Hub — Frontend Angular

Consume el backend NestJS vía `/api` (proxy en `ng serve`, nginx en Docker).

## Arranque local

1. Backend + MariaDB corriendo (`docker compose up db` + back en `:8080`).
2. En esta carpeta:

```bash
cp .env.example .env
npm install
npm start
```

Abrir http://localhost:4200 — login `admin` / `admin`.

## Docker

Desde la raíz: `docker compose up --build` — front en http://localhost:4200.
