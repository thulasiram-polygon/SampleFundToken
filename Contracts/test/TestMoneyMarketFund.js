const {
	time,
	loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const INITAL_TOKEN_COUNT = "1000000000000000000000000"; //1M
const INITIAL_FUND_TOKENS = "1000000000"; //1Billion
const BASE_TOKEN_PRICE = "1000000000000000"; //0.01
const BASE_RATE = "100000000000000"; //.001
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
// Roles
// const FUND_ADMIN_ROLE = ethers.utils.keccak256("FUND_ADMIN_ROLE");
// const SHAREHOLDER_ROLE = ethers.utils.keccak256("SHAREHOLDER_ROLE");

describe("Fund Token", function () {
	async function deployMarketFundFixture() {
		// Contracts are deployed using the first signer/account by default
		const [
			owner,
			fundManager,
			user1,
			user2,
			user3,
			user4,
			user5,
			user6,
			user7,
			user8,
			user9,
			user10,
		] = await ethers.getSigners();

		const wusdc = await ethers.deployContract(
			"WUSDC",
			[INITAL_TOKEN_COUNT],
			owner,
		);
		await wusdc.waitForDeployment();
		console.log("WUSDC Token deployed to:", wusdc.target);
		console.log("Check the wusdc token balance of the deployer:");
		const balance = await wusdc.balanceOf(owner.address);
		console.log(" Owner Balance:", balance.toString());
		const fundMarket = await ethers.deployContract(
			"FundMarket",
			[wusdc.target, BASE_TOKEN_PRICE, "Fund Token", "FTK"],
			owner,
		);
		await fundMarket.waitForDeployment();

		console.log("Fund Market Deployed to", fundMarket.target);
		//console.log("Owner & Fundmarket owner", owner, await fundMarket.owner());

		return {
			owner,
			fundManager,
			user1,
			user2,
			user3,
			user4,
			user5,
			user6,
			user7,
			user8,
			user9,
			user10,
			wusdc,
			fundMarket,
		};
	}
	// Test Deployment
	describe("Deployment", async function () {
		it("Should be able to deploy WUSDC, Fund Tokens & Mints WUSDC to Owner", async function () {
			const { owner, wusdc, fundMarket } = await loadFixture(
				deployMarketFundFixture,
			);
			expect(wusdc.target).not.eqls(ZERO_ADDRESS);
			expect(fundMarket.target).not.eqls(ZERO_ADDRESS);
		});

		it("Deployer(owner) is the default Fund Admin", async function () {
			const { owner, wusdc, fundMarket } = await loadFixture(
				deployMarketFundFixture,
			);
			expect(wusdc.balanceOf(owner)).not.eqls(0);
			expect(await fundMarket.getFundAdmin()).to.equal(owner.address);
		});
	});

	// // Test Owner Can change the fund admin
	describe("Changing Fund Admin", async function () {
		it("Test Owner Can change the Fund Admin", async function () {
			const { owner, fundMarket, fundManager } = await loadFixture(
				deployMarketFundFixture,
			);
			// By default the owner is the Fund admin
			expect(await fundMarket.getFundAdmin()).to.equal(owner.address);
			//console.log(`Fund manager address ${fundManager.address}`);
			// Owner chaged other address as a Fund Admin
			await fundMarket.connect(owner).changeFundAdmin(fundManager.address);
			//console.log(await fundMarket.getFundAdmin());
			expect(await fundMarket.getFundAdmin()).to.equal(fundManager.address);
			// Owner is no longer a Fund Admin
			expect(await fundMarket.getFundAdmin()).not.equal(owner.address);
		});
	});

	// // Test Fund Manager Can Whitelist User as a Shareholder

	describe("Adding Shareholders", async function () {
		it("Fund Manager Can Whitelist User as a Shareholder", async function () {
			const { owner, fundMarket, fundManager, user1 } = await loadFixture(
				deployMarketFundFixture,
			);

			// Owner chaged other address as a Fund Admin
			await fundMarket.connect(owner).changeFundAdmin(fundManager.address);
			// Add user1 as a shareholder
			// Check if ShareholderAdded event got emited
			expect(
				await fundMarket.connect(fundManager).addShareHolder(user1.address),
			)
				.to.emit(fundMarket, "ShareholderAdded")
				.withArgs(user1.address);
		});
	});

	// Whitelisted users can buy the fund token with WUSDC token
	describe("Buying Tokens", async function () {
		it(" Whitelisted users can buy the fund token with WUSDC token", async function () {
			const { owner, wusdc, fundMarket, fundManager, user1 } =
				await loadFixture(deployMarketFundFixture);
			// Owner chaged other address as a Fund Admin
			await fundMarket.connect(owner).changeFundAdmin(fundManager.address);
			// Fund admin added user1 as a shareholder
			await fundMarket.connect(fundManager).addShareHolder(user1.address);
			// Mint WUSDC tokens for the user
			await wusdc.connect(user1).mintForMe(INITAL_TOKEN_COUNT);
			//console.log(Number(userBalance));
			expect(await wusdc.balanceOf(user1.address)).to.equal(INITAL_TOKEN_COUNT);
			// Allow user to spend the WUSDC tokens
			await wusdc.connect(user1).approve(fundMarket.target, INITAL_TOKEN_COUNT);

			expect(await wusdc.allowance(user1.address, fundMarket.target)).to.equal(
				INITAL_TOKEN_COUNT,
			);
			// Buy tokens for the user with all the tokens
			await fundMarket.connect(user1).purchaseFund(INITAL_TOKEN_COUNT);
			// check if the tokens are increased
			//console.log(Number(await fundMarket.balanceOf(user1.address)));
			expect(await fundMarket.balanceOf(user1.address)).to.equal(
				INITIAL_FUND_TOKENS,
			);
		});
	});

	// Whitelisted users can liquidate tokens and get WUSDC tokens
	describe("Buying Tokens", async function () {
		it(" Whitelisted users can buy the fund token with WUSDC token", async function () {
			const { owner, wusdc, fundMarket, fundManager, user1 } =
				await loadFixture(deployMarketFundFixture);
			// Owner chaged other address as a Fund Admin
			await fundMarket.connect(owner).changeFundAdmin(fundManager.address);
			// Fund admin added user1 as a shareholder
			await fundMarket.connect(fundManager).addShareHolder(user1.address);
			// Mint WUSDC tokens for the user
			await wusdc.connect(user1).mintForMe(INITAL_TOKEN_COUNT);
			// Allow user to spend the WUSDC tokens
			await wusdc.connect(user1).approve(fundMarket.target, INITAL_TOKEN_COUNT);
			// Buy tokens for the user with all the tokens
			await fundMarket.connect(user1).purchaseFund(INITAL_TOKEN_COUNT);
			// check if the tokens are increased
			//console.log(Number(await fundMarket.balanceOf(user1.address)));
			// WUSDC balance should be zero for user
			expect(await wusdc.balanceOf(user1.address)).to.equal(0);
			// user can liquidate the fund
			await fundMarket.connect(user1).fullLiquidationOfFund();
			// User fund tokens balance should be zero
			expect(await fundMarket.balanceOf(user1.address)).to.equal(0);
			// users WUSDC tokens count should be increased
			expect(await wusdc.balanceOf(user1.address)).to.equal(INITAL_TOKEN_COUNT);
		});
	});

	// Fund manager can distribute dividents.
	describe("Distributing dividents", async function () {
		it("  Fund manager can distribute dividents", async function () {
			const { owner, wusdc, fundMarket, fundManager, user1, user2 } =
				await loadFixture(deployMarketFundFixture);
			// Owner chaged other address as a Fund Admin
			await fundMarket.connect(owner).changeFundAdmin(fundManager.address);
			// Fund admin added user1 as a shareholder
			await fundMarket.connect(fundManager).addShareHolder(user1.address);
			// Add user2 as shareholder
			await fundMarket.connect(fundManager).addShareHolder(user2.address);

			// Mint WUSDC tokens for the user
			await wusdc.connect(user1).mintForMe(INITAL_TOKEN_COUNT);
			await wusdc.connect(user2).mintForMe(INITAL_TOKEN_COUNT);

			// Allow users to spend the WUSDC tokens
			await wusdc.connect(user1).approve(fundMarket.target, INITAL_TOKEN_COUNT);
			await wusdc.connect(user2).approve(fundMarket.target, INITAL_TOKEN_COUNT);

			// Buy tokens for the user with all the tokens
			await fundMarket.connect(user1).purchaseFund(INITAL_TOKEN_COUNT);
			await fundMarket.connect(user2).purchaseFund(INITAL_TOKEN_COUNT);

			// Get the initial tokens value
			const initalFundTokensForUSER1 = await fundMarket.balanceOf(
				user1.address,
			);
			const initalFundTokensForUSER2 = await fundMarket.balanceOf(
				user2.address,
			);
			// console.log(
			// 	`initalFundTokensForUSER1 ${initalFundTokensForUSER1}`,
			// 	`initalFundTokensForUSER2 ${initalFundTokensForUSER2}`,
			// );

			// // Fund admin will distribute dividients
			await fundMarket
				.connect(fundManager)
				.distributeDividend(BASE_RATE, BASE_TOKEN_PRICE);

			const newBalanceUSER1 = await fundMarket.balanceOf(user1.address);
			const newBalanceUSER2 = await fundMarket.balanceOf(user2.address);
			// console.log(
			// 	`newBalanceUSER1 ${newBalanceUSER1}`,
			// 	`newBalanceUSER2 ${newBalanceUSER2}`,
			// );
			// New balnce should be more then the previous one
			expect(newBalanceUSER1).is.greaterThan(initalFundTokensForUSER1);
			expect(newBalanceUSER2).is.greaterThan(initalFundTokensForUSER2);
		});
	});
});
