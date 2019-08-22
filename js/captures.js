function IsSquareAttacked(sq, attackedBy, det = false){
    //console.log("aB: " + attackedBy);
    if(
        IsPawnAttacking(sq,attackedBy,det) || IsKnightAttacking(sq,attackedBy,det) ||
        IsBishopAttacking(sq,attackedBy,det) || IsRookAttacking(sq,attackedBy,det) ||
        IsQueenAttacking(sq,attackedBy,det) || IsKingAttacking(sq,attackedBy,det)){
        return true;
    }
    return false;
}

/* NON-SLIDING PIECES */
function IsPawnAttacking(s, aB, det){
    attacking = false;
    enemy = (aB == COLOR.WHITE) ? PIECES.wpawn : PIECES.bpawn;
    dirPawn.some(function(dir){
        dir = (aB == COLOR.WHITE) ? -dir : dir; //can only attack in one direction
        if(Board.pieces[s+dir] == enemy){
            if(det) console.log("the pawn at " + GetFileRank(s+dir) + " is attacking.");
            return attacking = true;
        }
    });
    //if(attacking){ console.log(s + " is attacked by a pawn."); }
    return attacking;
}

function IsKnightAttacking(s, aB, det){
    attacking = false;
    enemy = (aB == COLOR.WHITE) ? PIECES.wknight : PIECES.bknight;
    dirKnight.some(function(dir){
        if(Board.pieces[s+dir] == enemy){
            if(det) console.log("the knight at " + GetFileRank(s) + " is attacking.");
            return attacking = true;
        }
    });
    //if(attacking){ console.log(s + " is attacked by a knight."); }
    return attacking;
}

function IsKingAttacking(s, aB, det){
    attacking = false;
    enemy = (aB == COLOR.WHITE) ? PIECES.wking : PIECES.bking;
    dirKing.some(function(dir){
        if(Board.pieces[s+dir] == enemy){
            if(det) console.log("the king at " + GetFileRank(s) + " is attacking.");
            return attacking = true;
        }
    });
    //if(attacking){ console.log(s + " is attacked by a king."); }
    return attacking;
}

/* SLIDING PIECES */
function IsBishopAttacking(s, aB, det){
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
                    if(det) console.log("the bishop at " + GetFileRank(s) + " is attacking.");
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

function IsRookAttacking(s, aB, det){
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
                    if(det) console.log("the rook at " + GetFileRank(s) + " is attacking.");
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

function IsQueenAttacking(s, aB, det){
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
                    if(det) console.log("space in danger is " + GetFileRank(s));
                    if(det) console.log("attacked by color is " + COLOR[aB]);
                    if(det) console.log("the queen at " + GetFileRank(s+localDir) + " is attacking.");
                    if(det) console.log("the queen is " + aB + ", piece aff " + PIECECHAR[enemy]);
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