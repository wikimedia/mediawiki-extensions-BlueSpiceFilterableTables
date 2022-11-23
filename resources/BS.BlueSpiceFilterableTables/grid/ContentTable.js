Ext.define( 'BS.BlueSpiceFilterableTables.grid.ContentTable', {
	extend: 'Ext.grid.Panel',

	hideHeaders: false,
	stripeRows: false,
	border: true,
	width: 0,
	title: '',
	tools : [],

	columns: [],
	fields: [],
	fieldmap: [],
	currentData: [],
	headerColspan: [],
	headerColspanSeparator: ', ',

	$el: null,
	skiprows: 0,

	features: [],
	filters: [],

	plugins: [
		'gridfilters'
	],

	initComponent: function() {
		//cause of random scopes and references  in all new instances -.-
		var me = this;
		me.columns = [];
		me.fields = [];
		me.fieldmap = [];
		me.currentData = [];
		me.headerColspans = [];
		me.filters = [];
		me.width = this.parseColumnWidthFromAttribute(this.getElAttributes( me.$el ).style);

		if( me.$el.hasClass('mw-collapsible') ) {
			me.collapsible = true;

			// If table is collapsible and there is "Collapse" span generated - remove it
			me.$el.find('span.mw-collapsible-toggle').remove();
		}

		if( me.title === '' && me.$el.find( 'caption' ).length > 0 ) {
			me.title = me.$el.find( 'caption' ).first().text();
		}

		if( me.$el.find('thead tr').first().length < 1 ) {
			me.$el.find('tbody tr').first().find('th').each( function( index, value ){
				me.extractMappings( $(value) );
			});
			me.skiprows ++;
		} else {
			me.$el.find('thead tr').first().find('th').each( function( index, value ){
				me.extractMappings( $(value) );
			});
		}

		var colspan = 0,
			colspanVal = '',
			rowspans = {};

		me.$el.find( 'tbody tr' ).each(function() {
			if( me.skiprows > 0 ) {
				me.skiprows --;
				return;
			}
			var row = {};
			var i = 0;
			var y = 0;
			$(this).find( 'th, td' ).each( function( index, value ) {
				var attributes = me.getElAttributes( $(value) );
				if( me.headerColspan[me.fieldmap[i]] && me.headerColspan[me.fieldmap[i]] > y ) {
					if( !row[me.fieldmap[i]] ) {
						row[me.fieldmap[i]] = me.getElText( $(value) );
						row[me.fieldmap[i] + '-render' ] = $(value).html();
					} else {
						row[me.fieldmap[i]] = row[me.fieldmap[i]]
							+ me.headerColspanSeparator
							+ me.getElText( $(value) );
						row[me.fieldmap[i] + '-render'] = row[me.fieldmap[i] + '-render']
							+ me.headerColspanSeparator
							+ $(value).html();
					}
					y++;
					if( me.headerColspan[me.fieldmap[i]] === y ) {
						i++;
					}
					return;
				}
				y = 0;

				if( colspan > 1 ) {
					row[me.fieldmap[i]] = me.getElText( colspanVal );
					row[me.fieldmap[i] + '-render' ] = colspanVal.html();
					colspan --;
					i++;
				}

				while( rowspans[i] && rowspans[i].rowspan > 1 ) {
					row[me.fieldmap[i]] = me.getElText(
						rowspans[i].rowspanVal
					);
					row[me.fieldmap[i] + '-render' ] = rowspans[i].rowspanVal.html();
					rowspans[i].rowspan --;
					i++;
				}

				if( attributes.colspan && attributes.colspan !== 0) {
					colspan = parseInt( attributes.colspan );
					colspanVal = $(value);
				}
				if( attributes.rowspan && attributes.rowspan !== 0 ) {
					rowspans[i] = {
						rowspan: parseInt( attributes.rowspan ),
						rowspanVal: $(value)
					};
				}

				row[me.fieldmap[i]] = me.getElText( $(value) );
				row[me.fieldmap[i] + '-render' ] = $(value).html();
				i ++;
			});
			me.currentData.push( row );
		});

		me.store = Ext.create( "Ext.data.Store", {
			fields: me.fields,
			data: { 'items': me.currentData },
			proxy: {
				type: 'memory',
				reader: {
					type: 'json',
					rootProperty: 'items'
				}
			}
		});

		me.callParent( arguments );
	},

	extractMappings: function( $th ) {
		var fieldname = Ext.id();
		var attributes = this.getElAttributes( $th );

		this.headerColspan[fieldname] = false;
		if( attributes.colspan && attributes.colspan > 1 ) {
			this.headerColspan[fieldname] = parseInt( attributes.colspan );
		}

		this.fields.push( {
			name: fieldname,
			type: attributes.type
		});
		this.fields.push( {
			name: fieldname + '-render',
			type: attributes.type === 'date' ? 'string' : attributes.type //Avoid implicit conversion
		});

		this.fieldmap.push( fieldname );

		columnConfig = {
			flex: 1,
			dataIndex: fieldname,
			text: this.getElHeaderText( $th ),
			sortable: true,
			filter: {
				type: attributes.type
			},
			renderer: function( value, meta, record ) {
				return record.get( meta.column.dataIndex + '-render' );
			}
		}
		width = this.parseColumnWidthFromAttribute( attributes.style );
		if ( width ) {
			columnConfig['flex'] = 0;
			columnConfig['width'] = width;
 		}
		this.columns.push( columnConfig );

		this.filters.push( {
			type: attributes.type,
			dataIndex: fieldname
		});
	},

	getElText: function( $el ) {
		var text = $el.text();
		text = text.replace( /(<([^>]+)>)/ig, '' );
		text = $.trim( text );
		return text;
	},

	parseColumnWidthFromAttribute: function( style ) {
		if ( style || style.includes('width') ) {
			result = style.replace(" ", "").match( 'width:([0-9]*)(\%|px|em)' );
			if ( result !== null )  {
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
	},

	getElHeaderText: function( $el ) {
		return this.getElText( $el ).replace( /\n/g, '' );
	},

	getElAttributes: function( $el ) {
		var dataTypes = [
			'string',
			'integer',
			'number',
			'date'
		];
		var attr = {
			'rowspan': false,
			'colspan': false,
			'type': 'string',
			'align': 'left',
			'style': ''
		};
		if( $el[0].attributes ) {
			$.each($el[0].attributes, function() {
				attr[this.name] = this.value;
			});
		}
		for( var i = 0; i < dataTypes.length; i++ ) {
			if( $el.hasClass( dataTypes[i] ) ) {
				var type = dataTypes[i];
				if( type === 'integer' ) { //backwards compatibility
					type = 'number';
				}
				attr.type = type;
			}
		}
		return attr;
	}
});