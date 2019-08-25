
function MOVE(from, to, captured = PIECES.NONE, promoted = PIECES.NONE, flag = 0){
    return ((from) | (to << 7) | (captured << 14) | 
      (promoted << 20) | (flag));
}

function AddCaptureMove(move){
    //end of moveList Index
    /*
    var newMoveIndex = Board.aiPlyStart[Board.aiPlyNo + 1];

    Board.aiMoveList[newMoveIndex] = move;
    Board.aiMoveScores[newMoveIndex] = 0;

    //move was added, increment moveList Index
    Board.aiPlyStart[Board.aiPlyNo + 1]++; */
    Board.aiMoveList[Board.aiPlyStart[Board.aiPlyNo+1]] = move;
    Board.aiMoveScores[Board.aiPlyStart[Board.aiPlyNo+1]++] = 0;
}

function AddQuietMove(move){
    Board.aiMoveList[Board.aiPlyStart[Board.aiPlyNo+1]] = move;
    Board.aiMoveScores[Board.aiPlyStart[Board.aiPlyNo+1]++] = 0;  
}

function AddEnPassantMove(move){
    Board.aiMoveList[Board.aiPlyStart[Board.aiPlyNo+1]] = move;
    Board.aiMoveScores[Board.aiPlyStart[Board.aiPlyNo+1]++] = 0;
}

function AddPromotionMove(from, to, capturing = PIECES.NONE){
    if(Board.side == COLOR.WHITE){
        AddCaptureMove( MOVE(from, to, capturing, PIECES.wqueen) );
        AddCaptureMove( MOVE(from, to, capturing, PIECES.wrook) );
        AddCaptureMove( MOVE(from, to, capturing, PIECES.wbishop) );
        AddCaptureMove( MOVE(from, to, capturing, PIECES.wknight) );
    }else{
        AddCaptureMove( MOVE(from, to, capturing, PIECES.bqueen) );
        AddCaptureMove( MOVE(from, to, capturing, PIECES.brook) );
        AddCaptureMove( MOVE(from, to, capturing, PIECES.bbishop) );
        AddCaptureMove( MOVE(from, to, capturing, PIECES.bknight) );
    }
    return;
}

/*
Board.plyStart[] -> 
    index for the first move at a given ply (pointer for moveList)
Board.moveList[index] -> 
    list of all possible moves at any given ply
*/

function GenerateMoves(){
    //new ply
    Board.aiPlyStart[Board.aiPlyNo + 1] = Board.aiPlyStart[Board.aiPlyNo];
    DeterminePawnMoves();
    DetermineKnightMoves();
    DetermineBishopMoves();
    DetermineRookMoves();
    DetermineQueenMoves();
    DetermineKingMoves();
    DetermineCastleMoves();
}

function DeterminePawnMoves(){
    var sq, moveTo, attackMoveTo;
    var locations = [];
    var pType = (Board.side == COLOR.WHITE) ? PIECES.wpawn : PIECES.bpawn;
    var forward = (Board.side == COLOR.WHITE) ? 10 : -10;
    var pawnDoubleMoveRank = (Board.side == COLOR.WHITE) ? RANKS.rank2 : RANKS.rank7;
    var enemyColor = (Board.side == COLOR.WHITE) ? COLOR.BLACK : COLOR.WHITE;

    //get positions
    for(pNo = 0; pNo < Board.pieceCount[pType]; pNo++){
        sq = Board.indexByPieceType[PieceIndex(pType,pNo)];
        locations.push(sq);
    }

    //determine moves for pawn
    locations.forEach(function(moveFrom){
        moveTo = moveFrom + forward;
        //non-attacking - directly forward
        if(Board.pieces[moveTo] == PIECES.NONE){
            //if(moveFrom == 81){ debugger; }
            if(ranksBoard[moveFrom] == pawnDoubleMoveRank && 
                Board.pieces[moveFrom + forward * 2] == PIECES.NONE){
                    AddQuietMove( MOVE(moveFrom, (moveFrom + forward * 2), PIECES.NONE, PIECES.NONE, FLAG_PAWNSTART));
                    //console.log("quiet move for " + GetFileRank(moveFrom) + " is possible");
            }
            if((ranksBoard[moveFrom] == RANKS.rank7 && ranksBoard[moveTo] == RANKS.rank8) ||
               (ranksBoard[moveFrom] == RANKS.rank2 && ranksBoard[moveTo] == RANKS.rank1)){
                AddPromotionMove(moveFrom, moveTo);
            }
            AddQuietMove( MOVE(moveFrom, moveTo) );
            //console.log("standard move for " + GetFileRank(moveFrom) + " is possible");
        }

        //attacking
        dirPawn.some(function(atkdifferen) {
            atkdifferen = (Board.side == COLOR.BLACK) ? -atkdifferen : atkdifferen;
            attackMoveTo = moveFrom + atkdifferen;

            if(PIECECOLOR[Board.pieces[attackMoveTo]] == enemyColor){
                if((ranksBoard[moveFrom] == RANKS.rank7 && ranksBoard[moveTo] == RANKS.rank8) ||
                   (ranksBoard[moveFrom] == RANKS.rank2 && ranksBoard[moveTo] == RANKS.rank1)){
                    AddPromotionMove(moveFrom, attackMoveTo, Board.pieces[attackMoveTo]);
                }else{
                    AddCaptureMove( MOVE(moveFrom, attackMoveTo, Board.pieces[attackMoveTo]) );
                    //console.log("pawn can capture from " + GetFileRank);
                }
            }

            if(attackMoveTo == Board.enPassant){
                AddEnPassantMove( MOVE( moveFrom, attackMoveTo, PIECES.NONE, PIECES.NONE, FLAG_ENPASSANT ) );
            }

        });
    });

}

