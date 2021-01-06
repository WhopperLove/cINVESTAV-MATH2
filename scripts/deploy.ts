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
  // const WETH_ADDRESS = "0xc778417e063141139fce010982780140aa0cd5ab"; // ropsten

  // Too many cooks? https://www.youtube.com/watch?v=QrGrOK8oZG8
  const EARLY_COOKS_LIST = [
    "0x5224130B3E071a09b711CA4F9242F927BEB4E693",
    "0x0214c295E1aE39c3F589cE53811c82c7d10b359d",
    "0x3B453972722b671A5217B811d62cB70F73Bd9E37",
    "0xb51b6c9D16DA4b720d575140E1a3dd4C4a163953",
    "0xb233166aD1E0245b9d5B1428A22912C4CE01f252",
    "0x6cC77465823260A74d9586D816cbE993F0A43229",
    "0xd4a52814797Cd9C6f22eB9A352a58658e36e7Be8",
    "0x45d155808B1c30DF32B3984904669ac80bACc806",
    "0xAE721e7C9974bdDE7682AFF36351F43D6738f2C4",
    "0x9C52D288E14BBAbB90b62a23a318494d30c59DD7",
    "0xDfDfDce77DD4eF074532bc86E6Cb0B5b5bFAa584",
    "0xbb38E1c9e6d61B51F2eF5f9290b29e86d9191FDf",
    "0xbfeceC47dD8bf5F6264A9830A9d26ef387c38A67",
    "0x0fdbd5B41AEe3Ff69DfB6e639EA658675835bc75",
    "0x4530B100BF6400268E22fE64d7548fFaafA8dC39",
    "0xbdDBD3A43F2474147C48CA56