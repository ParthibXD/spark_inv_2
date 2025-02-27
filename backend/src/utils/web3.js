const { ethers } = require('ethers');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

const contractAddress = process.env.CONTRACT_ADDRESS;
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL); // Hardhat local node

const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider); // Use wallet, not just signer

const abi = JSON.parse(fs.readFileSync('../blockchain/artifacts/contracts/UserManagement.sol/UserManagement.json', 'utf-8')).abi;

const userManagement = new ethers.Contract(contractAddress, abi, wallet); // Use wallet here

module.exports = userManagement;
