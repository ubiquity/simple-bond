// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract SimpleBond {
  IERC20 public immutable tokenLP;
  IERC20 public immutable tokenRewards;
  uint256 public immutable rewardPourcentage;
  uint256 public immutable vestingBlocks;

  struct Balances {
    uint256 lp;
    uint256 withdrawableLP;
    uint256 rewards;
    uint256 claimableRewards;
  }

  struct Bond {
    uint256 lp;
    uint256 rewards;
    uint256 block;
  }
  mapping(address => Bond[]) public bonds;
  uint256 public totalLP;
  uint256 public totalRewards;

  constructor(
    address _tokenLP,
    address _tokenRewards,
    uint256 _rewardPourcentage,
    uint256 _vestingBlocks
  ) {
    require(_tokenLP != address(0), "Invalid LP token");
    require(_tokenRewards != address(0), "Invalid Reward token");
    require(_rewardPourcentage > 0, "Invalid Reward pourcentage");
    require(_vestingBlocks > 0, "Invalid Vesting blocks number");
    tokenLP = IERC20(_tokenLP);
    tokenRewards = IERC20(_tokenRewards);
    rewardPourcentage = _rewardPourcentage;
    vestingBlocks = _vestingBlocks;
  }

  function depositLP(uint256 amount) public returns (Bond memory bond) {
    tokenLP.approve(address(this), amount);
    require(tokenLP.transferFrom(msg.sender, address(this), amount), "LP deposit failed");

    bond.lp = amount;
    totalLP += amount;

    uint256 rewards = ((amount * rewardPourcentage) / 100) * vestingBlocks;
    bond.rewards = rewards;
    totalRewards += rewards;

    bond.block = block.number;

    bonds[msg.sender].push(bond);
  }

  function balancesOf(address addr)
    public
    view
    returns (
      uint256 balanceLP,
      uint256 balanceRewards,
      uint256 balanceClaimableLP,
      uint256 balanceClaimableRewards
    )
  {
    for (uint256 index = 0; index < bonds[addr].length; index += 1) {
      Bond bond = bonds[addr][index];
      balanceLP += bond.lp;
      balanceRewards += bond.rewards;

      assert(block.number >= bond.block);
      // uint256 vestedBlocks =;

      if (_lpUnlock(bond)) {
        balanceClaimableLP += bond.lp;
        vestedBlocks = vestingBlocks;
      }
      balanceClaimableRewards += _mulByBlockRatio(bond.rewards) * (vestedBlocks / vestingBlocks);
    }
  }

  function _lpUnlock(Bond bond) internal returns (bool unlock) {
    assert(block.number >= bond.block);
    unlock = (block.number - bond.block > vestingBlocks);
  }

  function _claimableRewards(Bond bond) internal returns (uint256 claimable) {
    assert(block.number >= bond.block);
    uint256 ratioBlocks = (block.number - bond.block) / vestingBlocks;
    claimable = ratioBlocks >= 1 ? bond.rewards : bond.rewards * (vestedBlocks / vestingBlocks);
  }

  function _withdrawBondLP(Bond bond, uint256 amount) internal returns (uint256 withdrawn) {
    assert(block.number >= bond.block);
    uint256 vestedBlocks = block.number - bond.block;

    if (vestedBlocks > vestingBlocks) {}

    withdrawn = (amount <= bond.lp) ? amount : bond.lp;
    totalLP -= withdrawn;
    amount -= withdrawn;
    bond.lp -= withdrawn;
  }

  function _withdrawLP(address addr, uint256 amount) internal {
    for (uint256 index = 0; index < bonds[addr].length; index += 1) {
      uint256 withdrawn = _withdrawBondLP(bonds[addr], amount);

      // if (withdrawn )
    }
    assert(amount == 0);
  }

  function withdrawLP(uint256 amount) public {
    (, , uint256 balance, ) = balancesOf(msg.sender);
    require(balance >= amount, "Not enough balance");

    _withdrawLP(msg.sender, amount);
    tokenLP.transfer(msg.sender, amount);
  }

  function claimRewards(uint256 amount) public {
    uint256 balance = balanceLP(msg.sender);
    require(balance >= amount, "Not enough balance");

    _withdrawLP(msg.sender, amount);
    tokenLP.transfer(msg.sender, amount);
  }
}
