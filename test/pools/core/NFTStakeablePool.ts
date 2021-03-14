import { ethers, network } from "@nomiclabs/buidler";
import { expect } from "chai";
import { Signer } from "ethers";

import { NftStakeablePoolFactory } from '../../../src/types/NftStakeablePoolFactory';
import { NftStakeablePool } from '../../../src/types/NftStakeablePool';

import { TaconomicsFactory } from '../../../src/types/TaconomicsFactory';
import { Taconomics } from '../../../src/types/Taconomics';

import { KarmaTokenMockFactory } from "../../../src/types/KarmaTokenMockFactory";
import { KarmaTokenMock } from "../../../src/types/KarmaTokenMock";

import { NeverStakeStrategyFactory } from '../../../src/types/NeverStakeStrategyFactory';
import { EvenRedeemStrategyFactory } from '../../../src/types/EvenRedeemStrategyFactory';

describe("NFTStakeablePool", function() {
  let deployer: Signer;
  let deployerAddress: string;
  let redeemer: Signer;
  let nftStakeablePool: NftStakeablePool;
  let taconomics: Taconomics;
  let staker: Signer;
  let underlyingToken: KarmaTokenMock;

  beforeEach(async function () {
    [deployer, staker, redeemer] = await ethers.getSigners();

    deployerAddress = await deployer.getAddress();

    const karmaTokenFactory = new KarmaTokenMockFactory(deployer);
    underlyingToken = await karmaTokenFactory.deploy();
    await underlyingToken.deployed();

    taconomics = await (new TaconomicsFactory(deployer)).deploy(
      "0xa5409ec958c83c3f309868babaca7c86dcb077c1