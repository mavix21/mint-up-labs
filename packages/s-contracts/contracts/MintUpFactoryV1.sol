// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";


/**
 * @title MintUpFactoryV1 (USDC-only)
 * - Prices are in USDC smallest unit (usually 6 decimals)
 * - Token IDs: upper 128 bits = eventId, lower 128 bits = ticketIndex
 * - Uses SafeERC20 and ReentrancyGuard
 */
contract MintUpFactoryV1 is ERC1155, Ownable, ReentrancyGuard {
  using SafeERC20 for IERC20;

  IERC20 public immutable usdcToken;

  uint256 private constant TYPE_BITS = 128;
  uint256 private constant TYPE_MASK = (uint256(1) << TYPE_BITS) - 1;

  struct TicketParams {
    uint256 priceUSDC;
    uint256 maxSupply;      // 0 for unlimited
    uint256 mintsPerWallet; // 0 for unlimited
    string metadataURI;
  }

  struct TicketDetails {
    uint256 priceUSDC;
    uint256 maxSupply;
    uint256 mintedSupply;
    uint256 mintsPerWallet;
    string metadataURI;
  }

  struct EventInfo {
    address organizer;
    uint256 ticketTypeCount;
  }

  uint256 public _nextEventId;

  mapping(uint256 => EventInfo) public eventInfo;         // eventId => eventInfo
  mapping(uint256 => TicketDetails) public ticketDetails; // eventId => ticketDetails
  mapping(uint256 => mapping(address => uint256)) public mintsPerWallet; // tokenId => wallet => mints

  event EventCreated(uint256 indexed eventId, address indexed organizer, uint256 ticketCount);
  event TicketCreated(
    uint256 indexed tokenId,
    uint256 indexed eventId,
    uint256 indexed ticketIndex,
    uint256 priceUSDC,
    uint256 maxSupply
  );
  event TicketMinted(
    uint256 indexed tokenId,
    address indexed buyer,
    address indexed organizer
  );

  constructor(address initialOwner, address _usdcContractAddress) ERC1155("") Ownable(initialOwner) {
    require(_usdcContractAddress != address(0), "Invalid USDC address");
    usdcToken = IERC20(_usdcContractAddress);
    _nextEventId = 1;
  }

  function createEventWithTickets(
    address _organizer,
    TicketParams[] calldata _tickets
  ) external onlyOwner returns (uint256) {
    require(_organizer != address(0), "Invalid organizer address");
    require(_tickets.length > 0, "At least one ticket is required");

    uint256 eventId = _nextEventId;
    require(eventId < (uint256(1) << TYPE_BITS), "Event ID overflow");

    eventInfo[eventId] = EventInfo({
      organizer: _organizer,
      ticketTypeCount: _tickets.length
    });

    for (uint256 i = 0; i < _tickets.length; i++) {
      require(i < (uint256(1) << TYPE_BITS), "Ticket index overflow");
      uint256 tokenId = (eventId << TYPE_BITS) | i;

      ticketDetails[tokenId] = TicketDetails({
        priceUSDC: _tickets[i].priceUSDC,
        maxSupply: _tickets[i].maxSupply,
        mintsPerWallet: _tickets[i].mintsPerWallet,
        mintedSupply: 0,
        metadataURI: _tickets[i].metadataURI
      });

      emit URI(_tickets[i].metadataURI, tokenId);
      emit TicketCreated(tokenId, eventId, i, _tickets[i].priceUSDC, _tickets[i].maxSupply);
    }

    emit EventCreated(eventId, _organizer, _tickets.length);
    _nextEventId++;

    return eventId;
  }

  function mintTicket(uint256 _tokenId) external nonReentrant {
    uint256 eventId = _tokenId >> TYPE_BITS;
    EventInfo storage ev = eventInfo[eventId];
    require(ev.organizer != address(0), "Event not found");

    uint256 ticketIndex = _tokenId & TYPE_MASK;
    require(ticketIndex < ev.ticketTypeCount, "Invalid ticket type");

    TicketDetails storage t = ticketDetails[_tokenId];
    if (t.maxSupply > 0) {
      require(t.mintedSupply < t.maxSupply, "Ticket sold out");
    }
    if (t.mintsPerWallet > 0) {
      require(mintsPerWallet[_tokenId][msg.sender] < t.mintsPerWallet, "Max tickets per wallet reached");
    }

    t.mintedSupply++;
    if (t.mintsPerWallet > 0) {
      mintsPerWallet[_tokenId][msg.sender]++;
    }

    uint256 price = t.priceUSDC;
    if (price > 0) {
      usdcToken.safeTransferFrom(msg.sender, ev.organizer, price);
    }
    
    _mint(msg.sender, _tokenId, 1, "");
    emit TicketMinted(_tokenId, msg.sender, ev.organizer);
  }

  function uri(uint256 _tokenId) public view override returns (string memory) {
    uint256 eventId = _tokenId >> TYPE_BITS;
    require(eventInfo[eventId].organizer != address(0), "Token does not exist");
    return ticketDetails[_tokenId].metadataURI;
  }

  function getTokenId(uint256 eventId, uint256 ticketIndex) public pure returns (uint256) {
    require(eventId < (uint256(1) << TYPE_BITS) && ticketIndex < (uint256(1) << TYPE_BITS), "overflow");
    return (eventId << TYPE_BITS) | ticketIndex;
  }

  function extractEventId(uint256 tokenId) public pure returns (uint256) {
    return tokenId >> TYPE_BITS;
  }

  function extractTicketIndex(uint256 tokenId) public pure returns (uint256) {
    return tokenId & TYPE_MASK;
  }

  function getTicketDetails(uint256 tokenId) external view returns (
    uint256 priceUSDC,
    uint256 maxSupply,
    uint256 _mintsPerWallet,
    uint256 mintedSupply,
    string memory metadataURI,
    address organizer
  ) {
    TicketDetails storage t = ticketDetails[tokenId];
    EventInfo storage ev = eventInfo[tokenId >> TYPE_BITS];
    return (t.priceUSDC, t.maxSupply, t.mintsPerWallet, t.mintedSupply, t.metadataURI, ev.organizer);
  }

  function rescueERC20(address token, address to, uint256 amount) external onlyOwner {
    IERC20(token).safeTransfer(to, amount);
  }
}