/**
 * App
 * @param {import('fastify').FastifyInstance} fastify
 */
module.exports = async function app(fastify, opts) {
  await fastify.register(require('@fastify/cors'), {
    origin: true // Allows all origins in development
  });
  
  fastify.register(require('./router.js'));
}