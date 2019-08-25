$("#setFen").click(function () {
    var fenStr = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    if($("#fenstr").val() != ''){
        fenStr = $("#fenstr").val();
    }
    try{
        ParseFEN(fenStr);
    }catch(error){
        console.log("Unable to parse FEN:\n" + error);
        return;
    }
    PrintBoard();
    //SearchPosition();
});