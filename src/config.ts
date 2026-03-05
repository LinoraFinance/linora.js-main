import {
  ETHEREUM_MAINNET_CHAIN_ID,
  ETHEREUM_TESTNET_CHAIN_ID,
  STARKNET_MAINNET_CHAIN_ID,
  STARKNET_TESTNET_CHAIN_ID,
} from './constants.js';
import type { Hex } from './types.js';

interface RawBridgedTokenConfig {
  readonly name: string;
  readonly symbol: string;
  readonly decimals: number;
  readonly l1_token_address: Hex;
  readonly l1_bridge_address: Hex;
  readonly l2_token_address: Hex;
  readonly l2_bridge_address: Hex;
}

export interface RawlinoraConfig {
  readonly starknet_gateway_url: string;
  readonly starknet_fullnode_rpc_url: string;

  readonly starknet_chain_id: string;
  readonly block_explorer_url: string;
  readonly paraclear_address: Hex;
  readonly paraclear_decimals: number;
  readonly paraclear_account_proxy_hash: Hex;
  readonly paraclear_account_hash: Hex;
  readonly bridged_tokens: readonly RawBridgedTokenConfig[];
  readonly l1_core_contract_address: Hex;
  readonly l1_operator_address: Hex;
  readonly l1_chain_id: string;
}

interface BridgedTokenConfig {
  readonly name: string;
  readonly symbol: string;
  readonly decimals: number;
  readonly l1TokenAddress: Hex;
  readonly l1BridgeAddress: Hex;
  readonly l2TokenAddress: Hex;
  readonly l2BridgeAddress: Hex;
}

export interface linoraConfig {
  readonly linoraFullNodeRpcUrl: string;
  readonly linoraChainId: string;
  readonly ethereumChainId: string;
  /** Derived from `ethereumChainId` */
  readonly starknetChainId: string;
  readonly paraclearAccountHash: Hex;
  readonly paraclearAccountProxyHash: Hex;
  readonly paraclearAddress: Hex;
  readonly paraclearDecimals: number;
  readonly bridgedTokens: Record<string, BridgedTokenConfig>;
}

type linoraEnvironment = 'testnet' | 'prod';

/**
 * Fetches the linora config for the given environment.
 * This is required for account derivation.
 */
export async function fetchConfig(
  environment: linoraEnvironment,
): Promise<linoraConfig> {
  assertlinoraEnvironment(environment);
  const apiUrl = getlinoraApiUrl(environment);
  const resp = await fetch(`${apiUrl}/system/config`);

  if (!resp.ok) {
    throw new Error(
      `Failed to fetch linora config: ${resp.statusText} ${resp.status}`,
    );
  }

  const jsonResp = await resp.json();
  const config = jsonResp as RawlinoraConfig;

  return buildConfig(config);
}

function assertlinoraEnvironment(
  environment: string,
): asserts environment is linoraEnvironment {
  if (environment !== 'testnet' && environment !== 'prod') {
    throw new Error(`Invalid linora environment: ${environment}`);
  }
}

function getlinoraApiUrl(environment: linoraEnvironment): string {
  return `https://api.${environment}.linora.trade/v1`;
}

export function buildConfig(rawConfig: RawlinoraConfig): linoraConfig {
  const bridgedTokens = Object.fromEntries(
    rawConfig.bridged_tokens.map((token) => [
      token.symbol,
      {
        name: token.name,
        symbol: token.symbol,
        decimals: token.decimals,
        l1TokenAddress: token.l1_token_address,
        l1BridgeAddress: token.l1_bridge_address,
        l2TokenAddress: token.l2_token_address,
        l2BridgeAddress: token.l2_bridge_address,
      },
    ]),
  );

  return {
    linoraFullNodeRpcUrl: rawConfig.starknet_fullnode_rpc_url,
    linoraChainId: rawConfig.starknet_chain_id,
    ethereumChainId: rawConfig.l1_chain_id,
    starknetChainId: getStarknetChainId(rawConfig),
    paraclearAccountHash: rawConfig.paraclear_account_hash,
    paraclearAccountProxyHash: rawConfig.paraclear_account_proxy_hash,
    paraclearAddress: rawConfig.paraclear_address,
    paraclearDecimals: rawConfig.paraclear_decimals,
    bridgedTokens,
  };
}

function getStarknetChainId(rawConfig: RawlinoraConfig): string {
  switch (rawConfig.l1_chain_id) {
    case ETHEREUM_MAINNET_CHAIN_ID:
      return STARKNET_MAINNET_CHAIN_ID;
    case ETHEREUM_TESTNET_CHAIN_ID:
    default:
      return STARKNET_TESTNET_CHAIN_ID;
  }
}
