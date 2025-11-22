import { createClient } from '@clickhouse/client'
import { commonAbis, evmDecoder, evmPortalSource } from '@subsquid/pipes/evm'
import { clickhouseTarget } from '@subsquid/pipes/targets/clickhouse'

async function main() {
    await evmPortalSource({
        portal: 'https://portal.sqd.dev/datasets/ethereum-mainnet',
    })
        .pipe(
            evmDecoder({
                range: { from: 'latest' },
                events: {
                    transfers: commonAbis.erc20.events.Transfer,
                },
            }),
        )
        .pipe({
            transform: (data) =>
                data.transfers.map((t) => ({
                    block_number: t.block.number,
                    token: t.contract,
                    from: t.event.from,
                    to: t.event.to,
                    amount: t.event.value.toString(),
                })),
        })
        .pipeTo(
            clickhouseTarget({
                client: createClient({
                    username: 'default',
                    password: 'password',
                    url: 'http://localhost:8123',
                }),
                onStart: async ({ store }) => {
                    await store.command({
                        query: `
              CREATE TABLE IF NOT EXISTS erc20_transfers (
                block_number  UInt64,
                timestamp     DateTime64(3) CODEC (DoubleDelta, ZSTD),
                token         String,
                from          String,
                to            String,
                amount        UInt256
              )
              ENGINE = MergeTree
              ORDER BY block_number
          `,
                    })
                },
                onData: async ({ ctx, data, store }) => {
                    await store.insert({
                        table: 'erc20_transfers',
                        values: data,
                        format: 'JSONEachRow',
                    })
                },
                onRollback: async ({ safeCursor, store }) => {
                    await store.removeAllRows({
                        tables: ['erc20_transfers'],
                        where: `block_number > {latest:UInt32}`,
                        params: { latest: safeCursor.number },
                    })
                },
            }),
        )
}

void main()