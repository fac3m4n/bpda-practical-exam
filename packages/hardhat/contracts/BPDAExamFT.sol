// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract BPDAExamFT is ERC20, Ownable, Pausable {
    uint8 private _decimals = 18;
    
    constructor() ERC20("BPDAExamFT", "BPDA") Ownable(msg.sender) {
        _mint(msg.sender, 1991 * 10**decimals());
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
