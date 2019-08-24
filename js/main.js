$(document).ready(function() {
    init();
    ParseFEN(START_FEN);
    PrintBoard();
    //comp();
    //revert();
});

function comp(){
    //ParseFEN(START_FEN);
    GenerateMoves();
    MakeMove(Board.aiMoveList[Math.floor(Math.random() * Board.aiMoveList.length)]);
    PrintBoard();
    CheckBoard();
}

function revert(){
    RevertLatestMove();
    PrintBoard();
    CheckBoard();
}

function init(){
    filerankboardsinit();
    hashkeysinit();
    sq120to64init();
    boardvarsinit();
}

function boardvarsinit(){

    //initalize blank board history arr
    for(let i = 0; i < MAX_GAME_MOVES; i++){
        Board.history.push(new HistoryObject(NOMOVE,0,0,0,0));
    }

}

function sq120to64init(){
    var file = FILES.fileA;
    var rank = RANKS.rank1;
    var sq = KEYSQUARES.A1;
    var sq64 = 0;

    for(let i = 0; i < NO_OF_SQUARES; i++){
        from120to64Index[i] = 65;
    }
    for(let i = 0; i < NO_OF_INTERNAL_SQUARES; i++){
        from64to120Index[i] = 120;
    }

    for(let rank = RANKS.rank1; rank <= RANKS.rank8; rank++){
        for(let file = FILES.fileA; file <= FILES.fileH; file++){
            sq = GetSquareIndex(file,rank);
            from120to64Index[sq] = sq64;
            from64to120Index[sq64] = sq;
            sq64++;
            sq++;
        }
    }

}

function filerankboardsinit(){
    var currSquare = KEYSQUARES.A1;
    
    for(let i = 0; i < NO_OF_SQUARES; i++){
        ranksBoard[i] = KEYSQUARES.ILLEGAL;
        filesBoard[i] = KEYSQUARES.ILLEGAL;
    }

    for(let r = RANKS.rank1; r <= RANKS.rank8; r++){
        for(let f = FILES.fileA; f <= FILES.fileH; f++){
            currSquare = GetSquareIndex(f,r);
            ranksBoard[currSquare] = r;
            filesBoard[currSquare] = f;
        }
    }
}

//hashkeys will give us a pseudo-unique value for every game state
function hashkeysinit(){

    var key = 0;
    var piece = PIECES.NONE;

    /*where 13 is number of pieces in PIECES - need a unique random  
    value for every piece/square combination (so, 1,680 of them!)
    defined by function: "pieceVal * NO_OF_SQUARES + squareIndex"
    (see board.GetPositionKey())*/
    for(let i = 0; 
      i < (13 * NO_OF_SQUARES) + NO_OF_SQUARES; i++){
        pieceKeys[i] = Random32Bit();
    }
    sideKey = Random32Bit();
    
    //16 is number of possible castle keys (by 4 flag bits)
    for(let i = 0; i < 16; i++){
        castleKeys[i] = Random32Bit();
    }

}