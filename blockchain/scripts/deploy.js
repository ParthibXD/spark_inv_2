const { ethers } = require("hardhat");

async function main() {
    const UserManagement = await ethers.getContractFactory("UserManagement");
    const userManagement = await UserManagement.deploy();

    await userManagement.waitForDeployment(); // Updated method here

    const address = await userManagement.getAddress(); // New way to get address

    console.log("UserManagement deployed to:", address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
