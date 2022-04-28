const { Description } = require("@ethersproject/properties");
const { expect } = require("chai");

describe("prince token contract", () => {

  let owner;
  let account1;
  let account2;
  let tokenInstance;
  let decimals;
  let Token;

  beforeEach('token contract', async () => {
    [owner, account1, account2, ...addre] = await ethers.getSigners();

    Token = await ethers.getContractFactory('tokenBuild');

    tokenInstance = await Token.deploy();

    decimals = await tokenInstance.decimals()
  });

  describe('initial tests', () => {
    it('check total supply is assigned to owner', async () => {
      const InitialOwnerBalance = await tokenInstance.balanceOf(owner.address);

      expect(await tokenInstance.totalSupply()).to.equals(InitialOwnerBalance);
    });
  });

  describe('transaction tests', () => {
    it('can tokens transfered from transfer function', async () => {
      let account1Balance, afterBalanceOwner;
      const initialBalanceOwner = await tokenInstance.balanceOf(owner.address);

      const passingAmount = await ethers.utils.parseUnits("100", decimals);
      await tokenInstance.transfer(account1.address, passingAmount);

      account1Balance = await tokenInstance.balanceOf(account1.address);
      afterBalanceOwner = await tokenInstance.balanceOf(owner.address);

      expect(Number(account1Balance)).to.equals(Number(passingAmount - (passingAmount / 1000)));
      expect(Number(initialBalanceOwner - passingAmount)).to.equals(Number(afterBalanceOwner));
    });

    it('can tokens 0.5 transfered from transfer function', async () => {
      let account1Balance, afterBalanceOwner;
      const initialBalanceOwner = await tokenInstance.balanceOf(owner.address);

      const passingAmount = await ethers.utils.parseUnits("0.5", decimals);
      await tokenInstance.transfer(account1.address, passingAmount);

      account1Balance = await tokenInstance.balanceOf(account1.address);
      afterBalanceOwner = await tokenInstance.balanceOf(owner.address);

      expect(Number(account1Balance)).to.equals(Number(passingAmount - (passingAmount / 1000)));
      expect(Number(initialBalanceOwner - passingAmount)).to.equals(Number(afterBalanceOwner));
    });

    it('can transfer if no sufficient tokens', async () => {
      const passingAmount = await ethers.utils.parseUnits("101", decimals);
      await expect(tokenInstance.connect(account1).transfer(owner.address, passingAmount)).to.be.revertedWith("Not sufficient PT to transfer");

      expect(await tokenInstance.balanceOf(account1.address)).to.equals(0);
    });

    it('can use transferFrom function', async () => {
      const InitialOwnerBalance = await tokenInstance.balanceOf(owner.address);
      const passingAmount = await ethers.utils.parseUnits("10000", decimals);
      const passingAmountForTransfer = await ethers.utils.parseUnits("1000", decimals);

      await tokenInstance.approve(account1.address, passingAmount);

      const InitialApproverBalance = await tokenInstance.allowance(owner.address, account1.address);

      await tokenInstance.connect(account1).transferFrom(owner.address, account2.address, passingAmountForTransfer);

      expect(Number(await tokenInstance.balanceOf(owner.address))).to.equals(Number(InitialOwnerBalance - passingAmountForTransfer));
      expect(Number(await tokenInstance.allowance(owner.address, account1.address))).to.equals(Number(InitialApproverBalance - passingAmountForTransfer));
      expect(Number(await tokenInstance.balanceOf(account2.address))).to.equals(Number(passingAmountForTransfer));
    });

    it('can make transfer by transferFrom if dont have enough tokens to owner', async () => {
      const passingAmount = await ethers.utils.parseUnits("9999999", decimals);

      await tokenInstance.transfer(account2.address, passingAmount);
      await tokenInstance.approve(account1.address, await ethers.utils.parseUnits("1", decimals));

      const InitialApproverBalance = await tokenInstance.allowance(owner.address, account1.address);

      await expect(tokenInstance.connect(account1).transferFrom(owner.address, account2.address, await ethers.utils.parseUnits("10", decimals))).to.be.revertedWith("Not Sufficient tokens to sender");

      expect(Number(await tokenInstance.balanceOf(account2.address))).to.equals(Number(passingAmount - (passingAmount / 1000)));
      expect(Number(InitialApproverBalance)).to.equals(Number(await ethers.utils.parseUnits("1", decimals)));
    });

    it('can make transfer by transferFrom if dont have enough tokens to approver', async () => {
      const passingAmount = await ethers.utils.parseUnits("1000", decimals);

      await tokenInstance.approve(account1.address, passingAmount);

      const InitialApproverBalance = await tokenInstance.allowance(owner.address, account1.address);

      await expect(tokenInstance.connect(account1).transferFrom(owner.address, account2.address, await ethers.utils.parseUnits("1001", decimals))).to.be.revertedWith("Not Sufficient tokens to approver");

      expect(Number(InitialApproverBalance)).to.equals(Number(passingAmount));
    });

  });

  describe('approval test', () => {
    it('can add approver', async () => {
      const passingAmount = await ethers.utils.parseUnits("10000", decimals);

      await tokenInstance.approve(account1.address, passingAmount);

      const balanceForUseApprover = await tokenInstance.allowance(owner.address, account1.address);

      expect(Number(balanceForUseApprover)).to.equals(Number(passingAmount));
    });

    it('can use approver without tokens', async () => {
      const passingAmount = await ethers.utils.parseUnits("10000000", decimals);

      await tokenInstance.transfer(account1.address, passingAmount);

      expect(await tokenInstance.balanceOf(owner.address)).to.equals(0);
      await expect(tokenInstance.approve(account1.address, await ethers.utils.parseUnits("100", decimals))).to.be.revertedWith("cant make approver because unsufficient tokens");
    });
  });

  describe('contact balance test', () => {
    it('can increase balance of contract after transaction', async () => {
      const initialBalanceOwner = await tokenInstance.balanceOf(owner.address);

      const passingAmount = await ethers.utils.parseUnits("1000", decimals);
      await tokenInstance.transfer(account1.address, passingAmount);

      const account1Balance = await tokenInstance.balanceOf(account1.address);
      const afterBalanceOwner = await tokenInstance.balanceOf(owner.address);
      const contractBalance = await tokenInstance.balanceOf(tokenInstance.address);

      expect(Number(initialBalanceOwner - passingAmount)).to.equals(Number(afterBalanceOwner));
      expect(Number(account1Balance)).to.equals(Number(passingAmount - (passingAmount / 1000)));
      expect(Number(contractBalance)).to.equals(Number((passingAmount / 1000)));
    });
  });
});
