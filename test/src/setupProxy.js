// Spring Boot 백엔드 서버와 연결
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // /api 경로의 모든 요청을 백엔드 서버(localhost:8080)로 프록시
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:8080', // Spring Boot 백엔드 서버
      changeOrigin: true,
    })
  );
};

