function sanitizeHeaders(headers = {}) {
  return Object.fromEntries(
    Object.entries(headers).map(([key, value]) => {
      const normalizedKey = key.toLowerCase();

      if (normalizedKey === 'authorization' || normalizedKey === 'cookie') {
        return [key, '[REDACTED]'];
      }

      return [key, value];
    })
  );
}

function parseBody(rawBody) {
  if (!rawBody) {
    return null;
  }

  try {
    return JSON.parse(rawBody);
  } catch {
    return rawBody;
  }
}

function buildResponseBodyLog(statusCode, rawBody) {
  if (statusCode === 304) {
    return {
      note: '304 Not Modified — el body no viaja en la red; el navegador usa su cache local (ETag/If-None-Match).',
      bodyFromWire: null
    };
  }

  return parseBody(rawBody);
}

module.exports = {
  sanitizeHeaders,
  parseBody,
  buildResponseBodyLog
};
