var NO_OF_SQUARES = 120; //*see bottom of document
var NO_OF_INTERNAL_SQUARES = 64;

/***** PIECE INFO *****/
var PIECES = { 
    NONE : 0, 
    wpawn : 1, wknight : 2, wbishop : 3, wrook : 4, wqueen : 5, wking : 6,
    bpawn : 7, bknight : 8, bbishop : 9, brook : 10, bqueen : 11, bking : 12
};
var pieceVal = [
    0, 
    100, 325, 325, 550, 1000, 50000,
    100, 325, 325, 550, 1000, 50000
];
var isPawn = [ false, true, false, false, false, false, false, true, false, false, false, false, false ];	
var isKnight = [ false, false, true, false, false, false, false, false, true, false, false, false, false ];
var isRook = [ false, false, false, false, true, false, false, false, false, false, true, false, false ];
var isBishop = [ false, false, false, true, false, false, false, false, false, true, false, false, false ];
var isQueen = [ false, false, false, false, false, true, false, false, false, false, false, true, false ];
var isKing = [ false, false, false, false, false, false, true, false, false, false, false, false, true ];
var isPieceSlide = [ false, false, false, true, true, true, false, false, false, true, true, true, false ];

function IsMajorPiece(piece){
    return ((pieceVal[piece] >= 550) ? true : false);
}
function IsMinorPiece(piece){
    return ((pieceVal[piece] == 325) ? true : false);
}

var Kings = [PIECES.wking, PIECES.bking];


/***** COLOR INFO *****/
var COLOR = {
    WHITE : 0,
    BLACK : 1,
    BOTH : 2
};
var PIECECOLOR = [
    COLOR.BOTH, 
    COLOR.WHITE, COLOR.WHITE, COLOR.WHITE, COLOR.WHITE, COLOR.WHITE, COLOR.WHITE, 
    COLOR.BLACK, COLOR.BLACK, COLOR.BLACK, COLOR.BLACK, COLOR.BLACK, COLOR.BLACK
];


/***** FILE AND RANK INFO *****/
var FILES = {
    NONE : 0,
    fileA : 1, fileB : 2,
    fileC : 3, fileD : 4,
    fileE : 5, fileF : 6,
    fileG : 7, fileH : 8
};
var RANKS = {
    NONE : 0,
    rank1 : 1, rank2 : 2,
    rank3 : 3, rank4 : 4,
    rank5 : 5, rank6 : 6,
    rank7 : 7, rank8 : 8
};
var KEYSQUARES = {
    A1 : 21, B1 : 22, C1 : 23, D1 : 24, E1 : 25, F1 : 26, G1 : 27, H1 : 28,
    A8 : 91, B8 : 92, C8 : 93, D8 : 94, E8 : 95, F8 : 96, G8 : 97, H8 : 98,
    NO_SQUARE : 99,
    ILLEGAL : 100
};
var filesBoard = []; //size: 120
var ranksBoard = []; //size: 120
var from120to64Index = []; //size: 120
var from64to120Index = []; //size: 64

function GetSquareIndex(file, rank){
    return ((21+(file-1)) + ((rank-1)*10));
}

function GetFileRank(index){
    var fileRank = "";
    if(Math.floor(index / 10) < 2 || Math.floor(index / 10) > 9){ //illegal - above/below
        return "XX";
    }
    if((index % 10) == 0 || (index % 10) == 9){ //illegal - to side
        return "XX";
    }
    fileRank += String.fromCharCode(64 + (index % 10)); //file
    fileRank += (Math.floor(index / 10) - 1).toString(); //rank
    return fileRank;
}

function ToSQ64(sq120){ 
    //index 0 is A1 -> index 63 is H8
    return from120to64Index[sq120];
}

function ToSQ120(sq64){
    //index 21 is A1 (0 is pad) -> index 98 is H8 (119 is pad)
    return from64to120Index[sq64];
}

function IsSquareOffboard(sq) {
	if(Board.pieces[sq] == KEYSQUARES.ILLEGAL){
        return true;
    }
	return false;	
}


/***** MOVE INFO *****/ 
//(*see bottom of file for explanation)
function MoveFromSq(move){ return (move & 0x7F); }
function MoveToSq(move){ return ( (move >> 7) & 0x7F ); }
function MoveCaptured(move){ return ( (move >> 14) & 0xF ); }
function MovePromoted(move){ return ( (move >> 20) & 0x7F ); }

function MoveIsCapture(move){ 
    return ((MoveCaptured(move) == 0x0) ? false : true ); 
}

function MoveIsPromotion(move){ 
    return ((MovePromoted(move) == 0x0) ? false : true ); 
}

function MoveIsEnPassant(move){ return ( move & FLAG_ENPASSANT ); }
function MoveIsPawnStart(move){ return ( move & FLAG_PAWNSTART ); }
function MoveIsCastle(move){ return ( move & FLAG_CASTLE ); }

var FLAG_ENPASSANT = 0x40000;
var FLAG_PAWNSTART = 0x80000;
var FLAG_CASTLE = 0x1000000;
var NOMOVE = 0;


/*direction that pieces move relative to the 1D array that is the board*/
var dirPawn = [9, 11];
var dirKnight = [-8, -12, -19, -21, 8, 12, 19, 21];
var dirKing = [-1, -9, -10, -11, 1, 9, 10, 11];
var dirBishop = [-9, -11, 9, 11];
var dirRook = [-1, -10, 1, 10];
var dirQueen = [-1, -9, -10, -11, 1, 9, 10, 11];
var dirCountByPiece = [0, 0, 8, 4, 4, 8, 8, 0, 8, 4, 4, 8, 8]; //pawn set to 0 - not utiliz.

