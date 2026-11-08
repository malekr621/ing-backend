'use strict';

/**
 * Envoie une réponse JSON.
 *
 * @param {import('http').ServerResponse} res  Objet réponse de Node.js
 * @param {number} statusCode                  Code HTTP (200, 404, 405...)
 * @param {object} data                        Données à sérialiser en JSON
 * @param {object} [headers]                   En-têtes supplémentaires (ex. Allow)
 */
function sendJson(res, statusCode, data, headers = {}) {
  const body = JSON.stringify(data, null, 2);

  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    ...headers,
  });
  res.end(body);
}

/**
 * Réponse 405 : la route existe mais la méthode n'est pas autorisée.
 */
function sendMethodNotAllowed(req, res, pathname, allowedMethods) {
  sendJson(
    res,
    405,
    {
      error: 'Méthode non autorisée',
      message: `La méthode ${req.method} n'est pas autorisée sur ${pathname}. Utilisez : ${allowedMethods.join(', ')}.`,
      path: pathname,
      method: req.method,
      allowedMethods,
    },
    { Allow: allowedMethods.join(', ') }
  );
}

/**
 * Réponse 404 : route non définie.
 */
function sendNotFound(req, res, pathname) {
  sendJson(res, 404, {
    error: 'Route non trouvée',
    path: pathname,
    method: req.method,
    timestamp: new Date().toISOString(),
  });
}

module.exports = { sendJson, sendMethodNotAllowed, sendNotFound };
