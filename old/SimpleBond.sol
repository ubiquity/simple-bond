// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract SimpleBond {
  IERC20 public immutable tokenRewards;
  uint256 public immutable rewardPerBillion;
  uint256 public immutable vestingBlocks;

  struct Bond {
    address token;
    uint256 deposit;
    uint256 rewards;
    uint256 block;
  }
  mapping(address => Bond[]) public bonds;
  uint256 public totalDeposit;
  uint256 public totalRewards;

  constructor(
    address _tokenRewards,
    uint256 _rewardPerBillion,
    uint256 _vestingBlocks
  ) {
    require(_tokenRewards != address(0), "Invalid Reward token");
    require(_rewardPerBillion > 0, "Invalid Reward pourcentage");
    require(_vestingBlocks > 0, "Invalid Vesting blocks number");
    tokenRewards = IERC20(_tokenRewards);
    rewardPerBillion = _rewardPerBillion;
    vestingBlocks = _vestingBlocks;
  }

  function deposit(address tokenDeposit, uint256 amount) public returns (Bond memory bond) {
    require(IERC20(tokenDeposit).allowance(msg.sender, address(this)) >= amount, "Not enough allowance");
    require(IERC20(tokenDeposit).transferFrom(msg.sender, address(this), amount), "Deposit failed");

    bond.token = tokenDeposit;

    bond.deposit = amount;
    totalDeposit += amount;

    uint256 rewards = ((amount * rewardPerBillion) / 1_000_000_000) * vestingBlocks;
    bond.rewards = rewards;
    totalRewards += rewards;

    bond.block = block.number;

    bonds[msg.sender].push(bond);
  }

  function bondsCount(address addr) public view returns (uint256) {
    return bonds[addr].length;
  }

  function _bond(address addr, uint256 index) internal view returns (Bond memory) {
    return bonds[addr][index];
  }

  function _bondVesting(Bond memory bond) internal view returns (bool) {
    assert(block.number >= bond.block);
    return (block.number - bond.block) < vestingBlocks;
  }

  function bondVesting(address addr, uint256 index) public view returns (bool) {
    return _bondVesting(_bond(addr, index));
  }

  function _bondUnlockDeposit(Bond memory bond) internal view returns (uint256) {
    return _bondVesting(bond) ? 0 : bond.deposit;
  }

  function bondUnlockDeposit(address addr, uint256 index) public view returns (uint256) {
    return _bondUnlockDeposit(_bond(addr, index));
  }

  function _bondClaimableRewards(Bond memory bond) internal view returns (uint256) {
    return _bondVesting(bond) ? (bond.rewards * (block.number - bond.block)) / vestingBlocks : bond.rewards;
  }

  function bondClaimableRewards(address addr, uint256 index) public view returns (uint256) {
    return _bondClaimableRewards(_bond(addr, index));
  }

  function _bondBalancesOf(Bond memory bond)
    internal
    view
    returns (
      uint256 balanceDeposit,
      uint256 balanceRewards,
      uint256 balanceUnlockDeposit,
      uint256 balanceClaimableRewards
    )
  {
    balanceDeposit = bond.deposit;
    balanceRewards = bond.rewards;
    balanceUnlockDeposit = _bondUnlockDeposit(bond);
    balanceClaimableRewards = _bondClaimableRewards(bond);
  }

  function bondBalancesOf(address addr, uint256 index)
    public
    view
    returns (
      uint256 balanceDeposit,
      uint256 balanceRewards,
      uint256 balanceUnlockDeposit,
      uint256 balanceClaimableRewards
    )
  {
    return _bondBalancesOf(_bond(addr, index));
  }

  function balancesOf(address addr)
    public
    view
    returns (
      uint256 balanceDeposit,
      uint256 balanceRewards,
      uint256 balanceUnlockDeposit,
      uint256 balanceClaimableRewards
    )
  {
    for (uint256 index = 0; index < bondsCount(addr); index += 1) {
      Bond memory bond = bonds[addr][index];

      balanceDeposit += bond.deposit;
      balanceRewards += bond.rewards;
      balanceUnlockDeposit += _bondUnlockDeposit(bond);
      balanceClaimableRewards += _bondClaimableRewards(bond);
    }
  }

  function bondWithdraw(
    address addr,
    uint256 amount,
    uint256 index
  ) internal returns (uint256 withdrawn) {
    Bond storage bond = bonds[addr][index];

    if (_bondVesting(bond) || bond.deposit == 0) {
      withdrawn = 0;
    } else {
      withdrawn = (amount <= bond.deposit) ? amount : bond.deposit;

      totalDeposit -= withdrawn;
      bond.deposit -= withdrawn;

      IERC20(bond.token).transfer(msg.sender, withdrawn);
    }
  }

  function bondClaim(
    address addr,
    uint256 amount,
    uint256 index
  ) internal returns (uint256 rewards) {
    Bond storage bond = bonds[addr][index];

    if (_bondVesting(bond) || bond.rewards == 0) {
      rewards = 0;
    } else {
      rewards = (amount <= bond.rewards) ? amount : bond.rewards;

      totalRewards -= rewards;
      bond.rewards -= rewards;

      IERC20(tokenRewards).transfer(msg.sender, rewards);
    }
  }

  function withdraw(address addr, uint256 amount) public returns (uint256 withdrawn) {
    for (uint256 index = 0; (index < bondsCount(addr)) && (amount > 0); index += 1) {
      uint256 bondWithdrawn = bondWithdraw(addr, amount, index);

      amount -= bondWithdrawn;
      withdrawn += bondWithdrawn;
    }
  }

  function claim(address addr, uint256 amount) public returns (uint256 claimed) {
    for (uint256 index = 0; (index < bondsCount(addr)) && (amount > 0); index += 1) {
      uint256 bondRewards = bondClaim(addr, amount, index);

      amount -= bondRewards;
      claimed += bondRewards;
    }
  }
}
