// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Marketplace is ReentrancyGuard {
    uint256 private _listingIds;

    enum TokenType { FUNGIBLE, NON_FUNGIBLE }

    struct Listing {
        uint256 listingId;
        address seller;
        address tokenAddress;
        TokenType tokenType;
        uint256 tokenId;
        uint256 quantity;
        uint256 price;
        bool active;
    }

    mapping(uint256 => Listing) public listings;
    mapping(address => uint256[]) private userListings;
    mapping(address => uint256[]) private userPurchases;

    event TokenListed(
        uint256 indexed listingId,
        address indexed seller,
        address tokenAddress,
        uint256 tokenId,
        uint256 quantity,
        uint256 price
    );

    event TokenPurchased(
        uint256 indexed listingId,
        address indexed buyer,
        address indexed seller,
        uint256 quantity,
        uint256 price
    );

    event ListingRemoved(uint256 indexed listingId, address indexed seller);

    function listToken(
        address tokenAddress,
        TokenType tokenType,
        uint256 tokenId,
        uint256 quantity,
        uint256 price
    ) external returns (uint256) {
        require(price > 0, "Price must be greater than zero");
        require(quantity > 0, "Quantity must be greater than zero");

        if (tokenType == TokenType.FUNGIBLE) {
            IERC20 token = IERC20(tokenAddress);
            require(token.balanceOf(msg.sender) >= quantity, "Insufficient token balance");
            require(token.allowance(msg.sender, address(this)) >= quantity, "Insufficient token allowance");
        } else {
            IERC721 token = IERC721(tokenAddress);
            require(token.ownerOf(tokenId) == msg.sender, "Not token owner");
            require(token.getApproved(tokenId) == address(this), "Token not approved");
            require(quantity == 1, "NFT quantity must be 1");
        }

        _listingIds++;
        uint256 listingId = _listingIds;

        listings[listingId] = Listing({
            listingId: listingId,
            seller: msg.sender,
            tokenAddress: tokenAddress,
            tokenType: tokenType,
            tokenId: tokenId,
            quantity: quantity,
            price: price,
            active: true
        });

        userListings[msg.sender].push(listingId);

        emit TokenListed(listingId, msg.sender, tokenAddress, tokenId, quantity, price);
        return listingId;
    }

    function buyToken(uint256 listingId, uint256 quantity) external payable nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.active, "Listing is not active");
        require(quantity > 0 && quantity <= listing.quantity, "Invalid quantity");
        require(msg.value >= listing.price * quantity, "Insufficient payment");

        if (listing.tokenType == TokenType.FUNGIBLE) {
            IERC20(listing.tokenAddress).transferFrom(listing.seller, msg.sender, quantity);
        } else {
            require(quantity == 1, "NFT quantity must be 1");
            IERC721(listing.tokenAddress).transferFrom(listing.seller, msg.sender, listing.tokenId);
        }

        listing.quantity -= quantity;
        if (listing.quantity == 0) {
            listing.active = false;
        }

        payable(listing.seller).transfer(msg.value);
        userPurchases[msg.sender].push(listingId);

        emit TokenPurchased(listingId, msg.sender, listing.seller, quantity, listing.price * quantity);
    }

    function removeListing(uint256 listingId) external {
        Listing storage listing = listings[listingId];
        require(listing.seller == msg.sender, "Not the seller");
        require(listing.active, "Listing not active");

        listing.active = false;
        emit ListingRemoved(listingId, msg.sender);
    }

    function getListings() external view returns (Listing[] memory) {
        uint256 activeCount = 0;
        for (uint256 i = 1; i <= _listingIds; i++) {
            if (listings[i].active) {
                activeCount++;
            }
        }

        Listing[] memory activeListings = new Listing[](activeCount);
        uint256 index = 0;
        for (uint256 i = 1; i <= _listingIds; i++) {
            if (listings[i].active) {
                activeListings[index] = listings[i];
                index++;
            }
        }
        return activeListings;
    }

    function getMyListings() external view returns (Listing[] memory) {
        uint256[] storage userListingIds = userListings[msg.sender];
        Listing[] memory myListings = new Listing[](userListingIds.length);
        
        for (uint256 i = 0; i < userListingIds.length; i++) {
            myListings[i] = listings[userListingIds[i]];
        }
        return myListings;
    }

    function getPurchasedTokens() external view returns (Listing[] memory) {
        uint256[] storage purchaseIds = userPurchases[msg.sender];
        Listing[] memory purchasedListings = new Listing[](purchaseIds.length);
        
        for (uint256 i = 0; i < purchaseIds.length; i++) {
            purchasedListings[i] = listings[purchaseIds[i]];
        }
        return purchasedListings;
    }
}