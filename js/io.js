function PrintBoard(){
    var sq,file,rank,piece;
    console.log("Game Board:\n");

    for(rank = RANKS.rank8; rank >= RANKS.rank1; rank--){
        var line = (RANKCHAR[rank-1] + "| ");
        for(file = FILES.fileA; file <= FILES.fileH; file++){
            sq = GetSquareIndex(file,rank);
            piece = Board.pieces[sq];
            line += (" " + PIECECHAR[piece] + " ");
        }
        console.log(line);
    }

    console.log("\n");
    var line = "  ";
    for(file = FILES.fileA; file <= FILES.fileH; file++){
        line += (' ' + FILECHAR[file-1] + ' ');
    }

    console.log(line);
    console.log("side: " + SIDECHAR[Board.side]);
    console.log("enpas: " + Board.enPassant);
    line = "";

    if(Board.castlePerm & CASTLEBIT.wk) { line += 'K'; }
    if(Board.castlePerm & CASTLEBIT.wq) { line += 'Q'; }
    if(Board.castlePerm & CASTLEBIT.bk) { line += 'k'; }
    if(Board.castlePerm & CASTLEBIT.bq) { line += 'q'; }

    console.log("castle perm: " + line);
}


function PrintSquare(sq){
    return (FILECHAR[filesBoard[sq]-1] + 
        RANKCHAR[ranksBoard[sq]-1]);
}

function PrintSquaresAttackable(onlyShowAttackablePieces = true){
    if(typeof(onlyShowAttackablePieces) != "boolean"){
        return;
    }
    var sq, piece;
    console.log("Attacked");
    for(var rank = RANKS.rank8; rank >= RANKS.rank1; rank--){
        var line = ((rank) + " ");
        for(var file = FILES.fileA; file <= FILES.fileH; file++){
            sq = GetSquareIndex(file,rank);
            if(IsSquareAttacked(sq, Board.side)){
                if(!onlyShowAttackablePieces){
                    piece = "X";
                }else{
                    piece = "-"
                    if(PIECECOLOR[Board.pieces[sq]] != Board.side &&
                        PIECECOLOR[Board.pieces[sq]] != COLOR.BOTH){
                        piece = "X"
                    }
                }
            }else{
                piece = "-";
            }
            line += " " + piece + " ";
        }
        console.log(line);
    }
}

function PrintMove(move, detailedStats = false){
    var result = "";

    if(detailedStats){
        result += (PIECECHAR[Board.pieces[MoveFromSq(move)]] + ": ");
    }
    result += GetFileRank(MoveFromSq(move));
    result += GetFileRank(MoveToSq(move));

    promoted = MoveIsPromotion(move);
    if(promoted){
        var newPiece = MovePromoted(move);
        if(isKnight[newPiece]){
            result += 'k';
        }else if(isBishop[newPiece]){
            result += 'b';
        }else if(isRook[newPiece]){
            result += 'r';
        }else{
            result += 'q';
        }
    }

    if(MoveIsCapture(move) && detailedStats){
        result += " (captures " + (PIECECHAR[Board.pieces[MoveToSq(move)]])
           + " on " + GetFileRank(MoveToSq(move)) + ")";
    }
    return result;
}

function PrintMoveList(detailedStats = true){
    console.log("Move List:");
    var move;
    for(var i = Board.aiPlyStart[Board.aiPlyNo]; 
       i < Board.aiPlyStart[Board.aiPlyNo+1]; i++){
        move = Board.aiMoveList[i];
        console.log(PrintMove(move, detailedStats));
    }
}