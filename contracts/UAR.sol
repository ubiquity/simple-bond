// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.3;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract UAR is ERC20, Ownable {
  constructor(string memory name, string memory symbol) ERC20(name, symbol) {}

  function raiseCapital(uint256 amount) external onlyOwner {
    _mint(owner(), amount);
  }
}
