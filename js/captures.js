function IsSquareAttacked(sq, attackedBy){
    
    if(
        IsPawnAttacking(sq,attackedBy) || IsKnightAttacking(sq,attackedBy) ||
        IsBishopAttacking(sq,attackedBy) || IsRookAttacking(sq,attackedBy) ||
        IsQueenAttacking(sq,attackedBy) || IsKingAttacking(sq,attackedBy)){
        return true;
    }
    return false;
}

/* NON-SLIDING PIECES */
function IsPawnAttacking(s, aB){
    attacking = false;
    enemy = (aB == COLOR.WHITE) ? PIECES.wpawn : PIECES.bpawn;
    dirPawn.some(function(dir){
        dir = (aB == COLOR.WHITE) ? -dir : dir; //can only attack in one direction
        if(Board.pieces[s+dir] == enemy){
            return attacking = true;
        }
    });
    //if(attacking){ console.log(s + " is attacked by a pawn."); }
    return attacking;
}

function IsKnightAttacking(s, aB){
    attacking = false;
    enemy = (aB == COLOR.WHITE) ? PIECES.wknight : PIECES.bknight;
    dirKnight.some(function(dir){
        if(Board.pieces[s+dir] == enemy){
            return attacking = true;
        }
    });
    //if(attacking){ console.log(s + " is attacked by a knight."); }
    return attacking;
}

function IsKingAttacking(s, aB){
    attacking = false;
    enemy = (aB == COLOR.WHITE) ? PIECES.wking : PIECES.bking;
    dirKing.some(function(dir){
        if(Board.pieces[s+dir] == enemy){
            return attacking = true;
        }
    });
    //if(attacking){ console.log(s + " is attacked by a king."); }
    return attacking;
}

/* SLIDING PIECES */
function IsBishopAttacking(s, aB){
    attacking = false;
    enemy = (aB == COLOR.WHITE) ? PIECES.wbishop : PIECES.bbishop;
    dirBishop.some(function(dir){
        localDir = dir;
        //sliding pieces traverse until end of board
        while(Board.pieces[s+localDir] != KEYSQUARES.ILLEGAL){
            var attackingSquare = Board.pieces[s+localDir];
            //sliding pieces traverse until contact with another piece
            if(attackingSquare != PIECES.NONE){
                if(attackingSquare == enemy){
                    return attacking = true;
                }
                break; //contact made
            }
            localDir += dir; 
        }
    });
    //if(attacking){ console.log(s + " is attacked by a bishop."); }
    
    return attacking;
}

function IsRookAttacking(s, aB){
    attacking = false;
    enemy = (aB == COLOR.WHITE) ? PIECES.wrook : PIECES.brook;
    dirRook.some(function(dir){
        localDir = dir;
        //sliding pieces traverse until end of board
        while(Board.pieces[s+localDir] != KEYSQUARES.ILLEGAL){
            var attackingSquare = Board.pieces[s+localDir];
            //sliding pieces traverse until contact with another piece
            if(attackingSquare != PIECES.NONE){
                if(attackingSquare == enemy){
                    return attacking = true;
                }
                break; //contact made
            }
            localDir += dir; 
        }
    });
    //if(attacking){ console.log(s + " is attacked by a rook."); }
    
    return attacking;
}

function IsQueenAttacking(s, aB){
    attacking = false;
    enemy = (aB == COLOR.WHITE) ? PIECES.wqueen : PIECES.bqueen;
    dirQueen.some(function(dir){
        localDir = dir;
        //sliding pieces traverse until end of board
        while(Board.pieces[s+localDir] != KEYSQUARES.ILLEGAL){
            var attackingSquare = Board.pieces[s+localDir];
            //sliding pieces traverse until contact with another piece
            if(attackingSquare != PIECES.NONE){
                if(attackingSquare == enemy){
                    return attacking = true;
                }
                break; //contact made
            }
            localDir += dir; 
        }
    });
    //if(attacking){ console.log(s + " is attacked by a queen."); }
    
    return attacking;
}