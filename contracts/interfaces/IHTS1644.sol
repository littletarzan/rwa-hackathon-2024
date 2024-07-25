pragma solidity ^0.8.20;

interface IHTS1644 {

    // Controller Operation
    // https://github.com/SecurityTokenStandard/EIP-Spec/blob/master/contracts/ERC1644/IERC1644.sol
    function isControllable() external view returns (bool);
    function controllerTransfer(address _from, address _to, uint256 _value, bytes memory _data, bytes memory _operatorData) external;
    function controllerRedeem(address _tokenHolder, uint256 _value, bytes memory _data, bytes memory _operatorData) external;

    // Controller Events
    event ControllerTransfer(
        address _controller,
        address indexed _from,
        address indexed _to,
        uint256 _value,
        bytes _data,
        bytes _operatorData
    );

    event ControllerRedemption(
        address _controller,
        address indexed _tokenHolder,
        uint256 _value,
        bytes _data,
        bytes _operatorData
    );

}