function EVALPOS_StrictlyMaterial(){
    var score = Board.material[COLOR.WHITE] - Board.material[COLOR.BLACK];
    return (Board.side == COLOR.WHITE) ? score : -score;
}

function EVALPOS_Default(){
    var score = Board.material[COLOR.WHITE] - Board.material[COLOR.BLACK];
    var sq;

    for(let piece = PIECES.wpawn; piece < PIECES.wqueen; piece++){
        for(let pNo = 0; pNo < Board.pieceCount[piece]; pNo++){
            sq = Board.indexByPieceType[PieceIndex(piece,pNo)];
            //bonus points for white based on position! next line: for a given piece, how many points at a given square?
            score += PieceTable[piece-1][ToSQ120(sq)]; 
        }
    }

    for(let piece = PIECES.bpawn; piece < PIECES.bqueen; piece++){
        for(let pNo = 0; pNo < Board.pieceCount[piece]; pNo++){
            sq = Board.indexByPieceType[PieceIndex(piece,pNo)];
            //bonus points for black based on position! next line: for a given piece, how many points at a given square?
            score -= PieceTable[piece-7][MirrorT(ToSQ120(sq))]; 
        }
    }

    score += (Board.pieceCount[PIECES.wbishop] >= 2) ? bishopPairBonus : 0;
    score += (Board.pieceCount[PIECES.bbishop] >= 2) ? bishopPairBonus : 0;


    return (Board.side == COLOR.WHITE) ? score : -score;
}