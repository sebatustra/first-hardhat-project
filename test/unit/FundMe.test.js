const { deployments, ethers, getNamedAccounts } = require("hardhat");
const {assert, expect} = require("chai");
const {developmentChains} = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async function() {

        let fundMe;
        let deployer;
        let mockV3Aggregator;
        const sendValue = ethers.utils.parseEther("1") //1eth

        beforeEach(async function () {
            deployer = (await getNamedAccounts()).deployer
            await deployments.fixture(["all"]);
            fundMe = await ethers.getContract("FundMe", deployer);
            mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer);
        })

        describe("constructor", async function() {

            it ("sets the aggregator addresses correctly", async function () {
                const response = await fundMe.getPriceFeed();
                assert.equal(response, mockV3Aggregator.address)
            })
        })

        describe("fund", async function() {
            it("Fails if you don't send enough eth", async function() {
                await expect(fundMe.fund()).to.be.revertedWith("You need to spend more ETH!");
            })
            it("updates the amount funded data structure", async function() {
                await fundMe.fund({value: sendValue});
                const response = await fundMe.getAddressToAmountFunded(deployer);
                assert.equal(response.toString(), sendValue.toString());
            })
            it("adds the sender to funders", async function() {
                await fundMe.fund({value: sendValue});
                const response = await fundMe.getFunder(0);
                assert.equal(response, deployer);
            })
        })

        describe("withdraw", async function() {
            beforeEach(async function () {
                await fundMe.fund({value: sendValue});
            })
            it("Withdraw eth from a single founder", async function () {
                //step1: arrange the test
                const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
                const startingDeployerBalance = await fundMe.provider.getBalance(deployer)

                //step2: act
                const transactionResponse = await fundMe.withdraw();
                const transactionReceipt = await transactionResponse.wait(1);

                const { gasUsed, effectiveGasPrice } = transactionReceipt

                const gasCost = gasUsed.mul(effectiveGasPrice) ;

                const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
                const endingDeployerBalance = await fundMe.provider.getBalance(deployer)

                //step3: run the assert
                assert.equal(endingFundMeBalance, 0);
                assert.equal(
                    startingFundMeBalance.add(startingDeployerBalance).toString(),
                    endingDeployerBalance.add(gasCost).toString()
                )
            })
            it("allows us to withdraw with multiple funders", async function() {
                //arrange the test
                const accounts = await ethers.getSigners();
                for (let i = 1; i < 6; i++){
                    const fundMeConnectedContract = await fundMe.connect(accounts[i]);
                    await fundMeConnectedContract.fund({value: sendValue});
                }
                const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
                const startingDeployerBalance = await fundMe.provider.getBalance(deployer);

                //act
                const transactionResponse = await fundMe.withdraw();
                const transactionReceipt = await transactionResponse.wait(1);

                const { gasUsed, effectiveGasPrice } = transactionReceipt;
                const gasCost = gasUsed.mul(effectiveGasPrice);

                const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
                const endingDeployerBalance = await fundMe.provider.getBalance(deployer)

                //step3: run the assert
                assert.equal(endingFundMeBalance, 0);
                assert.equal(
                    startingFundMeBalance.add(startingDeployerBalance).toString(),
                    endingDeployerBalance.add(gasCost).toString()
                )

                //make sure funders are reset properly
                await expect(fundMe.getFunder(0)).to.be.reverted

                for (let i = 1; i < 6; i++) {
                    assert.equal(await fundMe.getAddressToAmountFunded(accounts[i].address), 0)
                }
            })
            it("CHEAPER WITHDRAW MANY FUNDERS", async function() {
                //arrange the test
                const accounts = await ethers.getSigners();
                for (let i = 1; i < 6; i++){
                    const fundMeConnectedContract = await fundMe.connect(accounts[i]);
                    await fundMeConnectedContract.fund({value: sendValue});
                }
                const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
                const startingDeployerBalance = await fundMe.provider.getBalance(deployer);

                //act
                const transactionResponse = await fundMe.cheaperWithdraw();
                const transactionReceipt = await transactionResponse.wait(1);

                const { gasUsed, effectiveGasPrice } = transactionReceipt;
                const gasCost = gasUsed.mul(effectiveGasPrice);

                const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
                const endingDeployerBalance = await fundMe.provider.getBalance(deployer)

                //step3: run the assert
                assert.equal(endingFundMeBalance, 0);
                assert.equal(
                    startingFundMeBalance.add(startingDeployerBalance).toString(),
                    endingDeployerBalance.add(gasCost).toString()
                )

                //make sure funders are reset properly
                await expect(fundMe.getFunder(0)).to.be.reverted

                for (let i = 1; i < 6; i++) {
                    assert.equal(await fundMe.getAddressToAmountFunded(accounts[i].address), 0)
                }
            })
            it("CHEAPERWITHDRAW SINGLE FUNDER", async function () {
                //step1: arrange the test
                const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
                const startingDeployerBalance = await fundMe.provider.getBalance(deployer)

                //step2: act
                const transactionResponse = await fundMe.cheaperWithdraw();
                const transactionReceipt = await transactionResponse.wait(1);

                const { gasUsed, effectiveGasPrice } = transactionReceipt

                const gasCost = gasUsed.mul(effectiveGasPrice) ;

                const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
                const endingDeployerBalance = await fundMe.provider.getBalance(deployer)

                //step3: run the assert
                assert.equal(endingFundMeBalance, 0);
                assert.equal(
                    startingFundMeBalance.add(startingDeployerBalance).toString(),
                    endingDeployerBalance.add(gasCost).toString()
                )
            })
            it("only allows the owner to withdraw", async function () {
                const accounts = await ethers.getSigners();
                const attacker = accounts[1]
                const attackerConntectedContract = await fundMe.connect(attacker);


                await expect(attackerConntectedContract.withdraw()).to.be.revertedWith("FundMe__NotOwner");
            })
        })
    })
