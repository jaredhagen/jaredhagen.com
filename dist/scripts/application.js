$( document ).ready(function() {
    initializeDisplay( );
    initializeClickHandlers( );
});

function showWork( ) {
	hideSubNav( );
	$("#work-nav").delay( 250 ).fadeIn( );
}

function showProjects( ) {
	hideSubNav( );
	$("#projects-nav").delay( 250 ).fadeIn( );
}

function hideSubNav( ) {
	$(".sub-nav").fadeOut( 250 );
}

function hideSection( ) {
	$("section").fadeOut( 250 );
}

function showSection( sectionId ) {
	sectionId.delay( 250 ).fadeIn( 250 );
}

function switchSection( sectionId ) {
	hideSection( );
	showSection( sectionId );
}

function initializeDisplay( ) {
	$(".sub-nav").hide( );
	$("section").hide( );
	$("#about").show( );
}

function initializeClickHandlers( ) {
	$("#about_btn").click( hideSubNav );
    $("#projects_btn").click( showProjects );
    $("#work_btn").click( showWork );
    $("#about_btn").click( function( ) { switchSection( $("#about") ) } );
    $("#projects_btn").click( function( ) { switchSection( $("#projects") ) } );
    $("#work_btn").click( function( ) { switchSection( $("#work") ) } );
    $("#grownlocal_btn").click( function( ) { switchSection( $("#grownlocal") ) } );
    $("#grownlocal_btn2").click( function( ) { switchSection( $("#grownlocal") ) } );
    $("#myco_btn").click( function( ) { switchSection( $("#myco") ) } );
    $("#myco_btn2").click( function( ) { switchSection( $("#myco") ) } );
    $("#winonakombat_btn").click( function( ) { switchSection( $("#winonakombat") ) } );
    $("#winonakombat_btn2").click( function( ) { switchSection( $("#winonakombat") ) } );
    $("#smartdata_btn").click( function( ) { switchSection( $("#smartdata") ) } );
    $("#smartdata_btn2").click( function( ) { switchSection( $("#smartdata") ) } );
    $("#fastenal_btn").click( function( ) { switchSection( $("#fastenal") ) } );
    $("#fastenal_btn2").click( function( ) { switchSection( $("#fastenal") ) } );
    $("#wsu_btn").click( function( ) { switchSection( $("#wsu") ) } );
    $("#wsu_btn2").click( function( ) { switchSection( $("#wsu") ) } );
}