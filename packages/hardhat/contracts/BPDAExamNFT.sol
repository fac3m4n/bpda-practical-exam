// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BPDAExamNFT is ERC721, ERC2981, Ownable {
    uint256 private _nextTokenId;
    
    constructor() ERC721("BPDAExamNFT", "BPDANFT") Ownable(msg.sender) {
        // Set default royalty to 7%
        _setDefaultRoyalty(msg.sender, 700); // 700 = 7%
    }

    function mintToTeacher(address teacherAddr) public onlyOwner {
        uint256 tokenId = _nextTokenId++;
        _safeMint(teacherAddr, tokenId);
    }

    // Required override for supporting both ERC721 and ERC2981 interfaces
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}