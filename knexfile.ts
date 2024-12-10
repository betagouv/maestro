// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
export default {

  client: 'pg',
  migrations: {
    extension: 'ts',
    loadExtensions: ['.ts'],
  },seeds: {
    directory: 'database/seeds/test',
    extension: 'ts',
  },

};
