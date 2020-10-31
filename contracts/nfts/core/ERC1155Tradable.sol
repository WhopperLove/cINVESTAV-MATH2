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
    string memory _name,
    string memory _symbol,
    string memory _uri,
    address _proxyRegistryAddress
  )
    internal
    OwnableAndRoles()
    ERC1155(_uri)
  {
    name = _name;
    symbol = _symbol;
    proxyRegistryAddress = _proxyRegistryAddress;
  }

  function uri(uint256 _id) public view override returns (string memory) {
    require(exists(_id), "ERC1155Tradable#uri: NONEXISTENT_TOKEN");
    return super.uri(_id);
  }

  /**
   * @dev Will update the base URL of token's URI
   * @param _newURI New base URL of token's URI
   */
  function setURI(string memory _newURI) public onlyAdmin {
    _setURI(_newURI);
  }

  /**
   * @dev Will update the usage of ID Substitution or Interpolation
   * @param _useIdSubstitution Indicates if we should use Substitution instead of interpolation
   */
  function setUseUriIdSubstitution(bool _useIdSubstitution) public onlyAdmin {
    _setUseUriIdSubstitution(_useIdSubstitution);
  }

  /**
   * @dev Returns the total quantit