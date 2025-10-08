bs.util.registerNamespace( 'bs.filterableTables.ui.grid' );

bs.filterableTables.ui.grid.FilterableTable = function ( cfg ) {
	this.skipRows = 0;

	this.skipTableClasses = [
		'mw-collapsible',
		'sortable',
		'mw-collapsed',
		'mw-sticky-header',
		'jquery-tablesorter',
		'mw-made-collapsible',
		'bs-exportable'
	];

	cfg = this.makeGridCfg( cfg );
	cfg.classes = [ 'bs-filtertable' ];

	bs.filterableTables.ui.grid.FilterableTable.super.call( this, cfg );

	const classes = this.getTableClassNames( cfg.$table );
	this.$table.addClass( classes.join( ' ' ) ); // eslint-disable-line mediawiki/class-doc
};

OO.inheritClass( bs.filterableTables.ui.grid.FilterableTable, OOJSPlus.ui.data.GridWidget );

bs.filterableTables.ui.grid.FilterableTable.prototype.makeGridCfg = function ( cfg ) {
	const $table = cfg.$table || '';
	if ( $table.find( 'caption' ).length > 0 ) {
		const captionNodes = cfg.$table.find( 'caption' )[ 0 ].childNodes;
		let caption = '';
		for ( const i in captionNodes ) {
			if ( captionNodes[ i ].nodeType !== Node.TEXT_NODE ) {
				continue;
			}
			caption = captionNodes[ i ];
		}
		cfg.caption = caption;
	}
	this.columnsHelper = {};
	const columnCounter = 0;
	if ( $table.find( 'thead tr' ).first().length < 1 ) {
		const firstRow = $table.find( 'tbody tr' ).first(); // eslint-disable-line no-jquery/variable-pattern
		if ( firstRow.find( 'th' ).length > 0 ) {
			this.processColumns( 'th', firstRow, columnCounter );
			this.skipRows++;
		} else {
			// No header
			this.processColumns( 'th', firstRow, columnCounter );
		}
	} else {
		const headerRow = $table.find( 'thead tr' ).first(); // eslint-disable-line no-jquery/variable-pattern
		this.processColumns( 'th', headerRow, columnCounter );
	}
	cfg.columns = this.columnsHelper;
	cfg.data = this.getData( $table );
	cfg.pageSize = 999;
	if ( $table.hasClass( 'mw-collapsible' ) ) {
		cfg.collapsible = true;
		if ( cfg.$table.hasClass( 'mw-collapsed' ) ) {
			cfg.collapsed = true;
		}
	}
	if ( $table.hasClass( 'bs-exportable' ) ) {
		cfg.exportable = true;
		cfg.provideExportData = $table; // eslint-disable-line no-jquery/variable-pattern
	}

	return cfg;
};

bs.filterableTables.ui.grid.FilterableTable.prototype.getTableClassNames = function ( $table ) {
	const tableClasses = $( $table )[ 0 ].className.split( ' ' );

	const classes = [];
	for ( const i in tableClasses ) {
		const tableClass = tableClasses[ i ];
		if ( this.skipTableClasses.includes( tableClass ) ) {
			continue;
		}
		classes.push( tableClass );
	}
	return classes;
};

bs.filterableTables.ui.grid.FilterableTable.prototype.getData = function ( $table ) {
	const me = this;
	const currentData = [];
	let colspan = 0;
	let colspanVal = '';
	const rowspans = {};
	$table.find( 'tbody tr' ).each( function () {
		if ( me.skipRows > 0 ) {
			me.skipRows--;
			return;
		}
		const row = {};
		let i = 0;
		$( this ).find( 'th, td' ).each( ( index, value ) => {
			const attributes = me.getElAttributes( $( value ) );
			me.formatDate( $( value ) );

			if ( colspan > 1 ) {
				row[ i ] = me.getElText( colspanVal );
				colspan--;
				i++;
			}
			while ( rowspans[ i ] && rowspans[ i ].rowspan > 1 ) {
				row[ i ] = me.getElText(
					rowspans[ i ].rowspanVal
				);
				rowspans[ i ].rowspan--;
				i++;
			}

			if ( attributes.colspan && attributes.colspan !== 0 ) {
				colspan = parseInt( attributes.colspan );
				colspanVal = $( value ); // eslint-disable-line no-jquery/variable-pattern
			}
			if ( attributes.rowspan && attributes.rowspan !== 0 ) {
				rowspans[ i ] = {
					rowspan: parseInt( attributes.rowspan ),
					rowspanVal: $( value )
				};
			}

			row[ i ] = me.getElText( $( value ) );
			i++;
		} );
		currentData.push( row );
	} );
	return currentData;
};

bs.filterableTables.ui.grid.FilterableTable.prototype.processColumns = function ( selector, row, columnCounter ) {
	row.find( selector ).each( ( index, cell ) => {
		this.columnsHelper[ columnCounter ] = this.extractMappings( $( cell ), index );
		columnCounter++;
	} );
};

