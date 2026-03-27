( function ( mw, $ ) {
	mw.hook( 'wikipage.content' ).add( ( $content ) => {
		if ( !$.fn.qtip ) {
			return;
		}
		$content.find( 'a.mw-lingo-term' ).each( function () {
			const $term = $( this );
			const termId = $term.attr( 'data-lingo-term-id' );
			if ( !termId ) {
				return;
			}
			const $tooltip = $( '#' + termId );
			if ( !$tooltip.length ) {
				return;
			}
			$term.qtip( {
				content: $tooltip.html(),
				position: {
					my: 'top left',
					at: 'bottom left'
				},
				hide: {
					fixed: true,
					delay: 300
				},
				style: { // eslint-disable-line mediawiki/class-doc
					classes: $tooltip.attr( 'class' ) + ' qtip-shadow',
					def: false
				}
			} );
		} );
	} );
}( mediaWiki, jQuery ) );
