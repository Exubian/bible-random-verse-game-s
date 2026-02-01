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
    const { min, max, bibleName } = req.query;
    reply.send(GameService.getRandomVerse({ min, max, bibleName }));
  }

  async getBookMapping(req, reply) {
    reply.send(GameService.getBookMapping(req.query.bibleName));
  }

  async getVerse(req, reply) {
    const { book, chapter, verseNum, bibleName } = req.query;
    reply.send(GameService.getVerse({ book, chapter, verseNum, bibleName }));
  }
}
module.exports = new MainController();
