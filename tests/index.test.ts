import { ethers } from 'ethers';
import * as Starknet from 'starknet';

import * as linora from '../src/index';

import { configFactory } from './factories/linora-config';
import { createMockProvider } from './mocks/provider';

describe('linora SDK exports', () => {
  describe('Client', () => {
    test('should export fromEthSigner method', () => {
      expect(linora.Client.fromEthSigner).toBeDefined();
      expect(typeof linora.Client.fromEthSigner).toBe('function');
      
    });

    test('should export fromStarknetAccount method', () => {
      expect(linora.Client.fromStarknetAccount).toBeDefined();
      expect(typeof linora.Client.fromStarknetAccount).toBe('function');
    });

    test('fromEthSigner should create client', async () => {
      const wallet = ethers.Wallet.fromPhrase(
        'test test test test test test test test test test test ball',
      );
      const signer = linora.Signer.fromEthers(wallet);
      const config = configFactory();

      const client = await linora.Client.fromEthSigner({ config, signer });

      expect(client).toBeDefined();
      expect(client.getAddress()).toBe(
        '0x72c394aaa3fae59ad7749c856dc18e2a289e83885b80c0da7731290a9163e17',
      );
    });

    test('fromStarknetAccount should create client', async () => {
      const snProvider = createMockProvider();
      const snAccount = new Starknet.Account({
        provider: snProvider,
        address:
          '0x4383e793c2d1bc29be7647794936371dac6955636f22069a033d4392794780a',
        signer:
          '0x46063cf2e9c3cbf5cc17ad5fdfce6b6959fede7ceb433dc057a3c90f668004b',
      });

      jest
        .spyOn(snProvider, 'getClassHashAt')
        .mockResolvedValueOnce(
          '0x1a736d6ed154502257f02b1ccdf4d9d1089f80811cd6acad48e6b6a9d1f2003',
        );
      jest.spyOn(snProvider, 'getClassAt').mockResolvedValueOnce({
        sierra_program: [],
        contract_class_version: '',
        entry_points_by_type: { CONSTRUCTOR: [], EXTERNAL: [], L1_HANDLER: [] },
        abi: [{ type: 'function', inputs: [{ type: '::' }] }],
      });

      const config = configFactory();
      const client = await linora.Client.fromStarknetAccount({
        config,
        account: snAccount,
        starknetProvider: snProvider,
      });

      expect(client).toBeDefined();
      expect(client.getAddress()).toBe(
        '0x7b21ae25ac9b3f3ff47bb541097332f27252567a5e6f0399ff6f2cfdb1a2cb',
      );
    });
  });

  describe('Config', () => {
    test('should export fetch method', () => {
      expect(linora.Config.fetch).toBeDefined();
      expect(typeof linora.Config.fetch).toBe('function');
    });
  });

  describe('Signer', () => {
    test('should export fromEthers method', () => {
      expect(linora.Signer.fromEthers).toBeDefined();
      expect(typeof linora.Signer.fromEthers).toBe('function');
    });

    test('fromEthers should create signer', () => {
      const wallet = ethers.Wallet.fromPhrase(
        'test test test test test test test test test test test ball',
      );
      const signer = linora.Signer.fromEthers(wallet);

      expect(signer).toBeDefined();
      expect(signer.signTypedData).toBeDefined();
    });
  });

  describe('Type exports', () => {
    test('should export linoraClient type', () => {
      // Type-only test - if this compiles, the type is exported
      const client: linora.linoraClient | null = null;
      expect(client).toBeNull();
    });

    test('should export CreateClientFromEthSignerParams type', () => {
      const params: linora.CreateClientFromEthSignerParams | null = null;
      expect(params).toBeNull();
    });

    test('should export CreateClientFromStarknetAccountParams type', () => {
      const params: linora.CreateClientFromStarknetAccountParams | null = null;
      expect(params).toBeNull();
    });

    test('should export TokenBalance type', () => {
      const balance: linora.TokenBalance = { size: '100' };
      expect(balance.size).toBe('100');
    });

    test('should export SocializedLossFactor type', () => {
      const factor: linora.SocializedLossFactor = {
        socializedLossFactor: '0.01',
      };
      expect(factor.socializedLossFactor).toBe('0.01');
    });

    test('should export ReceivableAmount type', () => {
      const amount: linora.ReceivableAmount = {
        receivableAmount: '99',
        receivableAmountChain: '99000000',
        socializedLossFactor: '0.01',
      };
      expect(amount.receivableAmount).toBe('99');
    });

    test('should export MaxWithdraw type', () => {
      const maxWithdraw: linora.MaxWithdraw = {
        amount: '100',
        amountChain: '100000000',
      };
      expect(maxWithdraw.amount).toBe('100');
    });

    test('should export WithdrawResult type', () => {
      const result: linora.WithdrawResult = { hash: '0xabc' };
      expect(result.hash).toBe('0xabc');
    });

    test('should export linoraConfig type', () => {
      const config: linora.linoraConfig = configFactory();
      expect(config.linoraChainId).toBeDefined();
    });

    test('should export EthereumSigner type', () => {
      const wallet = ethers.Wallet.fromPhrase(
        'test test test test test test test test test test test ball',
      );
      const signer: linora.EthereumSigner = linora.Signer.fromEthers(wallet);
      expect(signer).toBeDefined();
    });

    test('should export Hex type', () => {
      const hex: linora.Hex = '0x123';
      expect(hex).toBe('0x123');
    });
  });
});
