import { ethers } from "@nomiclabs/buidler";
import { expect } from "chai";
import { Signer } from "ethers";

import { ExposedStakeableTokenFactory } from '../../../src/types/ExposedStakeableTokenFactory';
import { ExposedStakeableToken } from '../../../src/types/ExposedStakeableToken';

import { NeverStakeStrategyFactory } from '../../../src/types/NeverStakeStrategyFactory';
import { NeverStakeStrategy } from '../../../src/types/NeverStakeStrategy';

import { KarmaTokenMockFactory } from "../../../src/types/KarmaTokenMockFactory";
import { KarmaTokenMock } from "../../../src/types/KarmaTokenMock";

describe("StakeableToken", function() {
  let deployer: Signer;
  let staker: Signer;
  let stakeableTokenWrapper: ExposedStakeableToken;
  let underlyingToken: KarmaTokenMock;

  beforeEach(async function () {
    [deployer, staker] = await ethers.getSigners();

    const karmaTokenFactory = new KarmaTokenMockFactory(deployer);
    u