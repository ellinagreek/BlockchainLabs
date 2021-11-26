const { expect } = require("chai");
const { ethers, waffle } = require("hardhat");
const provider = waffle.provider;

describe("Check deploy", function () {
    it("Valid attributes values", async function () {
        const Game = await ethers.getContractFactory("RockPaperScissors");
        const bet = 1;
        const revealPeriod = 1;
        const deposit = 1;
        const hardhatGame = await Game.deploy(bet, deposit, revealPeriod);
        expect(await hardhatGame.bet()).to.equal(bet); //check bet value
        expect(await hardhatGame.revealPeriod()).to.equal(revealPeriod); //check revealPeriod value
        expect(await hardhatGame.stage()).to.equal(0); //check stage
    });
});

describe("Check commit", function () {
    it("Check the first commit", async function () {
        const bet = 1;
        const revealPeriod = 1;
        const deposit = 1;
        const val = ethers.utils.parseEther("3.0")
        const Game = await ethers.getContractFactory("RockPaperScissors");
        const hardhatGame = await Game.deploy(bet, deposit, revealPeriod);
        const [owner] = await ethers.getSigners();
        const commitment = "0xD9A6815220B7D50D9702262FCECA64E10609438297FF28D2C03DEA093B07E58D"
        await hardhatGame.commit(commitment, {value: val});
        expect(await hardhatGame.stage()).to.equal(1); // check stage

        //await expect(hardhatGame.commit(commitment, {value: 1})).to.be.revertedWith(""); // check msg.value
    });
    it("Check the second commit", async function () {
        const bet = 1;
        const revealPeriod = 1;
        const deposit = 1;
        const Game = await ethers.getContractFactory("RockPaperScissors");
        const hardhatGame = await Game.deploy(bet, deposit, revealPeriod);
        const [owner] = await ethers.getSigners();
        const val = ethers.utils.parseEther("3.0")
        const commitment1 = "0xD9A6815220B7D50D9702262FCECA64E10609438297FF28D2C03DEA093B07E58D"
        const commitment2 = "0xAB11E0729BB7B7E54CD68EA6A88839302EF19331D6F2B22C2190628561FB9449"
        await hardhatGame.commit(commitment1, {value: val});
        await hardhatGame.commit(commitment2, {value: val});
        expect(await hardhatGame.stage()).to.equal(2); // check stage
    });
    it("Check reverts", async function () {
        const bet = 1;
        const revealPeriod = 1;
        const deposit = 1;
        const Game = await ethers.getContractFactory("RockPaperScissors");
        const hardhatGame = await Game.deploy(bet, deposit, revealPeriod);
        const [owner, address2] = await ethers.getSigners();
        const commitment1 = "0xD9A6815220B7D50D9702262FCECA64E10609438297FF28D2C03DEA093B07E58D";
        const commitment2 = "0xAB11E0729BB7B7E54CD68EA6A88839302EF19331D6F2B22C2190628561FB9449";
        const choice1 = 1;
        const choice2 = 2;
        const blindingFactor = "0x0000000000000000000000000000000000000000000000000000000000000001";
        const val = ethers.utils.parseEther("3.0");

        await expect(hardhatGame.commit(commitment1, {value: 1})).to.be.revertedWith(""); //check msg.value

        await hardhatGame.commit(commitment1, {value: val}); //check 3 commits
        await hardhatGame.connect(address2).commit(commitment2, {value: val});
        await expect(hardhatGame.commit(commitment1, {value: val})).to.be.revertedWith("");

        await hardhatGame.reveal(choice1, blindingFactor); //check commit after reveal
        await expect(hardhatGame.commit(commitment1, {value: val})).to.be.revertedWith("");

        await hardhatGame.connect(address2).reveal(choice2, blindingFactor);
        await expect(hardhatGame.connect(address2).commit(commitment2, {value: val})).to.be.revertedWith("");
    });
});

