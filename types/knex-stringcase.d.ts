declare module 'knex-stringcase' {
  import type { Knex } from 'knex';
  export default function knexStringcase(config?: Knex.Config): Knex.Config;
}
