var PV_COUNT = 10000;

function ProbePVTable(){
    var i = Board.posKey % PV_COUNT;
    var expectedPv = Board.pvTable[i];
    return (expectedPv.posKey == Board.posKey) ? expectedPv.move : NOMOVE;
}

function StorePV(move){
    var i = Board.posKey % PV_COUNT;
    Board.pvTable[i].move = move;
    Board.pvTable[i].posKey = Board.posKey;
}
/*
function GetPVLine(depth){
    var move = ProbePVTable();
    for(var i = 0; (i < depth && move != NOMOVE); i++){
        MakeMove(move);
        Board.pvArray[i] = move;
        move = ProbePVTable();
    }
    while(Board.ply > 0) RevertLatestMove();
    return i;
}
 */

 function GetPVLine(depth){
    //debugger;
    var move = ProbePVTable();
    var i = 0;
    while(move != NOMOVE && i < depth){
        if(MoveExists(move)){
            MakeMove(move);
            Board.pvArray[i++] = move;
        }else{
            break;
        }
        move = ProbePVTable();
    }
    while(Board.aiPlyNo > 0){
        RevertLatestMove();
    }
    return i;
 }