describe("Check reveal", function () {
    it("Check the first reveal", async function () {
        const bet = 1;
        const revealPeriod = 1;
        const deposit = 1;
        const Game = await ethers.getContractFactory("RockPaperScissors");
        const hardhatGame = await Game.deploy(bet, deposit, revealPeriod);
        const [owner, address2] = await ethers.getSigners();
        const commitment1 = "0xD9A6815220B7D50D9702262FCECA64E10609438297FF28D2C03DEA093B07E58D";
        const commitment2 = "0xAB11E0729BB7B7E54CD68EA6A88839302EF19331D6F2B22C2190628561FB9449";
        const choice1 = 1;
        const choice2 = 2;
        const blindingFactor = "0x0000000000000000000000000000000000000000000000000000000000000001";
        const blindingFactor2 = "0x0000000000000000000000000000000000000000000000000000000000000002";
        const val = ethers.utils.parseEther("3.0");
        await hardhatGame.commit(commitment1, {value: val});
        await hardhatGame.connect(address2).commit(commitment2, {value: val});
        await hardhatGame.reveal(choice1, blindingFactor);
        expect(await hardhatGame.stage()).to.equal(3);
    });
    it("Check the second reveal", async function () {
        const bet = 1;
        const revealPeriod = 1;
        const deposit = 1;
        const Game = await ethers.getContractFactory("RockPaperScissors");
        const hardhatGame = await Game.deploy(bet, deposit, revealPeriod);
        const [owner, address2] = await ethers.getSigners();
        const commitment1 = "0xD9A6815220B7D50D9702262FCECA64E10609438297FF28D2C03DEA093B07E58D";
        const commitment2 = "0xAB11E0729BB7B7E54CD68EA6A88839302EF19331D6F2B22C2190628561FB9449";
        const choice1 = 1;
        const choice2 = 2;
        const blindingFactor = "0x0000000000000000000000000000000000000000000000000000000000000001";
        const blindingFactor2 = "0x0000000000000000000000000000000000000000000000000000000000000002";
        const val = ethers.utils.parseEther("3.0");
        await hardhatGame.commit(commitment1, {value: val});
        await hardhatGame.connect(address2).commit(commitment2, {value: val});
        await hardhatGame.reveal(choice1, blindingFactor);
        await hardhatGame.connect(address2).reveal(choice2, blindingFactor);
        expect(await hardhatGame.stage()).to.equal(4);
    });
    it("Check reverts", async function () {
        const bet = 1;
        const revealPeriod = 1;
        const deposit = 1;
        const Game = await ethers.getContractFactory("RockPaperScissors");
        const hardhatGame = await Game.deploy(bet, deposit, revealPeriod);
        const [owner, address2] = await ethers.getSigners();
        const commitment1 = "0xD9A6815220B7D50D9702262FCECA64E10609438297FF28D2C03DEA093B07E58D";
        const commitment2 = "0xAB11E0729BB7B7E54CD68EA6A88839302EF19331D6F2B22C2190628561FB9449";
        const choice1 = 1;
        const choice2 = 2;
        const blindingFactor = "0x0000000000000000000000000000000000000000000000000000000000000001";
        const blindingFactor2 = "0x0000000000000000000000000000000000000000000000000000000000000002";
        const val = ethers.utils.parseEther("3.0");
        await hardhatGame.commit(commitment1, {value: val});
        await hardhatGame.connect(address2).commit(commitment2, {value: val});

        await expect(hardhatGame.reveal(choice2, blindingFactor)).to.be.revertedWith(""); //check the right choice

        await expect(hardhatGame.reveal(choice1, blindingFactor2)).to.be.revertedWith(""); //check the right blinding factor

        await expect(hardhatGame.reveal(4, blindingFactor)).to.be.revertedWith(""); //check the right choice type

        await expect(hardhatGame.connect(address2).reveal(choice1, blindingFactor)).to.be.revertedWith(""); //check address

        await hardhatGame.reveal(choice1, blindingFactor); //check 3 reveals
        await hardhatGame.connect(address2).reveal(choice2, blindingFactor);
        await expect(hardhatGame.reveal(choice1, blindingFactor)).to.be.revertedWith("");

        await hardhatGame.checkWinner();
        await expect(hardhatGame.reveal(choice1, blindingFactor)).to.be.revertedWith("");
    });
});