function DetermineKnightMoves(){
    var sq, moveTo, dir;
    var piece = (Board.side == COLOR.WHITE) ? PIECES.wknight : PIECES.bknight;
    var enemyColor = (Board.side == COLOR.WHITE) ? COLOR.BLACK : COLOR.WHITE;

    for(pceNo = 0; pceNo < Board.pieceCount[piece]; pceNo++){
        sq = Board.indexByPieceType[PieceIndex(piece, pceNo)];
        for(let i = 0; i < dirCountByPiece[piece]; i++){
            dir = dirKnight[i];
            moveTo = sq + dir;
            if(!IsSquareOffboard(moveTo)){
                if(Board.pieces[moveTo] != PIECES.NONE){
                    if(PIECECOLOR[Board.pieces[moveTo]] == enemyColor){
                        AddCaptureMove( MOVE(sq,moveTo,Board.pieces[moveTo]) );
                    }
                }else{
                    AddQuietMove( MOVE(sq,moveTo) );
                }
            }
        } 
    }
}

function DetermineBishopMoves(){
    var sq, moveTo, dir;
    var piece = (Board.side == COLOR.WHITE) ? PIECES.wbishop : PIECES.bbishop;
    var enemyColor = (Board.side == COLOR.WHITE) ? COLOR.BLACK : COLOR.WHITE;
    
    for(pceNo = 0; pceNo < Board.pieceCount[piece]; pceNo++){
        sq = Board.indexByPieceType[PieceIndex(piece, pceNo)];
        for(let i = 0; i < dirCountByPiece[piece]; i++){
            dir = dirBishop[i];
            moveTo = sq + dir;

            while(!IsSquareOffboard(moveTo)){
                if(Board.pieces[moveTo] != PIECES.NONE){
                    if(PIECECOLOR[Board.pieces[moveTo]] == enemyColor){
                        AddCaptureMove( MOVE(sq,moveTo,Board.pieces[moveTo]) );
                    }
                    break; //can't capture beyond, blocked
                }else{
                    AddQuietMove( MOVE(sq,moveTo) );
                }
                moveTo += dir; //continue moving diagonally
            }
        }
    }
}

function DetermineRookMoves(){
    var sq, moveTo, dir;
    var piece = (Board.side == COLOR.WHITE) ? PIECES.wrook : PIECES.brook;
    var enemyColor = (Board.side == COLOR.WHITE) ? COLOR.BLACK : COLOR.WHITE;

    for(pceNo = 0; pceNo < Board.pieceCount[piece]; pceNo++){
        sq = Board.indexByPieceType[PieceIndex(piece, pceNo)];
        for(let i = 0; i < dirCountByPiece[piece]; i++){
            dir = dirRook[i];
            moveTo = sq + dir;

            while(!IsSquareOffboard(moveTo)){
                if(Board.pieces[moveTo] != PIECES.NONE){
                    if(PIECECOLOR[Board.pieces[moveTo]] == enemyColor){
                        AddCaptureMove( MOVE(sq,moveTo,Board.pieces[moveTo]) );
                    }
                    break; //can't capture beyond, blocked
                }else{
                    AddQuietMove( MOVE(sq,moveTo) );
                }
                moveTo += dir; //continue moving horiz. or vert.
            }
        }
    }
}

function DetermineQueenMoves(){
    var sq, moveTo, dir;
    var piece = (Board.side == COLOR.WHITE) ? PIECES.wqueen : PIECES.bqueen;
    var enemyColor = (Board.side == COLOR.WHITE) ? COLOR.BLACK : COLOR.WHITE;

    for(pceNo = 0; pceNo < Board.pieceCount[piece]; pceNo++){
        sq = Board.indexByPieceType[PieceIndex(piece, pceNo)];
        for(let i = 0; i < dirCountByPiece[piece]; i++){
            dir = dirQueen[i];
            moveTo = sq + dir;

            while(!IsSquareOffboard(moveTo)){
                if(Board.pieces[moveTo] != PIECES.NONE){
                    if(PIECECOLOR[Board.pieces[moveTo]] == enemyColor){
                        AddCaptureMove( MOVE(sq,moveTo,Board.pieces[moveTo]) );
                    }
                    break; //can't capture beyond, blocked
                }else{
                    AddQuietMove( MOVE(sq,moveTo) );
                }
                moveTo += dir; //continue in direction
            }
        }
    }
}

