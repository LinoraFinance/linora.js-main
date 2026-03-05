# linora SDK

Official JavaScript/TypeScript SDK for [linora](https://linora.trade) - a decentralized perpetuals exchange built on Starknet.

## Installation

```bash
npm install @linora/sdk
```

```bash
yarn add @linora/sdk
```

```bash
pnpm add @linora/sdk
```

## Quick Start

### Browser (MetaMask/Web3 Wallet)

```typescript
import * as linora from '@linora/sdk';
import { ethers } from 'ethers';

// 1. Fetch configuration for your environment
const config = await linora.Config.fetch('testnet'); // or 'mainnet'

// 2. Connect to user's wallet
const provider = new ethers.BrowserProvider(window.ethereum);
const ethersSigner = await provider.getSigner();
const signer = linora.Signer.fromEthers(ethersSigner);

// 3. Create linora client
const client = await linora.Client.fromEthSigner({ config, signer });

// 4. Use the client
console.log('Your linora address:', client.getAddress());
const balance = await client.getTokenBalance('USDC');
console.log('USDC Balance:', balance.size);
```

### Node.js (Private Key)

```typescript
import * as linora from '@linora/sdk';
import { ethers } from 'ethers';

// 1. Fetch configuration
const config = await linora.Config.fetch('testnet');

// 2. Create wallet from private key
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY);
const signer = linora.Signer.fromEthers(wallet);

// 3. Create linora client
const client = await linora.Client.fromEthSigner({ config, signer });

// 4. Use the client
const balance = await client.getTokenBalance('USDC');
console.log('Balance:', balance.size);
```

## Core Concepts

### Client

The `linoraClient` is the main interface for interacting with linora. It handles authentication and provides a clean API for common operations.

```typescript
// Create from Ethereum wallet
const client = await linora.Client.fromEthSigner({ config, signer });

// Create from Starknet account
const client = await linora.Client.fromStarknetAccount({
  config,
  account: starknetAccount,
  starknetProvider: optionalProvider,
});
```

### Configuration

Fetch environment-specific configuration:

```typescript
const config = await linora.Config.fetch('testnet'); // testnet, mainnet, or custom URL
```

## Common Operations

### Get Token Balance

```typescript
const balance = await client.getTokenBalance('USDC');
console.log(`Balance: ${balance.size} USDC`);
```

### Get Maximum Withdrawable Amount

```typescript
const maxWithdraw = await client.getMaxWithdraw('USDC');
console.log(`Max withdrawable: ${maxWithdraw.amount} USDC`);
console.log(`Chain amount: ${maxWithdraw.amountChain}`);
```

### Check Socialized Loss Factor

```typescript
const { socializedLossFactor } = await client.getSocializedLossFactor();
if (Number(socializedLossFactor) > 0) {
  console.warn('Socialized loss is active');
}
```

### Calculate Receivable Amount

```typescript
const receivable = await client.getReceivableAmount('USDC', '100');
console.log(`Requesting: 100 USDC`);
console.log(`Will receive: ${receivable.receivableAmount} USDC`);
console.log(`Loss factor: ${receivable.socializedLossFactor}`);
```

### Withdraw Tokens

```typescript
// Simple withdrawal (no bridge call)
const result = await client.withdraw('USDC', '50', []);
console.log('Transaction hash:', result.hash);

// Wait for confirmation
await client.waitForTransaction(result.hash);
console.log('Withdrawal complete!');
```

### Withdraw with Bridge Call

```typescript
// Calculate receivable amount first
const receivable = await client.getReceivableAmount('USDC', '100');

// Prepare bridge call with receivable amount
const bridgeCall = {
  contractAddress: '0x...',
  entrypoint: 'deposit',
  calldata: ['...', receivable.receivableAmountChain],
};

// Execute withdrawal with bridge call
const result = await client.withdraw('USDC', '100', bridgeCall);
await client.waitForTransaction(result.hash);
```

## TypeScript Support

The SDK is written in TypeScript and provides full type definitions out of the box.

```typescript
import type {
  MaxWithdraw,
  linoraClient,
  linoraConfig,
  ReceivableAmount,
  TokenBalance,
  WithdrawResult,
} from '@linora/sdk';

// All types are fully typed and autocomplete-friendly
const balance: TokenBalance = await client.getTokenBalance('USDC');
```

## Error Handling

```typescript
try {
  const balance = await client.getTokenBalance('USDC');
  console.log('Balance:', balance.size);
} catch (error) {
  if (error instanceof Error) {
    console.error('Failed to get balance:', error.message);
  }
}
```

## Advanced Usage

### Access Underlying Provider

```typescript
const provider = client.getProvider();
// Access the authenticated RPC provider for advanced operations
```

### Get Account Address

```typescript
const address = client.getAddress();
console.log('Your linora address:', address);
```

### Custom RPC Calls

```typescript
const provider = client.getProvider();
const result = await provider.callContract({
  contractAddress: '0x...',
  entrypoint: 'get_balance',
  calldata: ['0x123'],
});
```

## Best Practices

### 1. Environment Variables

Store sensitive data in environment variables:

```typescript
const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) {
  throw new Error('PRIVATE_KEY environment variable is required');
}
```

### 2. Error Handling

Always wrap SDK calls in try-catch blocks:

```typescript
try {
  const client = await linora.Client.fromEthSigner({ config, signer });
  const balance = await client.getTokenBalance('USDC');
} catch (error) {
  // Handle errors appropriately
  console.error('SDK Error:', error);
}
```

### 3. Socialized Loss Checks

Always check for socialized loss before withdrawals:

```typescript
const receivable = await client.getReceivableAmount('USDC', amount);
if (Number(receivable.socializedLossFactor) !== 0) {
  // Warn user they will receive less than requested
  console.warn(
    `Due to socialized loss, you will receive ${receivable.receivableAmount} instead of ${amount}`,
  );
}
```

### 4. Transaction Confirmations

Wait for transaction confirmations:

```typescript
const result = await client.withdraw('USDC', '100', []);
console.log('Transaction submitted:', result.hash);

// Wait for confirmation
await client.waitForTransaction(result.hash);
console.log('Transaction confirmed!');
```

### 5. Type Safety

Leverage TypeScript for type safety:

```typescript
import type { linoraClient } from '@linora/sdk';

function processBalance(client: linoraClient, token: string): Promise<void> {
  // TypeScript will ensure correct usage
  return client.getTokenBalance(token).then((balance) => {
    console.log(`${token} Balance:`, balance.size);
  });
}
```

## Browser Usage Notes

To use the linora SDK in the browser, you'll need to configure your bundler to polyfill Node.js modules:

### Webpack 5

```javascript
// webpack.config.js
module.exports = {
  resolve: {
    fallback: {
      buffer: require.resolve('buffer/'),
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
    },
  },
  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser',
    }),
  ],
};
```

### Vite

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [nodePolyfills()],
  define: {
    'process.env.NODE_DEBUG': JSON.stringify(''),
  },
});
```

## Examples

See the [examples](./examples) directory for complete working examples:

- **[account-ethereum.ts](./examples/account-ethereum.ts)** - Create client from Ethereum wallet
- **[account-starknet.ts](./examples/account-starknet.ts)** - Create client from Starknet account
- **[withdrawal-node.ts](./examples/withdrawal-node.ts)** - Complete withdrawal flow (Node.js)
- **[withdrawal.ts](./examples/withdrawal.ts)** - Complete withdrawal flow (Browser)

For a full React application example, see: [linora-react-example](https://github.com/tradelinora/linora-react-example)

## API Reference

### Client Methods

| Method                                | Description                            | Returns                |
| ------------------------------------- | -------------------------------------- | ---------------------- |
| `getTokenBalance(token)`              | Get token balance                      | `TokenBalance`         |
| `getMaxWithdraw(token)`               | Get maximum withdrawable amount        | `MaxWithdraw`          |
| `getSocializedLossFactor()`           | Get current socialized loss factor     | `SocializedLossFactor` |
| `getReceivableAmount(token, amount)`  | Calculate amount after socialized loss | `ReceivableAmount`     |
| `withdraw(token, amount, bridgeCall)` | Initiate withdrawal                    | `WithdrawResult`       |
| `waitForTransaction(hash, options?)`  | Wait for transaction confirmation      | `TransactionReceipt`   |
| `getAddress()`                        | Get account address                    | `string`               |
| `getProvider()`                       | Get underlying provider                | `DefaultProvider`      |

### Configuration

| Method              | Description                         | Returns         |
| ------------------- | ----------------------------------- | --------------- |
| `Config.fetch(env)` | Fetch configuration for environment | `linoraConfig` |

### Signer

| Method                      | Description                  | Returns          |
| --------------------------- | ---------------------------- | ---------------- |
| `Signer.fromEthers(signer)` | Create signer from ethers.js | `EthereumSigner` |

## Support

- **Discord:** [Join our Discord](https://discord.gg/linora)
- **Documentation:** [docs.linora.trade](https://docs.linora.trade)
- **Issues:** [GitHub Issues](https://github.com/tradelinora/linora.js/issues)

## License

MIT

## Warning

⚠️ **This SDK is in active development.** APIs may change between versions. Please check the changelog before upgrading.

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting pull requests.
