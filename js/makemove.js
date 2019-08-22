function MakeMove(move){
    var from = MoveFromSq(move);
    var to = MoveToSq(move);
    var side = Board.side;
    var captured = MoveCaptured(move);
    var dir = (side == COLOR.WHITE)? -10 : 10;

    //special types of moves
    if(MoveIsEnPassant(move)){
        ClearPiece(to+dir);
    }else if(MoveIsCastle(move)){
        switch(to){
            case KEYSQUARES.C1:
                MovePiece(KEYSQUARES.A1, KEYSQUARES.D1); 
                break;
            case KEYSQUARES.C8: 
                MovePiece(KEYSQUARES.A8, KEYSQUARES.D8); 
                break;
            case KEYSQUARES.G1: 
            MovePiece(KEYSQUARES.H1, KEYSQUARES.F1);
                break;
            case KEYSQUARES.G8: 
            MovePiece(KEYSQUARES.H8, KEYSQUARES.F8);
                break;
            default: 
                console.log("Critical castling error");
                break;
        }
    }

    //hash out en passant - expires after one turn
    if(Board.enPassant != 0){
        HASH_EN_PASSANT();
    }
    HASH_CASTLE(); //hash out castle

    //store previous move data
    Board.history[Board.currHistoryPly].move = move;
    Board.history[Board.currHistoryPly].fiftyMove = Board.fiftyMove;
    Board.history[Board.currHistoryPly].enPas = Board.enPassant;
    Board.history[Board.currHistoryPly].castlePerm = Board.castlePerm;

    //update castle perms (bitwise and only affects rooks and kings)
    Board.castlePerm &= CastlePerm[to];
    Board.castlePerm &= CastlePerm[from];

    //now reset en passant
    Board.enPassant = 0;

    //hash in
    HASH_CASTLE();

    Board.fiftyMove += 1;
    if(MoveIsCapture(move)){
        ClearPiece(to);
        Board.fiftyMove = 0;
    }

    Board.aiPlyNo += 1;
    Board.currHistoryPly += 1;

    if(isPawn[Board.pieces[from]]){
        Board.fiftyMove = 0;
        if(MoveIsEnPassant(move)){
            Board.enPassant = (from + dir);
        }
        HASH_EN_PASSANT();
    } 

    MovePiece(from,to);
    if(MoveIsPromotion(move)){
        ClearPiece(to);
        AddPiece(to,MovePromoted(to));
    }

    //conclusion
    Board.side ^= 1;
    HASH_SIDE();

    if(IsSquareAttacked(Board.indexByPieceType[ PieceIndex( (Kings[side ^ 1] ),0) ],
       Board.side)){
        //illegal move was attempted - revert
        return false;
    }
    return true;
}


function RevertLatestMove(){
    Board.aiPlyNo -= 1;
    Board.currHistoryPly -= 1;

    var move = Board.history[Board.currHistoryPly].move;
    var from = MoveFromSq(move);
    var to = MoveToSq(move);

    if(Board.enPassant != 0){
        HASH_EN_PASSANT(); //moved in
    }
    HASH_CASTLE();

    Board.castlePerm = Board.history[Board.currHistoryPly].castlePerm;
    Board.fiftyMove = Board.history[Board.currHistoryPly].fiftyMove;
    Board.enPas = Board.history[Board.currHistoryPly].enPas;

    if(Board.enPas != 0){
        HASH_EN_PASSANT(); //moved out
    }

    Board.side ^= 1;
    HASH_SIDE();
    var dir = (side == COLOR.WHITE)? -10 : 10;
    var enpa = (side == COLOR.WHITE)? PIECES.bpawn : PIECES.wpawn;

    if(MoveIsEnPassant(move)){
        AddPiece(to+dir, enpa);
    }else if(MoveIsCastle(move)){
        switch(to){
            case KEYSQUARES.C1:
                MovePiece(KEYSQUARES.D1, KEYSQUARES.A1); 
                break;
            case KEYSQUARES.C8: 
                MovePiece(KEYSQUARES.D8, KEYSQUARES.A8); 
                break;
            case KEYSQUARES.G1: 
                MovePiece(KEYSQUARES.F1, KEYSQUARES.H1);
                break;
            case KEYSQUARES.G8: 
                MovePiece(KEYSQUARES.F8, KEYSQUARES.H8);
                break;
            default: 
                console.log("Critical castling error");
                break;
        }
    }

    MovePiece(to, from);
    if(MoveIsCapture(move)){
        AddPiece(to,MoveCaptured(move));
    }

    if(MoveIsPromotion(move)){
        ClearPiece(from);
        //AddPiece(from, )
    }


    /** UNFINISHED, DO NOT USE YET! **/
}

//remove piece from square
function ClearPiece(sq){
    var piece = Board.pieces[sq];
    var color = PIECECOLOR[piece]; // : material
    var pListIndex = -1;

    HASH_PIECE(piece,sq);

    Board.pieces[sq] = PIECES.NONE;
    Board.material[color] -= pieceVal[piece];

    for(var i = 0; i < Board.pieceCount[piece]; i++){
        if(Board.indexByPieceType[PieceIndex(piece,i)] == sq){
            pListIndex = i;
            break;
        }
    }

    /* ex: [33, 82(remove), 59, 17, 36(swap)] ==> [33, _36_, 59, 17] */
    Board.indexByPieceType[PieceIndex(piece,pListIndex)] = 
       Board.indexByPieceType[PieceIndex(piece,Board.pieceCount[piece] - 1)];
    Board.pieceCount[piece]--;
}

function AddPiece(sq,piece){
    var color = PIECECOLOR[piece];
    
    HASH_PIECE(piece,sq);

    Board.pieces[sq] = piece;
    Board.material[color] += pieceVal[piece];
    Board.indexByPieceType[PieceIndex(piece,Board.pieceCount[piece])] = sq;
    Board.pieceCount[piece]++;
}

function MovePiece(from, to){
    var piece = Board.pieces[from];

    HASH_PIECE(piece, from);

    Board.pieces[from] = PIECES.NONE;
    
    HASH_PIECE(piece, to);

    Board.pieces[to] = piece;

    for(var i = 0; i < Board.pieceCount[piece]; i++){
        if(Board.indexByPieceType[PieceIndex(piece,i)] == from){
            Board.indexByPieceType[PieceIndex(piece,i)] = to;
            break;
        }
    }
}