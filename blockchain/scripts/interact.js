// scripts/interact.js
const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    const contractAbi = JSON.parse(fs.readFileSync("./artifacts/contracts/UserManagement.sol/UserManagement.json")).abi;

    const [deployer] = await ethers.getSigners();

    const userManagement = new ethers.Contract(contractAddress, contractAbi, deployer);

    console.log("Registering user...");
    const tx = await userManagement.registerUser("Alice", "Harvard", "Computer Science", 0);
    await tx.wait();
    console.log("User registered");

    const userInfo = await userManagement.getUser(deployer.address);
    console.log("User info:", userInfo);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
