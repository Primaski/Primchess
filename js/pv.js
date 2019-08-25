var PV_COUNT = 10000;

function ProbePVTable(){
    var i = Board.posKey % PV_COUNT;
    var currPv = Board.pvTable[i];
    return (currPv.posKey == Board.posKey) ? currPv.move : NOMOVE;
}

/* TO-DO: LEFT OFF ON LESSON 45 */