describe("Check winner checker", function () {
    it("Check case with equal choices", async function () {
        const bet = 1;
        const revealPeriod = 1;
        const deposit = 1;
        const Game = await ethers.getContractFactory("RockPaperScissors");
        const hardhatGame = await Game.deploy(bet, deposit, revealPeriod);
        const [owner, address2] = await ethers.getSigners();
        const commitment1 = "0xD9A6815220B7D50D9702262FCECA64E10609438297FF28D2C03DEA093B07E58D";
        const commitment2 = "0xECA65CAB0B8B0F9C233AAEE58F3E2E033CC44FF2DAAF0AA9A72CEA04A8201DEA";
        const choice1 = 1;
        const blindingFactor = "0x0000000000000000000000000000000000000000000000000000000000000001";
        const val = ethers.utils.parseEther("3.0");

        const player1InitialBalance = await provider.getBalance(owner.address);
        const player2InitialBalance = await provider.getBalance(address2.address);

        await hardhatGame.commit(commitment1, {value: val});
        await hardhatGame.connect(address2).commit(commitment2, {value: val});

        await hardhatGame.reveal(choice1, blindingFactor);
        await hardhatGame.connect(address2).reveal(choice1, blindingFactor);

        await hardhatGame.checkWinner();

        const player1ModifiedBalance = await provider.getBalance(owner.address);
        const player2ModifiedBalance = await provider.getBalance(address2.address);

        expect(player1ModifiedBalance).to.be.closeTo(player1InitialBalance,ethers.utils.parseEther("0.001"));
        expect(player2ModifiedBalance).to.be.closeTo(player2InitialBalance,ethers.utils.parseEther("0.001"));
    });
    it("Check case with deadline missing", async function () {
        const bet = 1;
        const revealPeriod = 1;
        const deposit = 1;
        const Game = await ethers.getContractFactory("RockPaperScissors");
        const hardhatGame = await Game.deploy(bet, deposit, revealPeriod);
        const [owner, address2] = await ethers.getSigners();
        const commitment1 = "0xD9A6815220B7D50D9702262FCECA64E10609438297FF28D2C03DEA093B07E58D";
        const commitment2 = "0xAB11E0729BB7B7E54CD68EA6A88839302EF19331D6F2B22C2190628561FB9449";
        const choice1 = 1;
        const choice2 = 2;
        const blindingFactor = "0x0000000000000000000000000000000000000000000000000000000000000001";
        const val = ethers.utils.parseEther("3.0");

        const player1InitialBalance = await provider.getBalance(owner.address);
        const player2InitialBalance = await provider.getBalance(address2.address);

        await hardhatGame.commit(commitment1, {value: val});
        await hardhatGame.connect(address2).commit(commitment2, {value: val});

        await hardhatGame.reveal(choice1, blindingFactor);
        //await hardhatGame.connect(address2).reveal(choice2, blindingFactor);

        for (let i = 0; i < revealPeriod; i++) {
            await network.provider.send("evm_mine");
        }

        await hardhatGame.checkWinner();

        const player1ModifiedBalance = await provider.getBalance(owner.address);
        const player2ModifiedBalance = await provider.getBalance(address2.address);

        expect(player1ModifiedBalance).to.be.closeTo(player1InitialBalance.add(bet),ethers.utils.parseEther("0.001"));
        expect(player2ModifiedBalance).to.be.closeTo(player2InitialBalance.sub(bet).sub(bet),ethers.utils.parseEther("0.001"));
    });
    it("Check win cases", async function () {
        const bet = 1;
        const revealPeriod = 1;
        const deposit = 1;
        const Game = await ethers.getContractFactory("RockPaperScissors");
        const Game2 = await ethers.getContractFactory("RockPaperScissors");
        const Game3 = await ethers.getContractFactory("RockPaperScissors");
        const [owner, address2] = await ethers.getSigners();
        const commitment1 = "0xD9A6815220B7D50D9702262FCECA64E10609438297FF28D2C03DEA093B07E58D";
        const commitment2 = "0xAB11E0729BB7B7E54CD68EA6A88839302EF19331D6F2B22C2190628561FB9449";
        const commitment3 = "0x85C0D710AD2FFABC01E02A3331F0C39BDF52265AB1DCCA892B400BBD798D866F";
        const commitment4 = "0xFC69CC4D7ADA0876BD7D7047F70791B38B7818E1F6445AFF93E3CF9D20AEE991";
        const choice1 = 1;
        const choice2 = 2;
        const choice3 = 3;
        const blindingFactor = "0x0000000000000000000000000000000000000000000000000000000000000001";
        const val = ethers.utils.parseEther("3.0");

        // paper beats rock
        const hardhatGame = await Game.deploy(bet, deposit, revealPeriod);
        const player1InitialBalance = await provider.getBalance(owner.address);
        const player2InitialBalance = await provider.getBalance(address2.address);

        await hardhatGame.commit(commitment1, {value: val});
        await hardhatGame.connect(address2).commit(commitment2, {value: val});

        await hardhatGame.reveal(choice1, blindingFactor);
        await hardhatGame.connect(address2).reveal(choice2, blindingFactor);


        await hardhatGame.checkWinner();

        const player1ModifiedBalance = await provider.getBalance(owner.address);
        const player2ModifiedBalance = await provider.getBalance(address2.address);

        expect(player2ModifiedBalance).to.be.closeTo(player2InitialBalance.add(2*bet),ethers.utils.parseEther("0.001"));
        expect(player1ModifiedBalance).to.be.closeTo(player1InitialBalance.sub(bet),ethers.utils.parseEther("0.001"));

        // rock beats scissors
        const hardhatGame2 = await Game2.deploy(bet, deposit, revealPeriod);
        const player1InitialBalance_2 = await provider.getBalance(owner.address);
        const player2InitialBalance_2 = await provider.getBalance(address2.address);

        await hardhatGame2.commit(commitment1, {value: val});
        await hardhatGame2.connect(address2).commit(commitment3, {value: val});

        await hardhatGame2.reveal(choice1, blindingFactor);
        await hardhatGame2.connect(address2).reveal(choice3, blindingFactor);


        await hardhatGame2.checkWinner();

        const player1ModifiedBalance_2 = await provider.getBalance(owner.address);
        const player2ModifiedBalance_2 = await provider.getBalance(address2.address);

        expect(player1ModifiedBalance_2).to.be.closeTo(player1InitialBalance_2.add(2*bet),ethers.utils.parseEther("0.001"));
        expect(player2ModifiedBalance_2).to.be.closeTo(player2InitialBalance_2.sub(bet),ethers.utils.parseEther("0.001"));

        // scissors beats paper
        const hardhatGame3 = await Game3.deploy(bet, deposit, revealPeriod);
        const player1InitialBalance_3 = await provider.getBalance(owner.address);
        const player2InitialBalance_3 = await provider.getBalance(address2.address);

        await hardhatGame3.commit(commitment4, {value: val});
        await hardhatGame3.connect(address2).commit(commitment3, {value: val});

        await hardhatGame3.reveal(choice2, blindingFactor);
        await hardhatGame3.connect(address2).reveal(choice3, blindingFactor);


        await hardhatGame3.checkWinner();

        const player1ModifiedBalance_3 = await provider.getBalance(owner.address);
        const player2ModifiedBalance_3 = await provider.getBalance(address2.address);

        expect(player2ModifiedBalance_3).to.be.closeTo(player2InitialBalance_3.add(2*bet),ethers.utils.parseEther("0.001"));
        expect(player1ModifiedBalance_3).to.be.closeTo(player1InitialBalance_3.sub(bet),ethers.utils.parseEther("0.001"));
    });
});

describe("Integration tests", function () {
    it("Check caller", async function () {
        const bet = 1;
        const revealPeriod = 1;
        const deposit = 1;
        const Game = await ethers.getContractFactory("RockPaperScissors");
        const hardhatGame = await Game.deploy(bet, deposit, revealPeriod);
        const [owner, address2] = await ethers.getSigners();
        const commitment1 = "0xD9A6815220B7D50D9702262FCECA64E10609438297FF28D2C03DEA093B07E58D";
        const val = ethers.utils.parseEther("3.0");

        const Call = await ethers.getContractFactory("Caller");
        const hardhatCall = await Call.deploy();

        await hardhatCall.callContract(hardhatGame.address, commitment1, {value: ethers.utils.parseEther("3.0")});
        expect(await hardhatGame.stage()).to.equal(1); //check stage
    });
});


