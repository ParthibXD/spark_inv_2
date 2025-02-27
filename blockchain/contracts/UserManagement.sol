// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract UserManagement {
    enum Role { Student, Alumni }

    struct User {
        string name;
        string university;
        string expertise;
        Role role;
        bool isVerified;
        uint256 reputation;
    }

    address public owner;
    mapping(address => User) public users;
    mapping(address => bool) public universities;

    event UserRegistered(address indexed user, string name, Role role);
    event UserVerified(address indexed user);
    event ReputationUpdated(address indexed user, uint256 reputation);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    modifier onlyUniversity() {
        require(universities[msg.sender], "Only verified university can perform this action");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function getOwner() external view returns (address) {
        return owner;
    }


    function registerUser(string memory _name, string memory _university, string memory _expertise, Role _role) external {
        require(bytes(users[msg.sender].name).length == 0, "User already registered");
        users[msg.sender] = User(_name, _university, _expertise, _role, false, 0);
        emit UserRegistered(msg.sender, _name, _role);
    }

    function verifyUser(address _user) external onlyUniversity {
        require(bytes(users[_user].name).length != 0, "User not found");
        require(!users[_user].isVerified, "User already verified");
        users[_user].isVerified = true;
        emit UserVerified(_user);
    }

    function updateReputation(address _user, uint256 _points) external onlyOwner {
        require(bytes(users[_user].name).length != 0, "User not found");
        users[_user].reputation += _points;
        emit ReputationUpdated(_user, users[_user].reputation);
    }

    function addUniversity(address _university) external onlyOwner {
        universities[_university] = true;
    }

    function removeUniversity(address _university) external onlyOwner {
        universities[_university] = false;
    }

    function getUser(address _user) external view returns (User memory) {
        return users[_user];
    }
}