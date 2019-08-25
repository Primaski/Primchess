var Board = {};

//size: 120. each index is piece on that square
Board.pieces = []; 

// size: 140. at index 10 -> 19 (wP), 20 -> 29 (wN) ... 130 -> 139 (bK)
// states square where the piece is, -1 if piece doesn't exist
Board.indexByPieceType = [];
function PieceIndex(piece, pieceNum){
    return (piece * 10 + pieceNum);
}

// size: 13. indexed by piece number, piece count on board
Board.pieceCount = [];

// size: 2. (WHITE material, BLACK material)
Board.material = [];

//default side
Board.side = COLOR.WHITE;

//flags based on CASTLEBIT
Board.castlePerm = 0;

//util
Board.history = [];
Board.currHistoryPly = 0;
Board.plyCount = 0;

//special cases
Board.halfMoveClock = 0; //draw-> 50 moves w.o capture / pawn movement
Board.enPassant = 0;
Board.posKey = 0; //draw-> pos repeated 3 times

//ai
Board.aiPlyNo = 0;
Board.aiMoveList = []; //type: move, see movegen.js
Board.aiMoveScores = []; //type: int, see movegen.js
Board.aiPlyStart = []; //type: int, see movegen.js
Board.pvTable = []; //size: 10,000
Board.pvArray = []; //size: max_depth (best line at any depth)
Board.searchHistory = []; //size: 14 * NO_OF_SQUARES
Board.searchKillers = []; //size: 3 * MAX_DEPTH

function GetPositionKey(){
    currPiece = PIECES.NONE;
    var key = 0;
    for(let currSq = 0; currSq < NO_OF_SQUARES; currSq++){
        currPiece = Board.pieces[currSq];
        if(currPiece == PIECES.NONE || currPiece == KEYSQUARES.ILLEGAL){ 
            continue; 
        }
        key ^= pieceKeys[(currPiece * NO_OF_SQUARES) + currSq];
    }

    if(Board.side == COLOR.WHITE){
        key = (sideKey ^ key);
    }

    if(Board.enPassant != 0){
        key ^= pieceKeys[Board.enPassant];
    }

    key ^= castleKeys[Board.castlePerm];

    return key;
}

function PrintPieceLists(){
    for(let piece = PIECES.wpawn; piece <= PIECES.bking; piece++){
        for(let no = 0; no < Board.pieceCount[piece]; no++){
            /*console.log("piece and no is " + piece + " and " + no + ",\n" + 
                "PieceIndex(" + piece + "," + no + ") is " + PieceIndex(piece,no) + ",\n" +
                "Board.indexByPieceType[" + PieceIndex(piece,no) + "] is " + 
                Board.indexByPieceType[PieceIndex(piece,no)]);*/

            console.log("Piece " + PIECECHAR[piece] + " is on " + 
            PrintSquare(Board.indexByPieceType[PieceIndex(piece,no)]));
        }
    }
}

function UpdateMaterial(){
    
    for(let i = 0; i < 14 * 10; i++){
        Board.indexByPieceType[i] = PIECES.NONE;
    }

    for(let i = 0; i < 13; i++){
        Board.pieceCount[i] = 0;
    }

    Board.material[0] = 0;
    Board.material[1] = 0;

    var piece,sq,color;
    for(let i = 0; i < 64; i++){
        sq = ToSQ120(i);
        piece = Board.pieces[ToSQ120(i)];
        if(!(piece == PIECES.NONE)){
            //console.log("piece " + piece + " on " + sq);
            color = PIECECOLOR[piece];
            Board.material[color] += pieceVal[piece];
            //console.log("Board.indexByPieceType[PieceIndex(piece,Board.pieceCount[piece])] = sq is\n" +
            //"Board.indexByPieceType[" + PieceIndex(piece,Board.pieceCount[piece]) + "] = " + sq + " is \n");
            var pieceindex = PieceIndex(piece,Board.pieceCount[piece]);
            Board.indexByPieceType[pieceindex] = sq;
            //console.log(Board.indexByPieceType[PieceIndex(piece,Board.pieceCount[piece])]);
            Board.pieceCount[piece]++;
        }
    }

    //PrintPieceLists();
}

function ResetBoard(){
    for(let i = 0; i < NO_OF_SQUARES; i++){
        Board.pieces[i] = KEYSQUARES.ILLEGAL;
    }

    for(let i = 0; i < NO_OF_INTERNAL_SQUARES; i++){
        Board.pieces[ToSQ120(i)] = PIECES.NONE;
    }

    Board.side = COLOR.BOTH;
    Board.enPassant = Board.plyCount =
     Board.aiPlyNo = Board.halfMoveClock = Board.castlePerm =
     Board.posKey = Board.aiPlyStart[Board.aiPlyNo] = 0;

    return;
}

