//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract tokenBuild {
    // optional functions
    string public name = "prince";
    string public symbol = "PT";
    uint256 public constant decimals = 18;

    // require functions
    uint256 public totalSupply = 10000000 * (10**18);
    mapping(address => uint256) balances;
    mapping(address => mapping(address => uint256)) allowed;

    address public owner;

    constructor() {
        owner = msg.sender;
        balances[msg.sender] = totalSupply;
    }

    function transfer(address to, uint256 amount) public {
        require(
            balances[msg.sender] >= amount,
            "Not sufficient PT to transfer"
        );

        uint256 fee = (amount / 1000);
        uint256 transactionAmount = amount - fee;

        balances[address(this)] += fee;
        balances[msg.sender] -= amount;
        balances[to] += transactionAmount;
    }

    function balanceOf(address account) public view returns (uint256) {
        return balances[account];
    }

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public {
        require(balances[from] >= amount, "Not Sufficient tokens to sender");
        require(
            allowed[from][msg.sender] >= amount,
            "Not Sufficient tokens to approver"
        );

        balances[from] -= amount;
        allowed[from][msg.sender] -= amount;
        balances[to] += amount;
    }

    function approve(address delegate, uint256 allowedTokens) public {
        require(
            allowedTokens <= balances[msg.sender],
            "cant make approver because unsufficient tokens"
        );

        allowed[msg.sender][delegate] = allowedTokens;
    }

    function allowance(address from, address delegate)
        public
        view
        returns (uint256)
    {
        return allowed[from][delegate];
    }
}
