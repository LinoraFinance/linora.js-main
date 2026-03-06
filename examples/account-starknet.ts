import * as Starknet from 'starknet';

import * as linora from '../src/index.js';

// 1. Fetch config
const config = await linora.Config.fetch('testnet'); // "testnet" | "mainnet"

// 2. Create client from Starknet account
const snProvider = new Starknet.RpcProvider();
const snAccount = new Starknet.Account({
  provider: snProvider,
  address: '0x1234',
  signer: '0x5678',
  
});

const client = await linora.Client.fromStarknetAccount({
  config,
  account: snAccount,
  // Optional: Provide custom Starknet RPC URL to skip using public provider
  rpcUrl: 'https://rpc.starknet.lava.build/rpc/v0_9',
});

console.log(`linora address: ${client.getAddress()}`);

// 3. Get balance
const balance = await client.getTokenBalance('USDC');
console.log(balance); // { size: '100.45' }
