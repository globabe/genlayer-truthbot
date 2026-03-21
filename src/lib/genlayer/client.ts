import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";

// GenLayer Network Configuration
export const GENLAYER_CHAIN_ID = parseInt(import.meta.env.VITE_GENLAYER_CHAIN_ID || "61999");
export const GENLAYER_CHAIN_ID_HEX = `0x${GENLAYER_CHAIN_ID.toString(16).toUpperCase()}`;

export const GENLAYER_NETWORK = {
  chainId: GENLAYER_CHAIN_ID_HEX,
  chainName: import.meta.env.VITE_GENLAYER_CHAIN_NAME || "GenLayer Studio",
  nativeCurrency: {
    name: import.meta.env.VITE_GENLAYER_SYMBOL || "GEN",
    symbol: import.meta.env.VITE_GENLAYER_SYMBOL || "GEN",
    decimals: 18,
  },
  rpcUrls: [import.meta.env.VITE_GENLAYER_RPC_URL || "https://studio.genlayer.com/api"],
  blockExplorerUrls: [],
};

interface EthereumProvider {
  isMetaMask?: boolean;
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on: (event: string, handler: (...args: any[]) => void) => void;
  removeListener: (event: string, handler: (...args: any[]) => void) => void;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export function getStudioUrl(): string {
  return import.meta.env.VITE_GENLAYER_RPC_URL || "https://studio.genlayer.com/api";
}

export function getContractAddress(): string {
  return import.meta.env.VITE_CONTRACT_ADDRESS || "0x9183D732CFe28201A3c5D4246f22010b4136d8b7";
}

export function isWalletInstalled(): boolean {
  return typeof window !== "undefined" && !!window.ethereum;
}

/** @deprecated Use isWalletInstalled */
export function isMetaMaskInstalled(): boolean {
  return isWalletInstalled();
}

export function getEthereumProvider(): EthereumProvider | null {
  if (typeof window === "undefined") return null;
  return window.ethereum || null;
}

export async function requestAccounts(): Promise<string[]> {
  const provider = getEthereumProvider();
  if (!provider) throw new Error("MetaMask is not installed");
  try {
    return await provider.request({ method: "eth_requestAccounts" });
  } catch (error: any) {
    if (error.code === 4001) throw new Error("User rejected the connection request");
    throw new Error(`Failed to connect to MetaMask: ${error.message}`);
  }
}

export async function getAccounts(): Promise<string[]> {
  const provider = getEthereumProvider();
  if (!provider) return [];
  try {
    return await provider.request({ method: "eth_accounts" });
  } catch {
    return [];
  }
}

export async function getCurrentChainId(): Promise<string | null> {
  const provider = getEthereumProvider();
  if (!provider) return null;
  try {
    return await provider.request({ method: "eth_chainId" });
  } catch {
    return null;
  }
}

export async function addGenLayerNetwork(): Promise<void> {
  const provider = getEthereumProvider();
  if (!provider) throw new Error("MetaMask is not installed");
  try {
    await provider.request({ method: "wallet_addEthereumChain", params: [GENLAYER_NETWORK] });
  } catch (error: any) {
    if (error.code === 4001) throw new Error("User rejected adding the network");
    throw new Error(`Failed to add GenLayer network: ${error.message}`);
  }
}

export async function switchToGenLayerNetwork(): Promise<void> {
  const provider = getEthereumProvider();
  if (!provider) throw new Error("MetaMask is not installed");
  try {
    await provider.request({ method: "wallet_switchEthereumChain", params: [{ chainId: GENLAYER_CHAIN_ID_HEX }] });
  } catch (error: any) {
    if (error.code === 4902) await addGenLayerNetwork();
    else if (error.code === 4001) throw new Error("User rejected switching the network");
    else throw new Error(`Failed to switch network: ${error.message}`);
  }
}

export async function isOnGenLayerNetwork(): Promise<boolean> {
  const chainId = await getCurrentChainId();
  if (!chainId) return false;
  return parseInt(chainId, 16) === GENLAYER_CHAIN_ID;
}

export async function connectMetaMask(): Promise<string> {
  if (!isMetaMaskInstalled()) throw new Error("MetaMask is not installed");
  const accounts = await requestAccounts();
  if (!accounts?.length) throw new Error("No accounts found");
  const onCorrectNetwork = await isOnGenLayerNetwork();
  if (!onCorrectNetwork) await switchToGenLayerNetwork();
  return accounts[0];
}

export async function switchAccount(): Promise<string> {
  const provider = getEthereumProvider();
  if (!provider) throw new Error("MetaMask is not installed");
  try {
    await provider.request({ method: "wallet_requestPermissions", params: [{ eth_accounts: {} }] });
    const accounts = await provider.request({ method: "eth_accounts" });
    if (!accounts?.length) throw new Error("No account selected");
    return accounts[0];
  } catch (error: any) {
    if (error.code === 4001) throw new Error("User rejected account switch");
    throw new Error(`Failed to switch account: ${error.message}`);
  }
}

export function createGenLayerClient(address?: string) {
  const config: any = { chain: studionet };
  if (address) config.account = address as `0x${string}`;
  const endpoint = getStudioUrl();
  if (endpoint) config.endpoint = endpoint;
  try {
    return createClient(config);
  } catch {
    return createClient({ chain: studionet });
  }
}
