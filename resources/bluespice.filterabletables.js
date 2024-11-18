(function( mw, $, d, undefined ){
	let counter = 0;
	$( '#bodyContent, article#content' ).find( 'table.filterable' ).each( function() {
		var $el = $(this);
		mw.loader.using( 'ext.bluespice.filterabletables.grid' ).done( function() {
			$el.hide();
			var grid = new bs.filterableTables.ui.grid.FilterableTable( {
				$table: $el,
				id: 'bs-filter-table-' + counter
			} );
			counter++;
			$el.after( grid.$element );
		} );
	} );
})( mediaWiki, jQuery, document );
