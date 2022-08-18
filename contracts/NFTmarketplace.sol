// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
error NFTmarketplace__PriceMustBeAboveZero();
error NFTmarketplace__NotApprovedForMarketPlace();
error NFTmarketplace__AlreadyListed(address nftAddress, uint256 tokenId);
error NFTmarketplace__NotOwner();
error NFTmarketplace__NotListed(address nftAddress, uint256 tokenId);
error NFTmarketplace__NoProceeds();
error NFTmarketplace__NoSuccess();
error NFTmarketplace__PriceNotMet(
    address nftAddress,
    uint256 tokenId,
    uint256 price
);

contract NFTmarketplace is ReentrancyGuard {
    struct Listing {
        address seller;
        uint256 price;
    }
    // NFT address -> NFT tokenId -> Listing
    mapping(address => mapping(uint256 => Listing)) private s_listings;
    //seller address -> amount earn
    mapping(address => uint) private s_process;
    //event
    event ItemListed(
        address indexed seller,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );
    event ItemBought(
        address indexed buyer,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );
    event ItemCanceled(
        address indexed seller,
        address indexed nftAddress,
        uint256 indexed tokenId
    );
    // modifier
    modifier notListed(
        address nftAddress,
        uint256 tokenId,
        address owner
    ) {
        Listing memory listing = s_listings[nftAddress][tokenId];
        if (listing.price > 0) {
            revert NFTmarketplace__AlreadyListed(nftAddress, tokenId);
        }
        _;
    }
    modifier isOwner(
        address nftAddress,
        uint256 tokenId,
        address spender
    ) {
        IERC721 nft = IERC721(nftAddress);
        address owner = nft.ownerOf(tokenId);
        if (spender != owner) {
            revert NFTmarketplace__NotOwner();
        }
        _;
    }
    modifier isListed(address nftAddress, uint256 tokenId) {
        Listing memory listing = s_listings[nftAddress][tokenId];
        if (listing.price < 0) {
            revert NFTmarketplace__NotListed(nftAddress, tokenId);
        }
        _;
    }

    ///@dev listItem function will take nft address and tokenid of that particular nft and
    /// some amount of price to list that nft on market place
    function listItem(
        address nftAddress,
        uint256 tokenId,
        uint256 price
    )
        external
        notListed(nftAddress, tokenId, msg.sender)
        isOwner(nftAddress, tokenId, msg.sender)
    {
        if (price <= 0) {
            revert NFTmarketplace__PriceMustBeAboveZero();
        }
        IERC721 nft = IERC721(nftAddress);
        if (nft.getApproved(tokenId) != address(this)) {
            revert NFTmarketplace__NotApprovedForMarketPlace();
        }
        s_listings[nftAddress][tokenId] = Listing(msg.sender, price);
        emit ItemListed(msg.sender, nftAddress, tokenId, price);
    }

    ///@notice enough money
    function buyItem(address nftAddress, uint256 tokenId)
        external
        payable
        isListed(nftAddress, tokenId)
    {
        Listing memory listedItem = s_listings[nftAddress][tokenId];
        if (msg.value < listedItem.price) {
            revert NFTmarketplace__PriceNotMet(
                nftAddress,
                tokenId,
                listedItem.price
            );
        }
        // this will update track how much seller has earn money
        s_process[listedItem.seller] = s_process[listedItem.seller] + msg.value;
        //once someone buy that nft, we will remove that nft from listing
        delete (s_listings[nftAddress][tokenId]); //by this way nft will remove from listing
        // now we will transfer that nft to buyer
        IERC721(nftAddress).safeTransferFrom(
            listedItem.seller,
            msg.sender, // msg.sender means the person who call this contract
            tokenId
        ); // by this way we can transfer nft to buyer with token id
        emit ItemBought(msg.sender, nftAddress, tokenId, listedItem.price); //this will check wheather nft is tranfer or not
    }

    function cancelListing(address nftAddress, uint256 tokenId)
        external
        isOwner(nftAddress, tokenId, msg.sender)
        isListed(nftAddress, tokenId)
    {
        // by this way we can remove that nft or unlisted
        delete (s_listings[nftAddress][tokenId]);
        emit ItemCanceled(msg.sender, nftAddress, tokenId);
    }

    function updateListing(
        address nftAddress,
        uint256 tokenId,
        uint256 newPrice
    )
        external
        isListed(nftAddress, tokenId)
        isOwner(nftAddress, tokenId, msg.sender)
    {
        s_listings[nftAddress][tokenId].price = newPrice;
        emit ItemListed(msg.sender, nftAddress, tokenId, newPrice);
    }

    function withdrawProceeds() external payable {
        uint256 proceeds = s_process[msg.sender];
        if (proceeds <= 0) {
            revert NFTmarketplace__NoProceeds();
        }
        s_process[msg.sender] = 0;
        (bool success, ) = payable(msg.sender).call{value: proceeds}("");
        if (!success) {
            revert NFTmarketplace__NoSuccess();
        }
    }

    //getter functions
    function getListing(address nftAddress, uint256 tokenId)
        external
        view
        returns (Listing memory)
    {
        return s_listings[nftAddress][tokenId];
    }

    function getProceeds(address seller) external view returns (uint256) {
        return s_process[seller];
    }
}
