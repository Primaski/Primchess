var SEARCH = {};
var currDepth;

SEARCH.nodeCount; //all nodes
SEARCH.failHigh; //move ordering percent
SEARCH.failHighFirst;
SEARCH.depth; //max: 64
SEARCH.time; 
SEARCH.start;
SEARCH.stop;
SEARCH.best; //best move found overall so far
SEARCH.pending;
SEARCH.detailed;

function SearchDetailed(){
    SearchPosition(true);
}

function SearchPosition(detailedStats= false){
    //debugger;
    var currBest = NOMOVE;
    var bestScore = -inf;
    var line;
    
    ClearForSearch();
    currDepth = 1; //used in detailedMM
    SEARCH.detailed = detailedStats;
    SEARCH.depth = 5;

    for(currDepth = 1; currDepth <= SEARCH.depth; currDepth++){
        if(!SEARCH.stop){
            bestScore = Minimax(currDepth,-inf,inf,detailedStats);
            bestMove = ProbePVTable();
            //console.log("uwu-" +  PrintMove(bestMove));
            line = "D:" + currDepth + " Best: " + PrintMove(bestMove)
                + " Score: " + bestScore + " nodes: " + SEARCH.nodes + " PV: ";
            var pvno = GetPVLine(currDepth);
            for(let i = 0; i < pvno; i++){
                line += " " + PrintMove(Board.pvArray[i]);
            }
            console.log(line);
        }
    } 
    SEARCH.best = currBest;
    SEARCH.pending = false;
}

/* Move Sorting by expected benefit:
1. PV Moves
2. Capturing Moves
3. Killer Moves (for beta cutoffs)
4. Frequently Visited Moves */

/* Some unexpected errors atm when calling Minimax from SearchPosition(), for example
aiPlyNo >= 2 results in displayed of -infinity, and nodes searched does NOT take
advantage of alpha-beta reductions (ex: depth 5 should display 230,531 leaf searches, but 
instead displays over 5,000,000 < which also means too MANY leaf nodes are being accounted) - next part to fix.  */
function Minimax(depth, alpha, beta){
    ++SEARCH.nodes;
    if(depth <= 0) return EVALPOS_Default();
    //if(SEARCH.nodes & 0xFFF) IsTimeUp();
    if(IsMoveRepetition() || Board.halfMoveClock >= 100) return 0;

    if(Board.aiPlyNo >= MAX_DEPTH){
        EVALPOS_Default();
    }
    var inCheck = IsSquareAttacked(Board.indexByPieceType[PieceIndex(Kings[Board.side],0)],Board.side^1);
    if(inCheck) ++depth; //not sure if i understand why?
    var score = -inf;
    GenerateMoves();

    /*GetPV() - The Principle Variation Move -> likely best move down 
    this line, search this line first for improved alpha cutoff*/

    /*GetPV();*/
    /*OrderPV(); */

    var legal = 0;
    var oldalpha = alpha; //to update PVtable
    var bestMove = NOMOVE;
    var currMove = NOMOVE;

    for(let moveNo = Board.aiPlyStart[Board.aiPlyNo]; moveNo < Board.aiPlyStart[Board.aiPlyNo + 1]; moveNo++){
        currMove = Board.aiMoveList[moveNo];
        if(currDepth == 4 && depth == 4 && PrintMove(currMove) == "E2E3"){ /*debugger;*/ }
        var line = "dep " + depth + ": " + PrintMove(bestMove);
        if(MakeMove(currMove)){
            /*
            d1 => d2d4
            d2 => d2d4 d7d5
            d3 => d2d4 d7d5 e2e4
            *point of failure (d4,d5)
            d4 => b1c3 d7d5 d2d4 [e7e5 <-- stop here]
		    d5 => e2e3 e7e5 d1g4 f8d6
		    */	
            /* debug over failed PV path */
            if(currDepth == 4 && depth == 1 && 
                PrintMove(currMove) == "E7E5" &&
                Board.pieces[GetSquareIndex(FILES.fileC,RANKS.rank3)] == PIECES.wknight &&
                Board.pieces[GetSquareIndex(FILES.fileD,RANKS.rank5)] == PIECES.bpawn &&
                Board.pieces[GetSquareIndex(FILES.fileD,RANKS.rank4)] == PIECES.wpawn &&
                Board.pieces[GetSquareIndex(FILES.fileE,RANKS.rank5)] == PIECES.bpawn 
                ) { PrintBoard(); debugger; }
            if(SEARCH.detailed) DetailMM(depth);
            ++legal;
            score = -Minimax(depth-1, -beta, -alpha);
            //if(score == 75){PrintBoard(); debugger;}
            RevertLatestMove(currMove);

            if(SEARCH.stop) return 0;

            if(score > alpha){
                if(score >= beta){
                    //comment out 2 bottom lines for improved efficiency
                    if(legal == 1) ++SEARCH.failHighFirst;
                    ++SEARCH.failHigh;
                    /*killer moves => triggered beta cutoff */
                    return beta;
                }
                bestMove = currMove;
                alpha = score;
                if(alpha == -10 && currDepth == 4){ /*debugger;*/ }
            }
        }
    }
    if(legal == 0){
        /* checkmate or stalemate */
        return (inCheck) ? (-CHECKMATE + Board.aiPlyNo) : 0;
    }
    if(alpha != oldalpha) StorePV(bestMove);
    return alpha;
}

function IsTimeUp(){
    if(SEARCH.detailed) return false;
    if(( $.now() - SEARCH.start ) > SEARCH.time){
        SEARCH.stop = true;
        return true;
    }
    return false;
}

function IsMoveRepetition(){
    for(let i = Board.currHistoryPly - Board.halfMoveClock;
        i < Board.currHistoryPly - 1; i++){
        if(Board.posKey == Board.history[i].poskey){
            return true;
        }
    }
    return false;
    /*note: i at (historyPly - halfMoveClock) instead of (historyPly) is a matter of efficiency -
    if the fifty move clock were reset, a pawn was moved, or a capture was made. both of these
    are irreversable moves, and thus cannot be repeated, reducing amount of array to search */
}

function ClearForSearch(){
    for(let i = 0; i < 14 * NO_OF_SQUARES; i++){
        Board.searchHistory[i] = 0;
    }
    for(let i = 0; i < 3 * MAX_DEPTH; i++){
        Board.searchKillers[i] = 0;
    }
    ClearPVTable();
    SEARCH.nodes = SEARCH.failHigh = SEARCH.failHighFirst = 0;
    SEARCH.start = $.now();
    SEARCH.stop = false;
}

function ClearPVTable(){
    for(let i = 0; i < PV_COUNT; i++){
        Board.pvTable[i].move = NOMOVE;
        Board.pvTable[i].posKey = 0;
    }
}

function DetailMM(depth){
    /* base case
    if(currDepth != SEARCH.depth){
        return;
    }*/
    PrintBoard();
    console.log("depth: " + depth);
    console.log("Press F8 to advance (chrome debugger)");
    debugger;
}