# Runes Zone

## Getting Started

First, run the development server:

```bash
pnpm dev
```

## API endpoints

### Create Transaction

#### Example:

```sh
curl 'https://runes-zone.vercel.app/api/create-tx?source=bc1quff9mk054nrm0mqadq2h53jy582dukfkezs8h9&destination=bc1pg8uy9lucurmewx9wqlg7nk4zwa5ak8zk2t4ku5ycy7nshrhsglrqmu4yps&decimals=8&amount=21000000&ticker=C' | jq .
```

#### Parameters:

 * `source`: The sender address
 * `destination`: The address to send runes. Use: `bc1pg8uy9lucurmewx9wqlg7nk4zwa5ak8zk2t4ku5ycy7nshrhsglrqmu4yps`
 * `decimals`: Use `8``
 * `amount`: Use `21000000` (This creates 21M * 10^8 units)
 * `ticker`: Use only capital letters such as `NEUFI`. 


### Persist Runes

For now, this method just logs

#### Example:

```sh
curl 'localhost:3000/api/cron/persist-runes?count=4' | jq .
```

#### Parameters:

 * `count`: The count of the most recent blocks to scan.
