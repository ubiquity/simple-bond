// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract SimpleBond {
  IERC20 public immutable tokenVested;
  IERC20 public immutable tokenRewards;
  uint256 public immutable rewardPourcentage;
  uint256 public immutable vestingBlocks;

  struct Bond {
    uint256 vested;
    uint256 rewards;
    uint256 block;
  }
  mapping(address => Bond[]) public bonds;
  uint256 public totalVested;
  uint256 public totalRewards;

  constructor(
    address _tokenVested,
    address _tokenRewards,
    uint256 _rewardPourcentage,
    uint256 _vestingBlocks
  ) {
    require(_tokenVested != address(0), "Invalid LP token");
    require(_tokenRewards != address(0), "Invalid Reward token");
    require(_rewardPourcentage > 0, "Invalid Reward pourcentage");
    require(_vestingBlocks > 0, "Invalid Vesting blocks number");
    tokenVested = IERC20(_tokenVested);
    tokenRewards = IERC20(_tokenRewards);
    rewardPourcentage = _rewardPourcentage;
    vestingBlocks = _vestingBlocks;
  }

  function depositLP(uint256 amount) public returns (Bond memory bond) {
    tokenVested.approve(address(this), amount);
    require(tokenVested.transferFrom(msg.sender, address(this), amount), "LP deposit failed");

    bond.vested = amount;
    totalVested += amount;

    uint256 rewards = ((amount * rewardPourcentage) / 100) * vestingBlocks;
    bond.rewards = rewards;
    totalRewards += rewards;

    bond.block = block.number;

    bonds[msg.sender].push(bond);
  }
}
