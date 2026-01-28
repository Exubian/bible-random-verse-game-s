const GameService = require('./GameService');

/**
 * Controller
 */
class MainController {
  /**
   * 
   * @param {import('fastify').FastifyInstance} fastify
   */
  constructor(fastify, opts) {
    this.fastify = fastify;
    this.opts = opts;
  }

  async getBible(req, reply) {
    reply.send(require('../assets/bible_data/parsed-structured-bible.json'));
  }
  
  async getRandomVerse(req, reply) {
    reply.send(GameService.getRandomVerse({ bibleName: req.query.bibleName }));
  }

  async getBookMapping(req, reply) {
    reply.send(GameService.getBookMapping(req.query.bibleName));
  }
}
module.exports = new MainController();
