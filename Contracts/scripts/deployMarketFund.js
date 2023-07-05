const { ethers } = require("hardhat");
const INITAL_TOKEN_COUNT = "1000000000000000000000000";
const BASE_TOKEN_PRICE = "1000000000000000"; //0.01

async function main() {
	const [deployer, signer1] = await ethers.getSigners();
	const token = await ethers.deployContract(
		"WUSDC",
		[INITAL_TOKEN_COUNT],
		deployer,
	);
	await token.waitForDeployment();
	console.log("Token deployed to:", token.target);
	console.log("Check the token balance of the deployer:");
	const balance = await token.balanceOf(deployer.address);
	console.log("Balance:", balance.toString());
	const fundMarket = await ethers.deployContract(
		"FundMarket",
		[token.target, BASE_TOKEN_PRICE, "Fund Token", "FTK"],
		deployer,
	);
	await fundMarket.waitForDeployment();

	console.log("Fund Market Deployed to", fundMarket.target);
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
