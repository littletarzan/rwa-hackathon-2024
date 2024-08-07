pragma solidity ^0.8.20;

/**
 * @title Standard Interface of ERC1594
 * https://github.com/SecurityTokenStandard/EIP-Spec/blob/master/contracts/ERC1594/IERC1594.sol
 */

interface IHTS1594 {

    // Transfers
    function transferWithData(address _to, uint256 _value, bytes memory _data) external;
    function transferFromWithData(address _from, address _to, uint256 _value, bytes memory _data) external;

    // Token Issuance
    function isIssuable() external view returns (bool);
    function issue(address _tokenHolder, uint256 _value, bytes memory _data) external;

    // Token Redemption
    function redeem(uint256 _value, bytes memory  _data) external;
    function redeemFrom(address _tokenHolder, uint256 _value, bytes memory _data) external;

    // Transfer Validity
    function canTransfer(address _to, uint256 _value, bytes memory  _data) external view returns (bool, bytes1, bytes32);
    function canTransferFrom(address _from, address _to, uint256 _value, bytes memory _data) external view returns (bool, bytes1, bytes32);

    // Issuance / Redemption Events
    event Issued(address indexed _operator, address indexed _to, uint256 _value, bytes _data);
    event Redeemed(address indexed _operator, address indexed _from, uint256 _value, bytes _data);

}