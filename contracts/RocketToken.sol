// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract RocketToken is ERC721 {
    uint256 public lockTime;
    uint256 public freeAmount;
    uint256 public minPrice;

    mapping (address => uint256) public balanceOfUsers;
    mapping (address => uint256) public freeHolders;
    address[] public starters;

    constructor(uint256 lockTime_, uint256 freeAmount_, uint256 minPrice_) ERC721("RocketToken", "RTK") {
        lockTime = lockTime_;
        freeAmount = freeAmount_;
        minPrice = minPrice_;
    }
 
    function freeMint(address to, uint256 tokenId) external {
        require(to != address(0), "Mint to the zero address");
        require(!_exists(tokenId), "Token already minted");
        require(block.timestamp < lockTime, "Time expires");

        bool isStarter = false;
        for(uint256 i = 0; i < starters.length; ++i) {
            if (to == starters[i]) {
                isStarter = true;
                break;
            }
        }

        if (!isStarter) { // is free address
            uint256 grantedNum = freeHolders[to];
            freeHolders[to] += 1;
            require(grantedNum <= 3, "Already granted 3 tokens");

        } else {
            require(starters.length < freeAmount, "Starters full");
            starters.push(to);
            freeHolders[to] = 1;
        }

        _safeMint(to, tokenId);
    }

    function withdraw() external {
        uint256 amount = balanceOfUsers(msg.sender);
        require(amount > 0, "No money");

        balanceOfUsers(msg.sender) = 0;
        (bool success, ) = msg.sender.call{value: amount}();
        require(success, "Failed to send ether");
    }

    function buyToken(uint256 tokenId) external payable {
        require(msg.value > minPrice, "Price should be greater than previous");
        address owner = ownerOf(tokenId);
        require(owner != address(0), "token not exist");

        balanceOfUsers(address) = msg.value + balanceOfUsers(address);
        transferFrom(owner, msg.sender, tokenId);
    }
}