function ParseFEN(fen){
    ResetBoard();

    var rank = RANKS.rank8;
    var noOfPiecesAffected = 0;
    var piece = 0;
    var file = FILES.fileA;
    var piece = 0;
    var localindex = 0;
    
    try{
        //FEN piece info
        while(rank >= RANKS.rank1 && localindex < fen.length){
            noOfPiecesAffected = 1; //remains one if it's a piece

            //determine piece
            var currChar = fen[localindex];
            switch(currChar){
                case 'p': piece = PIECES.bpawn; break;
                case 'r': piece = PIECES.brook; break;
                case 'n': piece = PIECES.bknight; break;
                case 'b': piece = PIECES.bbishop; break;
                case 'q': piece = PIECES.bqueen; break;
                case 'k': piece = PIECES.bking; break;

                case 'P': piece = PIECES.wpawn; break;
                case 'R': piece = PIECES.wrook; break;
                case 'N': piece = PIECES.wknight; break;
                case 'B': piece = PIECES.wbishop; break;
                case 'Q': piece = PIECES.wqueen; break;
                case 'K': piece = PIECES.wking; break;

                case '1': case '2': case '3': case '4':
                case '5': case '6': case '7': case '8':
                    piece = PIECES.NONE;
                    noOfPiecesAffected = parseInt(currChar, 10);
                    break;
            
                case '/':
                case ' ':
                    rank--;
                    file = FILES.fileA;
                    localindex++;
                    continue;

                default:
                    throw "Error in parsing fen (char was unexpected character)";
            }

            //instill pieces in board, 1 if constant, white space if count
            for(let i = 0; i < noOfPiecesAffected; i++){
                Board.pieces[GetSquareIndex(file,rank)] = piece;
                file++;
            }
            localindex++;
        }

        //FEN metadata info
        Board.side = (fen[localindex] == 'w') ? COLOR.WHITE : COLOR.BLACK;
        localindex += 2; //"w " or "b "

        if(fen[localindex] == '-'){
            Board.castlePerm = 0;
            localindex++;
        }else{
            for(let i = 0; 
                (i < 4 && fen[localindex] != ' ' && fen[localindex] != '-' ); 
                i++){
                switch(fen[localindex]){
                    case 'K' : Board.castlePerm |= CASTLEBIT.wk; break;
                    case 'Q' : Board.castlePerm |= CASTLEBIT.wq; break;
                    case 'k' : Board.castlePerm |= CASTLEBIT.bk; break;
                    case 'q' : Board.castlePerm |= CASTLEBIT.bq; break;
                    default:
                        throw ("Unexpected char " + fen[localindex] + " in castling perms.");
                }
                localindex++;
            }
        }
        localindex += 1;
        
        if(fen[localindex] != '-'){            
            try{
                file = fen[localindex].charCodeAt() - 'a'.charCodeAt() + 1;
                rank = parseInt(fen[++localindex], 10);
                console.log("o: " + file + ", " + rank);
                Board.enPassant = GetSquareIndex(file,rank);
            }catch(enPassantError){
                throw ("Unexpected char: " + enPassantError + " in enPassant perms.");
            }
        }else{
            Board.enPassant = 0;
            localindex++;
        }

        try{
            halfMoveClock = parseInt(fen[++localindex]);
            plyCount = parseInt(fen[++localindex]);
        }catch(notanint){
            throw ("Unexpected values for last two digits, meant to indicate 50 halfmove clock and ply count."
            + " Simply write 0 and 0 if irrelevant.");
        }

        Board.posKey = GetPositionKey();
        UpdateMaterial();
        try{ if(!CheckBoard()){ throw "!"; } }catch(error){ console.log(error); }

    }catch(error){
        throw error;
    }
}

/* CheckBoard() confirms:
1. Board.pieces aligns with Board.indexByPieceType
2. Material is of correct value relative to board state
3. Position key is of correct value relative to board state
4. Side is correct
*/
function CheckBoard(){
    var shadowPieceCount = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    var shadowMaterial = [0, 0];
    var pieceType, pieceIndex, sq120, color;

    for(pieceType = PIECES.wpawn; pieceType <= PIECES.bking; pieceType++){
        for(pieceIndex = 0; pieceIndex < Board.pieceCount[pieceType]; pieceIndex++){
            sq120 = Board.indexByPieceType[PieceIndex(pieceType,pieceIndex)];
            if(Board.pieces[sq120] != pieceType){
                console.log("Status: Failed");
                console.log("Error: Board.indexByPieceType[] is not concurrent with Board.pieces[]");
                console.log("Error was spotted where " + GetFileRank(sq120) + " was expected to hold " 
                   + PIECECHAR[pieceType] + ", but did not.");
                return false;
            }
        }
    }

    for(let sq64 = 0; sq64 < 64; sq64++){
        sq120 = ToSQ120(sq64);
        pieceType = Board.pieces[sq120];
        shadowPieceCount[pieceType]++;
        shadowMaterial[PIECECOLOR[pieceType]] += pieceVal[pieceType];
    }

    for(pieceType = PIECES.wpawn; pieceType <= PIECES.bking; pieceType++){
        if(shadowPieceCount[pieceType] != Board.pieceCount[pieceType]){
            console.log("Status: Failed");
            console.log("Error: Board.pieceCount was not concurrent with locally generated PieceCount.");
            console.log("Local: " + shadowPieceCount.toString());
            console.log("Global: " + Board.pieceCount.toString());
            return false;
        }
    }

    if(!(shadowMaterial[COLOR.WHITE] == Board.material[COLOR.WHITE]
        && shadowMaterial[COLOR.BLACK] == Board.material[COLOR.BLACK])){
            console.log("Status: Failed");
            console.log("Error: Board.material was not concurrent with locally generated Material.");
            console.log("Local: " + shadowMaterial.toString());
            console.log("Global: " + Board.material.toString());
            return false;
    }

    if(Board.side != COLOR.WHITE && Board.side != COLOR.BLACK){
        console.log("Status: Failed");
        console.log("Error: Could not retrieve an affinity for the current moving player.");
        return false;
    }
    var shadowPosKey = GetPositionKey();
    if(shadowPosKey != Board.posKey){
        console.log("Status: Failed");
        console.log("Error: Hashed Position Key stored in local variable is not equivalent to true hashed Position Key.");
        console.log("Local: " + shadowPosKey.toString());
        console.log("Global: " + Board.posKey.toString());
        return false;
    }
    console.log("Status: OK!");
    return true;
}
