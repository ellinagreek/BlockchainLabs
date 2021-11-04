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
    
    // событие
    event Payout(address player, uint amount);

    uint public bet; //ставка игрока
    uint public deposit; //депозит игрока
    uint public revealPeriod; // период времени для раскрытия выбора второго игрока

    Player[2] public players; // игроки
    uint public revealDeadline; // дата, до которой нужно раскрыть свой выбор
    Stage public stage = Stage.FirstPlayerCommit; // усттановка изначального этапа

    constructor(uint _bet, uint _deposit, uint _revealPeriod) public {
        bet = _bet;
        deposit = _deposit;
        revealPeriod = _revealPeriod;
    }
    

    function commit(bytes32 commitment) payable public {

        uint playerIndex;
        // опредление номера игрока
        if(stage == Stage.FirstPlayerCommit) playerIndex = 0;
        else if(stage == Stage.SecondPlayerCommit) playerIndex = 1;
        else revert(); // error handling

        uint commitAmount = bet + deposit;
        require(msg.value >= commitAmount);
        
        // отправляем лишнее себе
        if(msg.value > commitAmount) msg.sender.transfer(msg.value - commitAmount);
        
        // сохраняем информацию игрока
        players[playerIndex] = Player(msg.sender, commitment, Choice.None);

        // переходим ко второму коммиту или к первому раскрытию
        if(stage == Stage.FirstPlayerCommit) stage = Stage.SecondPlayerCommit;
        else stage = Stage.FirstPlayerReveal;
    }
    
    modifier CheckStageReveal() {
        require(stage == Stage.FirstPlayerReveal || stage == Stage.SecondPlayerReveal);
        _;
    }
    
    function reveal(Choice choice, bytes32 blindingFactor) public CheckStageReveal {
        require(choice == Choice.Rock || choice == Choice.Paper || choice == Choice.Scissors);
        
        // определение игрока
        uint playerIndex;
        if(players[0].playerAddress == msg.sender) playerIndex = 0;
        else if (players[1].playerAddress == msg.sender) playerIndex = 1;
        else revert();

        Player storage player = players[playerIndex]; 

        //сравниваем, что хэш игрока совпадает с тем выбором, который он раскрыл
        require(keccak256(abi.encodePacked(msg.sender, choice, blindingFactor)) == player.commitment);
        
        player.choice = choice;

        if(stage == Stage.FirstPlayerReveal) { 
            // задаем дедлайн для раскрытия выбора второго игрока
            revealDeadline = block.number + revealPeriod; 
            // переходим к раскрытию выбора второго игрока
            stage = Stage.SecondPlayerReveal;
        }
        // переходим к отправке денег
        else stage = Stage.CheckWinner;
    }

    modifier CheckStageWin() {
        require(stage == Stage.CheckWinner || (stage == Stage.SecondPlayerReveal && revealDeadline <= block.number));
        _;
    }
    
    function checkWinner() public CheckStageWin {
        uint player0Payout;
        uint player1Payout;
        // вычисление суммы выигрыша
        uint winningAmount = deposit + 2 * bet;

        //если выбор одинаковый, то возвращаем каждому игроку ставку и депозит
        if(players[0].choice == players[1].choice) {
            player0Payout = deposit + bet;
            player1Payout = deposit + bet;
        }

        // если один из игроков не сделал выбор, то он теряет свой депозит, а выигрыш отправляется тому, кто сделал выбор
        else if(players[0].choice == Choice.None) {
            player1Payout = winningAmount;
        }
        else if(players[1].choice == Choice.None) {
            player0Payout = winningAmount;
        }
        // оба игроа сделали разные выборы
        else if(players[0].choice == Choice.Rock) {
            if(players[1].choice == Choice.Paper) {
                // камень проигрывает бумаге
                player0Payout = deposit;
                player1Payout = winningAmount;
            }
            else if(players[1].choice == Choice.Scissors) {
                // камень бьет ножницы
                player0Payout = winningAmount;
                player1Payout = deposit;
            } 
            else revert();

        }
        else if(players[0].choice == Choice.Paper) {
            if(players[1].choice == Choice.Rock) {
                // бумага бьет камень
                player0Payout = winningAmount;
                player1Payout = deposit;
            }
            else if(players[1].choice == Choice.Scissors) {
                // бумага проигрывает ножнцам
                player0Payout = deposit;
                player1Payout = winningAmount;
            }
            else revert();
        }
        else if(players[0].choice == Choice.Scissors) {
            if(players[1].choice == Choice.Rock) {
                // ножницы проигрывают камню
                player0Payout = deposit;
                player1Payout = winningAmount;
            }
            else if(players[1].choice == Choice.Paper) {
                // ножницы бьют бумагу
                player0Payout = winningAmount;
                player1Payout = deposit;
            }
            else revert();
        }
        else revert();

        // отправка денег
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

