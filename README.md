# SangConnect — API de gestion des dons de sang

API HTTP en Node.js pur (module `http`, sans dépendance externe).

## 1. Instructions de lancement

Prérequis : Node.js 18 ou plus récent.

```bash
node src/server.js
```

Le serveur écoute sur `http://localhost:3000`.

Options :

```bash
PORT=4000 NODE_ENV=production node src/server.js
```

## 2. Structure

```
src/
├── server.js        # serveur, table des routes, logique 404 / 405
└── utils/
    └── http.js      # sendJson(), sendMethodNotAllowed(), sendNotFound()
```

## 3. Routes et méthodes acceptées

| Route             | Méthodes acceptées | Description                                              |
|-------------------|--------------------|----------------------------------------------------------|
| `/api/welcome`    | `GET`              | Message de bienvenue                                     |
| `/api/version`    | `GET`              | Nom de l'application, version API, version Node, environnement |
| `/api/diagnostic` | `GET`              | Méthode, URL, date et en-têtes de la requête             |
| *(autre route)*   | —                  | Réponse 404 en JSON                                      |

## 4. Codes de statut utilisés

| Code | Signification        | Quand ?                                              |
|------|----------------------|------------------------------------------------------|
| 200  | OK                   | Route existante appelée avec une méthode autorisée   |
| 404  | Not Found            | Route non définie                                    |
| 405  | Method Not Allowed   | Route existante, méthode non autorisée (en-tête `Allow` ajouté) |

## 5. Commandes curl (tests)

Route existante avec `GET` :

```bash
curl -i http://localhost:3000/api/welcome
curl -i http://localhost:3000/api/version
curl -i http://localhost:3000/api/diagnostic
```

Route inexistante (404) :

```bash
curl -i http://localhost:3000/api/inconnue
```

Route existante avec méthode non autorisée (405) :

```bash
curl -i -X POST   http://localhost:3000/api/diagnostic
curl -i -X DELETE http://localhost:3000/api/welcome
```

Plusieurs routes à la suite :

```bash
curl -i http://localhost:3000/api/welcome http://localhost:3000/api/version http://localhost:3000/api/inconnue
```

### Exemples de réponses

`GET /api/welcome` → `200`

```json
{
  "message": "Bienvenue dans l’API SangConnect",
  "description": "Gestion des dons de sang"
}
```

`POST /api/diagnostic` → `405` (en-tête `Allow: GET`)

```json
{
  "error": "Méthode non autorisée",
  "message": "La méthode POST n'est pas autorisée sur /api/diagnostic. Utilisez : GET.",
  "path": "/api/diagnostic",
  "method": "POST",
  "allowedMethods": ["GET"]
}
```

`GET /api/inconnue` → `404`

```json
{
  "error": "Route non trouvée",
  "path": "/api/inconnue",
  "method": "GET",
  "timestamp": "2026-11-08T10:00:00.000Z"
}
```

## 6. Explication de `sendJson()`

```js
sendJson(res, statusCode, data, headers = {})
```

Cette fonction centralise l'envoi des réponses JSON afin d'éviter de répéter le même code dans chaque route :

1. `JSON.stringify(data, null, 2)` convertit l'objet JavaScript en texte JSON lisible.
2. `res.writeHead(statusCode, {...})` envoie le code de statut et les en-têtes :
   - `Content-Type: application/json; charset=utf-8` indique au client que le corps est du JSON (UTF-8, pour les accents) ;
   - `Content-Length` donne la taille exacte du corps en octets (`Buffer.byteLength`, car un caractère accentué fait plus d'un octet) ;
   - `headers` permet d'ajouter des en-têtes propres à un cas, par exemple `Allow` pour un 405.
3. `res.end(body)` envoie le corps et termine la réponse.

`sendMethodNotAllowed()` et `sendNotFound()` s'appuient sur `sendJson()` pour produire les réponses 405 et 404.
