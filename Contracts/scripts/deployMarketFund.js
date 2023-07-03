const { ethers } = require("hardhat");
const INITAL_SUPPLY = "10000000000000000000000"; // 10000

async function main() {
	console.log("Deploying WUSDC Token");
	//const wusdcContract = await ethers.getContractFactory("WUSDC");
	const wusdc = await ethers.deployContract("WUSDC", ["10000"]);
	await wusdc.waitForDeployment();
	console.log(`WUSDC Contract Deployed at ${wusdc}`);
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
