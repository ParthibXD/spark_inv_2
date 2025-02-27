require('dotenv').config();
const { ethers } = require('hardhat');

async function main() {
    const contractAddress = process.env.CONTRACT_ADDRESS;
    const privateKey = process.env.PRIVATE_KEY;

    const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
    const wallet = new ethers.Wallet(privateKey, provider);

    console.log('Using wallet address:', wallet.address);

    const UserManagement = require('../artifacts/contracts/UserManagement.sol/UserManagement.json');
    const contract = new ethers.Contract(contractAddress, UserManagement.abi, wallet);

    const owner = await contract.owner();
    console.log('Contract owner:', owner);

    if (wallet.address.toLowerCase() !== owner.toLowerCase()) {
        console.error('ERROR: You are not the contract owner! Only the owner can add universities.');
        return;
    }

    const universityAddress = '0x1234567890123456789012345678901234567890'; // Replace with actual university address

    try {
        const tx = await contract.addUniversity(universityAddress);
        await tx.wait();
        console.log('University added successfully:', universityAddress);
    } catch (error) {
        console.error('Error adding university:', error);
    }
}

main().catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
});
