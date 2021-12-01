(function( mw, $, d, undefined ){
	$( '#bodyContent, article#content' ).find( 'table.filterable' ).each( function() {
		var $el = $(this);
		mw.loader.using( 'ext.bluespice.extjs' ).done( function() {
			Ext.onReady( function(){
				if( !$el.attr( 'id' ) ) {
					$el.attr( 'id', Ext.id() );
				}
				var divId = Ext.id();

				$el.after( '<div id="' + divId + '"/>' );
				Ext.require( 'BS.BlueSpiceFilterableTables.grid.ContentTable', function() {
					var panel = new BS.BlueSpiceFilterableTables.grid.ContentTable({
						renderTo: divId,
						'$el': $el
					});
				});

				$el.hide();
			});
		});
	});
})( mediaWiki, jQuery, document );
