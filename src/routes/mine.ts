import { BlockDB } from '../db/block';
import Router from 'koa-router';
import { TransactionDB } from '../db/transaction';

let blockDB: BlockDB;
let transactionDB: TransactionDB;
let connectionSettings: string;

export async function mineRoute(ctx: Router.RouterContext) {
  try {
    if (!blockDB || connectionSettings !== ctx.connection.client.connectionSettings.filename || !transactionDB) {
      blockDB = new BlockDB(ctx.connection);
      transactionDB = new TransactionDB(ctx.connection);
      connectionSettings = ctx.connection.client.connectionSettings.filename;
    }

    const txs = await transactionDB.getUnminedTxs();

    const inc = +(ctx.params?.qty || 1);

    ctx.network.current = await blockDB.mine(ctx.network.blocks, ctx.network.current, txs);
    ctx.network.height = ctx.network.height + inc;
    ctx.network.blocks = ctx.network.blocks + inc;

    await transactionDB.mineTxs(ctx.network.current);

    ctx.body = ctx.network;
  } catch (error) {
    console.error({ error });
  }
}