function DetermineKingMoves(){
    var sq, moveTo, dir;
    var piece = (Board.side == COLOR.WHITE) ? PIECES.wking : PIECES.bking;
    var enemyColor = (Board.side == COLOR.WHITE) ? COLOR.BLACK : COLOR.WHITE;

    /*if(Board.aiPlyNo == 2 && Board.pieces[45] != PIECES.NONE){
        console.log(PIECECHAR[Board.pieces[45]]);
        debugger;
    }*/

    for(pceNo = 0; pceNo < Board.pieceCount[piece]; pceNo++){
        sq = Board.indexByPieceType[PieceIndex(piece, pceNo)];
        for(let i = 0; i < dirCountByPiece[piece]; i++){
            dir = dirKing[i];
            moveTo = sq + dir;

            if(!IsSquareOffboard(moveTo)){
                if(IsSquareAttacked(moveTo,enemyColor)){
                    continue; //can't move into check
                }
                if(Board.pieces[moveTo] != PIECES.NONE){
                    if(PIECECOLOR[Board.pieces[moveTo]] == enemyColor){
                        AddCaptureMove( MOVE(sq,moveTo,Board.pieces[moveTo]) );
                    }
                }else{
                    AddQuietMove( MOVE(sq,moveTo) );
                }
            }
        }
    }
}

function DetermineCastleMoves(){
    if(Board.side == COLOR.WHITE){
        //do you have permission to kingside castle?
        if(Board.castlePerm & CASTLEBIT.wk){
            //is your path to the rook clear?
            if(Board.pieces[KEYSQUARES.F1] == PIECES.NONE && 
               Board.pieces[KEYSQUARES.G1] == PIECES.NONE){
                //are you safe from being or crossing in check?
                if(!IsSquareAttacked(KEYSQUARES.E1, COLOR.BLACK) &&
                   !IsSquareAttacked(KEYSQUARES.F1, COLOR.BLACK) &&
                   !IsSquareAttacked(KEYSQUARES.G1, COLOR.BLACK)){
                    AddQuietMove( MOVE(KEYSQUARES.E1, KEYSQUARES.G1, PIECES.NONE, 
                        PIECES.NONE, FLAG_CASTLE ) );
                }
            } 
        }
        //do you have permission to queenside castle?
        if(Board.castlePerm & CASTLEBIT.wq){
            //is your path to the rook clear?
            if(Board.pieces[KEYSQUARES.B1] == PIECES.NONE && 
               Board.pieces[KEYSQUARES.C1] == PIECES.NONE &&
               Board.pieces[KEYSQUARES.D1] == PIECES.NONE){ 
                //are you safe from being or crossing in check?
                if(!IsSquareAttacked(KEYSQUARES.C1, COLOR.BLACK) &&
                   !IsSquareAttacked(KEYSQUARES.D1, COLOR.BLACK) &&
                   !IsSquareAttacked(KEYSQUARES.E1, COLOR.BLACK)){
                    AddQuietMove( MOVE(KEYSQUARES.E1, SQUARES.C1, PIECES.NONE, 
                        PIECES.NONE, FLAG_CASTLE ) );
                }
            } 
        }
    }else{
        //do you have permission to kingside castle?
        if(Board.castlePerm & CASTLEBIT.bk){
            //is your path to the rook clear?
            if(Board.pieces[KEYSQUARES.F8] == PIECES.NONE && 
               Board.pieces[KEYSQUARES.G8] == PIECES.NONE){
                //are you safe from being or crossing in check?
                if(!IsSquareAttacked(KEYSQUARES.E8, COLOR.WHITE) &&
                   !IsSquareAttacked(KEYSQUARES.F8, COLOR.WHITE) &&
                   !IsSquareAttacked(KEYSQUARES.G8, COLOR.WHITE)){
                    AddQuietMove( MOVE(KEYSQUARES.E8, KEYSQUARES.G8, PIECES.NONE, 
                        PIECES.NONE, FLAG_CASTLE ) );
                }
            } 
        }
        //do you have permission to queenside castle?
        if(Board.castlePerm & CASTLEBIT.bq){
            //is your path to the rook clear?
            if(Board.pieces[KEYSQUARES.B8] == PIECES.NONE && 
               Board.pieces[KEYSQUARES.C8] == PIECES.NONE &&
               Board.pieces[KEYSQUARES.D8] == PIECES.NONE){ 
                //are you safe from being or crossing in check?
                if(!IsSquareAttacked(KEYSQUARES.C8, COLOR.WHITE) &&
                   !IsSquareAttacked(KEYSQUARES.D8, COLOR.WHITE) &&
                   !IsSquareAttacked(KEYSQUARES.E8, COLOR.WHITE)){
                    AddQuietMove( MOVE(KEYSQUARES.E8, KEYSQUARES.C8, PIECES.NONE, 
                        PIECES.NONE, FLAG_CASTLE ) );
                }
            } 
        }
    }
    return;
}
