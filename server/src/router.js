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
    handler: MainController.getRandomVerse,
    schema: {
      querystring: {
        type: 'object',
        properties: {
          min: { type: 'integer', nullable: true, default: 1 },
          max: { type: 'integer', nullable: true, default: 1189 },
          bibleName: { type: 'string', default: 'RUS_SYNODAL' }
        }
      }
    },
  });
  fastify.get('/book-mapping', {
    handler: MainController.getBookMapping,
    schema: {
      querystring: {
        type: 'object',
        properties: {
          bibleName: { type: 'string', default: 'RUS_SYNODAL' }
        }
      }
    },
  });
  fastify.get('/verse/by', {
    handler: MainController.getVerse,
    schema: {
      querystring: {
        type: 'object',
        properties: {
          book: { type: 'string' },
          chapter: { type: 'integer' },
          verseNum: { type: 'integer' },
          bibleName: { type: 'string', default: 'RUS_SYNODAL' }
        },
        required: ['book', 'chapter', 'verseNum']
      }
    },
  });
}
module.exports = mainRoutes;
