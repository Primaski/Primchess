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

/* TO-DO: LEFT OFF ON LESSON 46 */