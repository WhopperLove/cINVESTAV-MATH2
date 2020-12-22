import { UniswapFactoryMockFactory } from '../src/types/UniswapFactoryMockFactory';
import { UniswapV2PairMockFactory } from '../src/types/UniswapV2PairMockFactory';
import { TacoTokenFactory } from "../src/types/TacoTokenFactory";

import { TaconomicsFactory } from '../src/types/TaconomicsFactory';
import { GenesisPoolFactory } from '../src/types/GenesisPoolFactory';

const { ethers, network } = require("@nomiclabs/buidler");

export async function main() {
  if (network.name != "localhost" && network.name != "buidlerevm") throw Error("Deploy script only works for local networks");

  const TOTAL_SUPPLY = "15624000000000000000000000";
  const WETH_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

  const [depl