bs.filterableTables.ui.grid.FilterableTable.prototype.extractMappings = function ( $th, counter ) {
	counter = counter || 0;
	const attributes = this.getElAttributes( $th );

	const columnConfig = {
		headerText: this.getElHeaderText( $th, counter + 1 ),
		sortable: true,
		type: attributes.type,
		filter: {
			type: attributes.type
		},
		autoClosePopup: true,
		valueParser: ( value ) => {
			// If the value has a sort/display divider, return the display part for rendering
			if ( value.includes( '|SORT_DISPLAY_DIVIDER|' ) ) {
				const [ sort, display ] = value.split( '|SORT_DISPLAY_DIVIDER|', 2 ); // eslint-disable-line no-unused-vars
				return display || value;
			}
			if ( value.startsWith( '<a' ) ) {
				return new OO.ui.HtmlSnippet( value );
			}
			return value;
		}
	};
	const width = this.parseColumnWidthFromAttribute( attributes.style );
	if ( width ) {
		columnConfig.width = width;
	}
	return columnConfig;
};

bs.filterableTables.ui.grid.FilterableTable.prototype.getElAttributes = function ( $el ) {
	const dataTypes = [
		'text',
		'integer',
		'number',
		'date'
	];
	const attr = {
		rowspan: false,
		colspan: false,
		type: 'text',
		align: 'left',
		style: ''
	};
	if ( $el[ 0 ].attributes ) {
		$.each( $el[ 0 ].attributes, function () { // eslint-disable-line no-jquery/no-each-util
			attr[ this.name ] = this.value;
		} );
	}
	for ( let i = 0; i < dataTypes.length; i++ ) {
		if ( $el.hasClass( dataTypes[ i ] ) ) {
			let type = dataTypes[ i ];
			if ( type === 'integer' ) { // backwards compatibility
				type = 'number';
			}
			attr.type = type;
		}
	}
	return attr;
};

bs.filterableTables.ui.grid.FilterableTable.prototype.parseColumnWidthFromAttribute = function ( style ) {
	if ( style || style.includes( 'width' ) ) {
		const result = style.replace( ' ', '' ).match( 'width:([0-9]*)(%|px|em)' );
		if ( result !== null ) {
			if ( result[ 2 ] === 'px' ) {
				return parseInt( result[ 1 ] );
			}
			if ( result[ 2 ] === 'em' ) {
				return parseInt( result[ 1 ] ) * 12.8;
			}
			if ( result[ 2 ] === '%' ) {
				return result[ 1 ] + result[ 2 ];
			}
		}
	}
	return null;
};

bs.filterableTables.ui.grid.FilterableTable.prototype.getElHeaderText = function ( $el, counter ) {
	if ( !$el.is( 'th' ) ) {
		return counter || '-';
	}

	// Plain header
	if ( $el.children().length === 0 ) {
		return this.getElText( $el ).replace( /\n/g, '' );
	}

	// SMW link header - extract text
	const anchor = $el.find( 'a' ).first(); // eslint-disable-line no-jquery/variable-pattern
	if ( anchor.length ) {
		return anchor.text().trim().replace( /\n/g, '' );
	}

	// Other elements - skip buttons
	const headerNodes = $( $el ).contents(); // eslint-disable-line no-jquery/variable-pattern
	for ( let i = 0; i < headerNodes.length; i++ ) {
		if (
			headerNodes[ i ].nodeType === Node.ELEMENT_NODE &&
			headerNodes[ i ].tagName === 'BUTTON'
		) {
			continue;
		}
		return this.getElText( $( headerNodes[ i ] ) ).replace( /\n/g, '' );
	}

	return counter || '-';
};

bs.filterableTables.ui.grid.FilterableTable.prototype.getElText = function ( $el ) {
	// Preserve links
	const anchor = $el.find( 'a' ).get( 0 );
	if ( anchor ) {
		return anchor.outerHTML;
	}

	let text = $el.text();
	text = text.replace( /(<([^>]+)>)/ig, '' );
	text = $.trim( text ); // eslint-disable-line no-jquery/no-trim

	return text;
};

/**
 * Format date cells for sorting
 *
 * Prefixes the sortable ISO value to the display value, separated by a divider.
 * This allows sorting with only string manipulation. The valueParser later
 * splits this string to render the original display value while preserving
 * correct sort order.
 *
 * @param {jQuery} $el
 * @return {void}
 */
bs.filterableTables.ui.grid.FilterableTable.prototype.formatDate = function ( $el ) {
	// Convert dd.mm.yyyy to ISO (yyyy-mm-dd) for sorting
	const displayVal = $el.text().trim();
	const dateMatch = displayVal.match( /^([0-9]{2})([.-])([0-9]{2})\2([0-9]{4})$/ );
	if ( !dateMatch ) {
		return;
	}

	const day = dateMatch[ 1 ];
	const month = dateMatch[ 3 ];
	const year = dateMatch[ 4 ];
	const sortVal = `${ year }-${ month }-${ day }`;

	// Store both sort and display value
	$el.text( `${ sortVal }|SORT_DISPLAY_DIVIDER|${ displayVal }` );
};
