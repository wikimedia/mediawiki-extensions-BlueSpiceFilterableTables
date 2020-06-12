bs.util.registerNamespace( 'bs.filterableTables.ui.plugin' );

// extend document model
ve.dm.MWTableNode.static.classAttributes['filterable'] = { filterable: true };

bs.filterableTables.ui.plugin.FilterableOption = function BsFiltblUiFilterableOption( config ) {
	bs.filterableTables.ui.plugin.FilterableOption.super.call( this, config );
};

OO.inheritClass( bs.filterableTables.ui.plugin.FilterableOption, bs.vec.ui.plugin.MWTableDialog );

bs.filterableTables.ui.plugin.FilterableOption.prototype.initialize = function() {
	var filterableField;

	this.component.filterableToggle = new OO.ui.ToggleSwitchWidget();
	filterableField = new OO.ui.FieldLayout( this.component.filterableToggle, {
		align: 'left',
		label: ve.msg( 'bs-filterabletables-ve-filterable-option' )
	} );

	this.component.filterableToggle.connect( this.component, { change: 'updateActions' } );
	this.component.panel.$element.append( filterableField.$element );
};

bs.filterableTables.ui.plugin.FilterableOption.prototype.getValues = function( values ) {
	return ve.extendObject( values, {
		filterable: this.component.filterableToggle.getValue()
	} );
};

bs.filterableTables.ui.plugin.FilterableOption.prototype.getSetupProcess = function( parentProcess, data ) {
	parentProcess.next( function(){
		// Save the initial fragment dialog opened with
		this.fragment = this.component.getFragment();
		var tableNode = this.fragment.getSelection().getTableNode( this.fragment.document ),
			filterable = !!tableNode.getAttribute( 'filterable' );

		this.component.filterableToggle.setValue( filterable );

		ve.extendObject( this.component.initialValues, {
			filterable: filterable
		} );
	}, this );
	return parentProcess;
};

bs.filterableTables.ui.plugin.FilterableOption.prototype.getActionProcess = function( parentProcess, action ) {
	parentProcess.next( function(){
		var surfaceModel, fragment;
		if ( action === 'done' ) {
			surfaceModel = this.fragment.getSurface();
			fragment = surfaceModel.getLinearFragment(
				this.fragment.getSelection().tableRange, true
			);
			fragment.changeAttributes( {
				filterable: this.component.filterableToggle.getValue()
			} );
		}
	}, this );
	return parentProcess;
};

bs.vec.registerComponentPlugin(
	bs.vec.components.TABLE_DIALOG,
	function( component ) {
		return new bs.filterableTables.ui.plugin.FilterableOption( component );
	}
);
