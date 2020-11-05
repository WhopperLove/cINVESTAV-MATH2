
// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "../../nfts/core/interfaces/IERC1155Tradable.sol";
import "../interfaces/IRedeemableStrategy.sol";

contract RedeemableNFT {
  using SafeMath for uint256;

  struct NFT {