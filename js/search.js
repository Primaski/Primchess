var SEARCH = {};

SEARCH.nodeCount; //all nodes
SEARCH.failHigh; //move ordering percent
SEARCH.failHighFirst;
SEARCH.depth; //max: 64
SEARCH.time; 
SEARCH.start;
SEARCH.stop;
SEARCH.best; //best move found overall so far
SEARCH.pending;

/* Move Sorting by expected benefit:
1. PV Moves
2. Capturing Moves
3. Killer Moves (for beta cutoffs)
4. Frequently Visited Moves */
function Minimax(depth,alpha,beta){

}

function PlainMinimax(depth, alpha, beta){   
    if(depth <= 0) return EVALPOS_Default();

    if(SEARCH.nodes & 0xFFF) IsTimeUp();
    if(IsMoveRepetition() || Board.halfMoveClock >= 100) return 0;

    ++SEARCH.nodes;

    if(Board.aiPlyNo >= MAX_DEPTH){
        /* return evaluate */
    }
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

    for(let moveNo = Board.aiPlyStart[Board.aiPlyNo]; moveNo > Board.aiPlyStart[Board.aiPlyNo + 1]; moveNo++){
        currMove = Board.aiMoveList[moveNo];
        if(MakeMove(currMove)){
            ++legal;
            score = -PlainMinimax(depth-1, -alpha, -beta);
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
            }
        }
        if(alpha != oldalpha){

        }
    }
    return alpha;
}

function SearchPosition(){
    var currBest = NOMOVE;
    var bestScore = -inf;
    
    for(let currDepth = 1; currDepth <= SEARCH.depth; currDepth++){
        if(!SEARCH.stop){

        }else{
            SEARCH.best = currBest;
            SEARCH.pending = false;
        }
    }
}

function IsTimeUp(){
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