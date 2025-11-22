# SQD Pipes

## Setup

```bash
docker-compose up -d
```

## Run Indexers

### MultiLogger Indexer
```bash
npx ts-node pipe-multi.ts
```

### BAHack Indexer
```bash
npx ts-node pipe-bahack.ts
```

## Query

### MultiLogger Events
```bash
docker exec clickhouse clickhouse-client --password password \
  -q "SELECT block_number, event_type, sender, amount, value2 as balance FROM multi_logger_events"
```

### BAHack Events
```bash
docker exec clickhouse clickhouse-client --password password \
  -q "SELECT * FROM bahack_events"
```

## Interact with Contracts

### MultiLogger (0xd892de662E18237dfBD080177Ba8cEc4bC6689E7)
```bash
cast send 0xd892de662E18237dfBD080177Ba8cEc4bC6689E7 "increment()" --rpc-url $RPC_URL --private-key $PRIVATE_KEY

cast send 0xd892de662E18237dfBD080177Ba8cEc4bC6689E7 "deposit()" --value 0.0001ether --rpc-url $RPC_URL --private-key $PRIVATE_KEY

cast send 0xd892de662E18237dfBD080177Ba8cEc4bC6689E7 'log(string)' 'Hello SQD!' --rpc-url $RPC_URL --private-key $PRIVATE_KEY
```

### BAHack (0x5b0b1cbF40C910f58B8Ff1d48A629f257a556B99)
```bash
cast send 0x5b0b1cbF40C910f58B8Ff1d48A629f257a556B99 "upload(string,string,uint256,string)" "id1" "description" 1000000 "0xPayAddress" --rpc-url $RPC_URL --private-key $PRIVATE_KEY
```

## Reset Database

```bash
docker exec clickhouse clickhouse-client --password password -q "DROP DATABASE default"
docker exec clickhouse clickhouse-client --password password -q "CREATE DATABASE default"
```
