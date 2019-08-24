/* 
Class defintion:
Perft is short for performance test - meant to verify leaf node integrity
for an AI agent calculating potential moves up to a certain depth & ply.
Test files are stored in an .epd file extension, and contain a FEN number
for board generation, and expected leaf nodes at each depth from 1 to N.
Functions in this file will verify the integrity and ensure move generation
is producing the expected results.
*/

var pLeafNodes;


//DO NOT RUN YET, MAJOR BUG CAUSES BOARD.AIPLYSTART[] TO BE UPDATED INFINITELY, STOPS UPON 2048 ITERATIONS
function RunPerftTest(depth){
    PrintBoard();
    console.log("Starting test to depth: " + depth);;
    pLeafNodes = 0;
    var move;
    var moveNo = 0;
    //debugger;
    GenerateMoves();
    console.log("A");
    console.log("i: " + Board.aiPlyStart[Board.aiPlyNo]);
    console.log("i < " + Board.aiPlyStart[Board.aiPlyNo + 1]);
    console.log("aiPlyNo: " + Board.aiPlyNo);

    for(var i = Board.aiPlyStart[Board.aiPlyNo]; i < Board.aiPlyStart[Board.aiPlyNo + 1]; i++){
        //debugger;
        move = Board.aiMoveList[i];
        var uwu = MakeMove(move);
        if(!uwu){
            console.log("failed, returning.");
            return;
        }
        if(uwu){
            moveNo++;
            var cumulative = pLeafNodes;
            Perft(depth-1);
            RevertLatestMove();
            var oldNodes = pLeafNodes - cumulative;
            console.log("Move " + moveNo + " " + PrintMove(move) + " " + oldNodes);
        }
        //debugger;
    }
    console.log("Test complete: " + pLeafNodes + " leaf nodes visited.");
}

//recursive
function Perft(depth){
    if(depth <= 0){
        //base - arrival here implies a leaf node
        pLeafNodes++; return;
    }

    GenerateMoves();
    var move;

    for(var i = Board.aiPlyStart[Board.aiPlyNo]; i < Board.aiPlyStart[Board.aiPlyNo+1]; i++){
        move = Board.aiMoveList[i];
        if(MakeMove(move)){
            Perft(depth-1);
            RevertLatestMove();
        }
    }

    return;
}
