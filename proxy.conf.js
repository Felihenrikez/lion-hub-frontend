const { logger } = require('./logger/winston.config.cjs');
const { sanitizeHeaders } = require('./logger/proxy-logging.cjs');

const hubApiUrl = process.env.API_URL || 'http://localhost:8080';
const catalogApiUrl = process.env.IS_GOB_API_URL || 'http://localhost:8090';

function createProxy(target, pathRewrite) {
  let backendConnected = false;

  return {
    target,
    secure: false,
    changeOrigin: true,
    ...(pathRewrite ? { pathRewrite } : {}),
    configure: (proxy) => {
      proxy.on('proxyReq', (proxyReq, req) => {
        req._proxyStartedAt = Date.now();

        logger.info('← Incoming request', {
          type: 'request',
          method: req.method,
          url: req.url,
          query: req.query ?? {},
          params: req.params ?? {},
          headers: sanitizeHeaders(req.headers),
          ip: req.socket?.remoteAddress ?? null,
          target: `${target}${req.url}`
        });
      });

      proxy.on('proxyRes', (proxyRes, req) => {
        const statusCode = proxyRes.statusCode;
        const isCached = statusCode === 304;

        if (!backendConnected && statusCode > 0) {
          backendConnected = true;
          logger.info('Backend conectado exitosamente', {
            target,
            statusCode,
            url: req.url
          });
        }

        logger.info('→ Outgoing response', {
          type: 'response',
          method: req.method,
          url: req.url,
          statusCode,
          durationMs: Date.now() - (req._proxyStartedAt ?? Date.now()),
          headers: {
            etag: proxyRes.headers['etag'] ?? null,
            'cache-control': proxyRes.headers['cache-control'] ?? null
          },
          ...(isCached
            ? {
                body: {
                  note: '304 Not Modified — sin body en la respuesta HTTP (cache por ETag).'
                }
              }
            : {})
        });
      });

      proxy.on('error', (err, req) => {
        logger.error('Proxy Error', {
          type: 'error',
          method: req.method,
          url: req.url,
          target,
          message: err.message
        });
      });
    }
  };
}

module.exports = {
  '/is-gob': createProxy(catalogApiUrl, { '^/is-gob': '/api' }),
  '/api': createProxy(hubApiUrl)
};
