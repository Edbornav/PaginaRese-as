# Entertainment Reviews

Plataforma de reseñas de entretenimiento (películas, series, animes, música y videojuegos).
Desarrollada con C# (.NET 8), MongoDB 8 (Atlas) y frontend en HTML/CSS/JS vanilla.

## Entidades y relación
- **catalog_items**: ítems del catálogo (videojuegos, películas, series, animes, música)
- **reviews**: reseñas de usuarios vinculadas a un ítem
- **Relación**: Referencia por ObjectId. Se eligió referencia porque las reseñas
  tienen ciclo de vida independiente y necesitamos consultas eficientes por ítem y por usuario.

## Versión de MongoDB
MongoDB 8.x (verificado en Atlas — captura en `/docs/atlas-version.png`)

> ⚠️ Nota: MongoDB Atlas en su capa gratuita M0 actualmente solo permite MongoDB 8.
> El proyecto del curso indica versión 7, pero Atlas ya no la ofrece en nuevos clusters.
> Se usa MongoDB 8, que es totalmente compatible con todas las operaciones requeridas.

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Base de datos | MongoDB 8 (Atlas, cluster M0 gratuito) |
| Backend | C# (.NET 8) |
| Autenticación | JWT (JSON Web Tokens) |
| ODM | MongoDB.Driver |
| Frontend | HTML, CSS y JavaScript vanilla |
| Repositorio | GitHub público |

## Cómo correr el seed

### Opción 1: Node.js
```bash
npm install mongodb bcryptjs dotenv
MONGODB_URI=mongodb+srv://usuario:pass@cluster.mongodb.net/entertainment_reviews node seed.js
```

### Opción 2: C#
```bash
dotnet run --project EntertainmentReviews.Seed
```

## Usuario demo
- **Email:** demo@demo.com
- **Password:** Demo1234
- **Rol:** admin

## Estructura del proyecto

```
ENTERTAINMENT_REVIEWS_FRONT/    → Frontend HTML/CSS/JS
EntertainmentReviews.API/       → Backend .NET 8
seed.js                         → Script de seed para MongoDB
docs/                           → Capturas de pantalla
```

## Endpoints principales

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/api/auth/register` | No | Registrar usuario |
| POST | `/api/auth/login` | No | Iniciar sesión |
| GET | `/api/catalog` | No | Listar catálogo |
| GET | `/api/catalog/{id}` | No | Detalle de ítem |
| POST | `/api/catalog/{id}/reviews` | Sí | Crear reseña |
| GET | `/api/catalog/{id}/reviews` | No | Ver reseñas |
| POST | `/api/requests` | Sí | Solicitar ítem |
| PUT | `/api/requests/{id}/approve` | Admin | Aprobar solicitud |
