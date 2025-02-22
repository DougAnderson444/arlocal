import { Knex } from 'knex';

export async function up(knex: Knex) {
  const indices = JSON.parse(process.env.INDICES || '[]');

  await knex.schema
    .dropTableIfExists('transactions')
    .dropTableIfExists('blocks')
    .dropTableIfExists('tags')
    .dropTableIfExists('wallets')
    .dropTableIfExists('chunks');

  return knex.schema
    .createTable('transactions', (table) => {
      table.string('id', 64).notNullable();
      table.text('owner');
      table.jsonb('tags');
      table.string('target', 64);
      table.text('quantity');
      table.text('reward');
      table.text('signature');
      table.text('last_tx');
      table.bigInteger('data_size');
      table.string('content_type');
      table.integer('format', 2);
      table.integer('height', 4);
      table.string('owner_address');
      table.string('data_root', 64);
      table.string('parent', 64);
      table.string('block', 64).defaultTo('');
      table.timestamp('created_at').defaultTo(new Date().toISOString());

      for (const index of indices) {
        table.string(index, 64);
        table.index(index, `index_${index}_transactions`, 'HASH');
      }

      table.primary(['id'], 'pkey_transactions');
      table.index(['height'], 'transactions_height', 'HASH');
      table.index(['owner_address'], 'transactions_owner_address', 'HASH');
      table.index(['target'], 'transactions_target', 'HASH');
    })
    .createTable('blocks', (table) => {
      table.string('id', 64).notNullable();
      table.integer('height', 4).notNullable();
      table.timestamp('mined_at').notNullable();
      table.string('previous_block').notNullable();
      table.jsonb('txs').notNullable();
      table.jsonb('extended');
      table.timestamp('created_at').defaultTo(knex.fn.now());

      table.primary(['id'], 'pkey_blocks');
      table.index(['height'], 'blocks_height', 'HASH');
    })
    .createTable('tags', (table) => {
      table.string('tx_id', 64).notNullable();
      table.integer('index').notNullable();
      table.text('name');
      table.text('value');
      table.timestamp('created_at').defaultTo(knex.fn.now());

      table.primary(['tx_id', 'index'], 'pkey_tags');
      table.index(['tx_id', 'name'], 'tags_tx_id_name', 'BTREE');
      table.index(['name'], 'tags_name', 'HASH');
      table.index(['name', 'value'], 'tags_name_value', 'BTREE');
    })
    .createTable('wallets', (table) => {
      table.string('id', 64).notNullable();
      table.string('address').notNullable();
      table.float('balance').defaultTo(0);
      table.timestamp('created_at').defaultTo(knex.fn.now());

      table.primary(['id'], 'pkey_tags');
    })
    .createTable('chunks', (table) => {
      table.string('id', 64).notNullable();
      table.text('chunk').notNullable();
      table.string('data_root').notNullable();
      table.string('data_size').notNullable();
      table.string('offset').notNullable();
      table.string('data_path').notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());

      table.primary(['id'], 'pkey_tags');
    });
}

export async function down(knex: Knex, persist: boolean) {
  if (!persist) return;
  return knex.schema
    .withSchema(process.env.ENVIRONMENT || 'public')
    .dropTableIfExists('transactions')
    .dropTableIfExists('blocks')
    .dropTableIfExists('tags')
    .dropTableIfExists('wallets')
    .dropTableIfExists('chunks');
}
