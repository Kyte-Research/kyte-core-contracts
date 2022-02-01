# Kyte Core Contracts

This repository contains the core contracts for the Kyte platform

## Local Deployment

1. Open the root directory for kyte-core-contracts
2. Copy the `.env.example` to `.env`
3. Run `npm install`
4. Start a node using `npx hardhat node`

## Deploy Token

First deploy the token contract:

```
npm run deploy:token:local
```

## Deploy Vesting

Then deploy the token vesting contract:
```
npm run deploy:token-vesting:local
```

# Licensing

The primary license for Kyte Core Contracts is the GPL-3.0, see [`LICENSE`](./LICENSE).