/***** SPECIAL ATTRIBUTE INFO *****/
var CASTLEBIT = {
    wk : 1, wq : 2, bk : 4, bq : 8
}
var MAX_GAME_MOVES = 2048;
var MAX_POSITION_MOVES = 256;
var MAX_DEPTH = 64;

var HistoryObject = function(move,castlePerm,enPas,
    fiftyMove,posKey){
    this.move = move;
    this.castlePerm = castlePerm;
    this.enPas = enPas;
    this.fiftyMove = fiftyMove;
    this.posKey = posKey;
    return this;
}; //used inside Board.history[]

//poskey gen:
var sideKey; 
var castleKeys = []; //size: 16
var pieceKeys = []; //size: 14 * 120.
function HASH_PIECE(piece,sq){
    Board.posKey ^= pieceKeys[ (piece * 120) +sq ];
}
function HASH_CASTLE(){
    Board.posKey ^= castleKeys[Board.castlePerm];
}
function HASH_SIDE(){
    Board.posKey ^= sideKey;
}
function HASH_EN_PASSANT(){
    Board.enPassant ^= pieceKeys[Board.enPassant];
}

function Random32Bit(){
    return (Math.floor((Math.random()*255)+1) << 23) | 
           (Math.floor((Math.random()*255)+1) << 16) | 
           (Math.floor((Math.random()*255)+1) << 08) | 
           (Math.floor((Math.random()*255)+1) << 00);
}

//(castleBits &= CastlePerm[fromSpace] ==> newCastleBits)
var CastlePerm = [
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 
    15, 13, 15, 15, 15, 15, 15, 15, 14, 15, 
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 
    15,  7, 15, 15, 15,  3, 15, 15, 15, 15, 
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15
]

/*** FEN INFO ***/
var START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
var PIECECHAR = ".PNBRQKpnbrqk";
var SIDECHAR = "wb-";
var RANKCHAR = "12345678";
var FILECHAR = "abcdefgh";


/* MOVE INFO EXPLAINED

28 bits to store move, cast to receive information:

FROM >> 0 (range: 0x0 -> 0x7F, square indeces 0 -> 119)
0000 0000 0000 0000 0000 0111 1111

TO >> 7 (range: 0x0 -> 0x7F, square indeces 0 -> 119)
0000 0000 0000 0011 1111 1000 0000

CAPTURED >> 14 (range: 0x0 -> 0xf, 13 avail. pieces)
0000 0000 0011 1100 0000 0000 0000

ENPASSANTMOVE? >> 18 (range: 0x0 -> 0x1, true or false)
0000 0000 0100 0000 0000 0000 0000

PAWNSTART? >> 19 (range: 0x0 -> 0x1, true or false)
0000 0000 1000 0000 0000 0000 0000

PIECEPROMOTED >> 20 (range: 0x0 -> 0xf, 13 avail. pices)
0000 1111 0000 0000 0000 0000 0000

CASTLE? >> 24 (range: 0x0 -> 0x1, true or false)
0001 0000 0000 0000 0000 0000 0000
*/

/* TABLE LAYOUT EXPLAINED

Chess table layout - X spaces are not traversable (they are "safety pads" for
the knight)
+---+-------+-------+-------+-------+-------+-------+-------+-------+-------+-------+
|   |   X   |   A   |   B   |   C   |   D   |   E   |   F   |   G   |   H   |   X   |
+---+-------+-------+-------+-------+-------+-------+-------+-------+-------+-------+
| X | X-0   | X-1   | X-2   | X-3   | X-4   | X-5   | X-6   | X-7   | X-8   | X-9   |
| X | X-10  | X-11  | X-12  | X-13  | X-14  | X-15  | X-16  | X-17  | X-18  | X-19  |
| 1 | X-20  | A1-21 | B1-22 | C1-23 | D1-24 | E1-25 | F1-26 | G1-27 | H1-28 | X-29  |
| 2 | X-30  | A2-31 | B2-32 | C2-33 | D2-34 | E2-35 | F2-36 | G2-37 | H2-38 | X-39  |
| 3 | X-40  | A3-41 | B3-42 | C3-43 | D3-44 | E3-45 | F3-46 | G3-47 | H3-48 | X-49  |
| 4 | X-50  | A4-51 | B4-52 | C4-53 | D4-54 | E4-55 | F4-56 | G4-57 | H4-58 | X-59  |
| 5 | X-60  | A5-61 | B5-62 | C5-63 | D5-64 | E5-65 | F5-66 | G5-67 | H5-68 | X-69  |
| 6 | X-70  | A6-71 | B6-72 | C6-73 | D6-74 | E6-75 | F6-76 | G6-77 | H6-78 | X-79  |
| 7 | X-80  | A7-81 | B7-82 | C7-83 | D7-84 | E7-85 | F7-86 | G7-87 | H7-88 | X-89  |
| 8 | X-90  | A8-91 | B8-92 | C8-93 | D8-94 | E8-95 | F8-96 | G8-97 | H8-98 | X-98  |
| X | X-100 | X-101 | X-102 | X-103 | X-104 | X-105 | X-106 | X-107 | X-108 | X-109 |
| X | X-110 | X-111 | X-112 | X-113 | X-114 | X-115 | X-116 | X-117 | X-118 | X-119 |
+---+-------+-------+-------+-------+-------+-------+-------+-------+-------+-------+
*/