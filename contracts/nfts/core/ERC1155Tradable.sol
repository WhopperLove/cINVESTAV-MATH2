// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import "./lib/ERC1155.sol";
import "./interfaces/IERC1155Tradable.sol";
import "./roles/OwnableAndRoles.sol";

contract OwnableDelegateProxy {}

contract ProxyRegistry {
  mapping(address => OwnableDelegateProxy) public proxies;
}

/**
 * @title ERC1155Tradable
 * ERC1155Tradable - ERC1155 contract that whitelists an operator address, 
 * has create and mint functionality, and supports useful standards from OpenZeppelin,
  like exists(), name(), symbol(), and totalSupply()
 */
contract ERC1155Tradable is ERC1155, IERC1155Tradable, OwnableAndRoles {
  address proxyRegistryAddress;
  uint256 private _currentTokenID = 0;
  mapping(uint256 => address) public creators;
  mapping(uint256 => uint256) public tokenSupply;
  mapping(uint256 => uint256) public tokenMaxSupply;
  // Contract name
  string public name;
  // Contract symbol
  string public symbol;

  constructor(
    string memory _na