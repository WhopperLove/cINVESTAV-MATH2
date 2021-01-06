// SPDX-License-Identifier: MIT

import { TacoTokenFactory } from "../src/types/TacoTokenFactory";
import { TacosCrowdsaleFactory } from "../src/types/TacosCrowdsaleFactory";

const { ethers, network } = require("@nomiclabs/buidler");

require("dotenv").config();

async function main() {

  if (network.name != "ropsten" && network.name != "mainnet") throw Error("Deploy script only works for livenets");

  // Total Supply:          15,624,000 $TACO   (100%)
  //  - Circulating Supply:   14,530,320 $TACO    (93%)
  //    - Uniswap Pool:         7,265,160 $TACO     (46.5%)
  //    - Pre-sale:             7,265,160 $TACO     (46.5%)
  //  - Remainder:            1,093,680 $TACO     (7%)
  //    - Marketing:            312,480 $TACO       (2%)
  //    - Future Development:   781,200 $TACO       (5%)

  const TOTAL_SUPPLY = "15624000000000000000000000";
  const CIRCULATING_SUPPLY = "14530320000000000000000000";
  const TACOS_PER_ETH = 34596;

  // Dependencies
  const KARMA_ADDRESS = "0xdfe691f37b6264a90ff507eb359c45d55037951c";
  const UNISWAP_FACTORY_ADDRESS = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
  const UNISWAP_ROUTER = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
  const WETH_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"; // mainnet
  // const WET