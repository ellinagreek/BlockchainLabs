pragma solidity ^0.4.24;

contract RockPaperScissors {
    enum Choice {
        None,
        Rock,
        Paper,
        Scissors
    }

    enum Stage {
        FirstPlayerCommit,
        SecondPlayerCommit,
        FirstPlayerReveal,
        SecondPlayerReveal,
        CheckWinner
    }

    struct Player { //CHANGE
        address playerAddress;
        bytes32 commitment;
        Choice choice;
    }
    
    // ᮡ�⨥
    event Payout(address player, uint amount);

    uint public bet; //�⠢�� ��ப�
    uint public deposit; //������� ��ப�
    uint public revealPeriod; // ��ਮ� �६��� ��� ������ �롮� ��ண� ��ப�

    Player[2] public players; // ��ப�
    uint public revealDeadline; // ���, �� ���ன �㦭� ������ ᢮� �롮�
    Stage public stage = Stage.FirstPlayerCommit; // ���⠭���� ����砫쭮�� �⠯�

    constructor(uint _bet, uint _deposit, uint _revealPeriod) public {
        bet = _bet;
        deposit = _deposit;
        revealPeriod = _revealPeriod;
    }
    

    function commit(bytes32 commitment) payable public {

        uint playerIndex;
        // ��।����� ����� ��ப�
        if(stage == Stage.FirstPlayerCommit) playerIndex = 0;
        else if(stage == Stage.SecondPlayerCommit) playerIndex = 1;
        else revert(); // error handling

        uint commitAmount = bet + deposit;
        require(msg.value >= commitAmount);
        
        // ��ࠢ�塞 ��譥� ᥡ�
        if(msg.value > commitAmount) msg.sender.transfer(msg.value - commitAmount);
        
        // ��࠭塞 ���ଠ�� ��ப�
        players[playerIndex] = Player(msg.sender, commitment, Choice.None);

        // ���室�� �� ��஬� ������� ��� � ��ࢮ�� ������
        if(stage == Stage.FirstPlayerCommit) stage = Stage.SecondPlayerCommit;
        else stage = Stage.FirstPlayerReveal;
    }
    
    modifier CheckStageReveal() {
        require(stage == Stage.FirstPlayerReveal || stage == Stage.SecondPlayerReveal);
        _;
    }
    
    function reveal(Choice choice, bytes32 blindingFactor) public CheckStageReveal {
        require(choice == Choice.Rock || choice == Choice.Paper || choice == Choice.Scissors);
        
        // ��।������ ��ப�
        uint playerIndex;
        if(players[0].playerAddress == msg.sender) playerIndex = 0;
        else if (players[1].playerAddress == msg.sender) playerIndex = 1;
        else revert();

        Player storage player = players[playerIndex]; 

        //�ࠢ������, �� ��� ��ப� ᮢ������ � ⥬ �롮஬, ����� �� ����
        require(keccak256(abi.encodePacked(msg.sender, choice, blindingFactor)) == player.commitment);
        
        player.choice = choice;

        if(stage == Stage.FirstPlayerReveal) { 
            // ������ ������� ��� ������ �롮� ��ண� ��ப�
            revealDeadline = block.number + revealPeriod; 
            // ���室�� � ������ �롮� ��ண� ��ப�
            stage = Stage.SecondPlayerReveal;
        }
        // ���室�� � ��ࠢ�� �����
        else stage = Stage.CheckWinner;
    }

    modifier CheckStageWin() {
        require(stage == Stage.CheckWinner || (stage == Stage.SecondPlayerReveal && revealDeadline <= block.number));
        _;
    }
    
    function checkWinner() public CheckStageWin {
        uint player0Payout;
        uint player1Payout;
        // ���᫥��� �㬬� �먣���
        uint winningAmount = deposit + 2 * bet;

        //�᫨ �롮� ���������, � �����頥� ������� ��ப� �⠢�� � �������
        if(players[0].choice == players[1].choice) {
            player0Payout = deposit + bet;
            player1Payout = deposit + bet;
        }

        // �᫨ ���� �� ��ப�� �� ᤥ��� �롮�, � �� ���� ᢮� �������, � �먣��� ��ࠢ����� ⮬�, �� ᤥ��� �롮�
        else if(players[0].choice == Choice.None) {
            player1Payout = winningAmount;
        }
        else if(players[1].choice == Choice.None) {
            player0Payout = winningAmount;
        }
        // ��� ��஠ ᤥ���� ࠧ�� �롮��
        else if(players[0].choice == Choice.Rock) {
            if(players[1].choice == Choice.Paper) {
                // ������ �ந��뢠�� �㬠��
                player0Payout = deposit;
                player1Payout = winningAmount;
            }
            else if(players[1].choice == Choice.Scissors) {
                // ������ ��� �������
                player0Payout = winningAmount;
                player1Payout = deposit;
            } 
            else revert();

        }
        else if(players[0].choice == Choice.Paper) {
            if(players[1].choice == Choice.Rock) {
                // �㬠�� ��� ������
                player0Payout = winningAmount;
                player1Payout = deposit;
            }
            else if(players[1].choice == Choice.Scissors) {
                // �㬠�� �ந��뢠�� ����栬
                player0Payout = deposit;
                player1Payout = winningAmount;
            }
            else revert();
        }
        else if(players[0].choice == Choice.Scissors) {
            if(players[1].choice == Choice.Rock) {
                // ������� �ந��뢠�� �����
                player0Payout = deposit;
                player1Payout = winningAmount;
            }
            else if(players[1].choice == Choice.Paper) {
                // ������� ���� �㬠��
                player0Payout = winningAmount;
                player1Payout = deposit;
            }
            else revert();
        }
        else revert();

        // ��ࠢ�� �����
        if(player0Payout != 0 && players[0].playerAddress.send(player0Payout)){
            emit Payout(players[0].playerAddress, player0Payout);            
        }
        if(player1Payout != 0 && players[1].playerAddress.send(player1Payout)){
            emit Payout(players[1].playerAddress, player1Payout);            
        }

        delete players;
        revealDeadline = 0;
        stage = Stage.FirstPlayerCommit;
    }
}

