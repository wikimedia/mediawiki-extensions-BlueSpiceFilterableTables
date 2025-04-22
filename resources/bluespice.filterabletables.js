( function ( mw, $ ) {
	let counter = 0;
	$( '#bodyContent, article#content' ).find( 'table.filterable' ).each( function () {
		const $el = $( this );
		mw.loader.using( 'ext.bluespice.filterabletables.grid' ).done( () => {
			$el.hide();
			const grid = new bs.filterableTables.ui.grid.FilterableTable( {
				$table: $el,
				id: 'bs-filter-table-' + counter
			} );
			counter++;
			$el.after( grid.$element );
		} );
	} );
}( mediaWiki, jQuery ) );
