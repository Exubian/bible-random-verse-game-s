const MainController = require('./MainController');

/**
 * Main routes
 * @param {import('fastify').FastifyInstance} fastify
 */
async function mainRoutes(fastify, opts) {
  fastify.get('/', async (req, reply) => {
    reply.send({ hello: 'world' });
  });
  fastify.get('/bible', {
    handler: MainController.getBible
  });
  fastify.get('/verse', {
    handler: MainController.getRandomVerse
  });
}
module.exports = mainRoutes;
