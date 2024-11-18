bs.util.registerNamespace( 'bs.filterableTables.ui.grid' );

bs.filterableTables.ui.grid.FilterableTable = function ( cfg ) {
	this.skipRows = 0;
	cfg = this.makeGridCfg( cfg );
	cfg.classes = [ 'bs-filtertable' ];

	bs.filterableTables.ui.grid.FilterableTable.super.call( this, cfg );
};

OO.inheritClass( bs.filterableTables.ui.grid.FilterableTable, OOJSPlus.ui.data.GridWidget );

bs.filterableTables.ui.grid.FilterableTable.prototype.makeGridCfg = function ( cfg ) {
	let $table = cfg.$table || '';
	if ( $table.find( 'caption' ).length > 0 ) {
		cfg.caption = cfg.$table.find( 'caption' ).first().text();
	}
	this.columnsHelper = {};
	let columnCounter = 0;
	if ( $table.find( 'thead tr').first().length < 1 ) {
		let firstRow = $table.find( 'tbody tr' ).first();
		if ( firstRow.find( 'th' ).length > 0 ) {
			this.processColumns( 'th', firstRow, columnCounter );
			this.skipRows++;
		} else {
			// No header
			this.processColumns( 'th', firstRow, columnCounter );
		}
	} else {
		let headerRow = $table.find( 'thead tr' ).first();
		this.processColumns( 'th', headerRow, columnCounter );
	}
	cfg.columns = this.columnsHelper;
	cfg.data = this.getData( $table );
	cfg.pageSize = 999;
	if ( $table.hasClass( 'mw-collapsible') ) {
		cfg.collapsible = true;
		if( cfg.$table.hasClass( 'mw-collapsed' ) ) {
			cfg.collapsed = true;
		}
	}
	if ( $table.hasClass( 'bs-exportable') ) {
		cfg.exportable = true;
		cfg.provideExportData = $table;
	}

	return cfg;
};

bs.filterableTables.ui.grid.FilterableTable.prototype.getData = function ( $table ) {
	var me = this;
	var currentData = [],
		colspan = 0,
		colspanVal = '',
		rowspans = {};
	$table.find( 'tbody tr' ).each(function() {
		if( me.skipRows > 0 ) {
			me.skipRows --;
			return;
		}
		var row = {};
		var i = 0;
		$( this ).find( 'th, td' ).each( function( index, value ) {
			var attributes = me.getElAttributes( $(value) );
			me.formatDate( $(value) );

			if ( colspan > 1 ) {
				row[i] = me.getElText( colspanVal );
				colspan --;
				i++;
			}
			while ( rowspans[i] && rowspans[i].rowspan > 1 ) {
				row[i] = me.getElText(
					rowspans[i].rowspanVal
				);
				rowspans[i].rowspan --;
				i++;
			}

			if ( attributes.colspan && attributes.colspan !== 0) {
				colspan = parseInt( attributes.colspan );
				colspanVal = $(value);
			}
			if ( attributes.rowspan && attributes.rowspan !== 0 ) {
				rowspans[i] = {
					rowspan: parseInt( attributes.rowspan ),
					rowspanVal: $(value)
				};
			}

			row[i] = me.getElText( $(value) );
			i++;
		}) ;
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
	var attributes = this.getElAttributes( $th );

	let columnConfig = {
		headerText: this.getElHeaderText( $th, counter + 1 ),
		sortable: true,
		type: attributes.type,
		filter: {
			type: attributes.type
		}
	}
	width = this.parseColumnWidthFromAttribute( attributes.style );
	if ( width ) {
		columnConfig.width = width;
	}
	return columnConfig;
};

bs.filterableTables.ui.grid.FilterableTable.prototype.getElAttributes = function ( $el ) {
	var dataTypes = [
		'text',
		'integer',
		'number',
		'date'
	];
	var attr = {
		'rowspan': false,
		'colspan': false,
		'type': 'text',
		'align': 'left',
		'style': ''
	};
	if ( $el[0].attributes ) {
		$.each( $el[0].attributes, function() {
			attr[this.name] = this.value;
		} );
	}
	for ( var i = 0; i < dataTypes.length; i++ ) {
		if ( $el.hasClass( dataTypes[i] ) ) {
			var type = dataTypes[i];
			if( type === 'integer' ) { //backwards compatibility
				type = 'number';
			}
			attr.type = type;
		}
	}
	return attr;
};

bs.filterableTables.ui.grid.FilterableTable.prototype.parseColumnWidthFromAttribute = function( style ) {
	if ( style || style.includes('width') ) {
		result = style.replace(" ", "").match( 'width:([0-9]*)(\%|px|em)' );
		if ( result !== null ) {
			if ( result[2] === "px" ) {
				return parseInt( result[1] );
			}
			if ( result[2] === "em" ) {
				return parseInt( result[1] ) * 12.8;
			}
			if ( result[2] === "%" ) {
				return result[1] + result[2];
			}
		}
	}
	return null;
};

bs.filterableTables.ui.grid.FilterableTable.prototype.getElHeaderText = function( $el, counter ) {
	if( $el.is('th') ) {
		return this.getElText( $el ).replace( /\n/g, '' );
	}
	return counter || '-';
};

bs.filterableTables.ui.grid.FilterableTable.prototype.getElText = function( $el ) {
	var text = $el.text();
	text = text.replace( /(<([^>]+)>)/ig, '' );
	text = $.trim( text );
	return text;
};

bs.filterableTables.ui.grid.FilterableTable.prototype.formatDate = function( $el ) {
	// small HACK to make date in format dd.mm.yyyy|dd-mm-yyyy sortable
	if (date = $el[0].textContent.trim()
		.match(/^([0-9]{2})(.|-)([0-9]{2})(.|-)([0-9]{4})$/)
	) {
		$el[0].textContent = ``;

		var invisibleDate = document.createElement('p');
		invisibleDate.textContent = `${date[5]}.${date[3]}.${date[1]}`;
		invisibleDate.style.display='none';

		var visibleDate = document.createElement('div');
		visibleDate.textContent = `${date[1]}.${date[3]}.${date[5]}`;

		$el[0].appendChild( invisibleDate );
		$el[0].appendChild( visibleDate );
	}
};
