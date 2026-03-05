import { ethers } from 'ethers';

import * as linora from '../src/index.js';

// 1. Fetch config
const config = await linora.Config.fetch('testnet'); // "testnet" | "mainnet"

// 2. Create client from Ethereum wallet
const ethersProvider = new ethers.JsonRpcProvider(
  'https://ethereum-sepolia.publicnode.com',
);
const wallet = new ethers.Wallet('0x...', ethersProvider);
const signer = linora.Signer.fromEthers(wallet);

const client = await linora.Client.fromEthSigner({ config, signer });

console.log(`linora address: ${client.getAddress()}`);

// 3. Get balance
const balance = await client.getTokenBalance('USDC');
console.log(balance); // { size: '100.45' }
