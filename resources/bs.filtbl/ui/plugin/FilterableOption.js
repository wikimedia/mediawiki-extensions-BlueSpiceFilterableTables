bs.util.registerNamespace( 'bs.filtbl.ui.plugin' );

// extend document model
ve.dm.MWTableNode.static.classAttributes['filterable'] = { filterable: true };

bs.filtbl.ui.plugin.FilterableOption = function BsFiltblUiFilterableOption( config ) {
	bs.filtbl.ui.plugin.FilterableOption.super.call( this, config );
};

OO.inheritClass( bs.filtbl.ui.plugin.FilterableOption, bs.vec.ui.plugin.MWTableDialog );

bs.filtbl.ui.plugin.FilterableOption.prototype.initialize = function() {
	var filterableField;

	this.component.filterableToggle = new OO.ui.ToggleSwitchWidget();
	filterableField = new OO.ui.FieldLayout( this.component.filterableToggle, {
		align: 'left',
		label: ve.msg( 'bs-filterabletables-ve-filterable-option' )
	} );

	this.component.filterableToggle.connect( this.component, { change: 'updateActions' } );
	this.component.panel.$element.append( filterableField.$element );
};

bs.filtbl.ui.plugin.FilterableOption.prototype.getValues = function( values ) {
	return ve.extendObject( values, {
		filterable: this.component.filterableToggle.getValue()
	} );
};

bs.filtbl.ui.plugin.FilterableOption.prototype.getSetupProcess = function( parentProcess, data ) {
	parentProcess.next( function(){
		var tableNode = this.component.getFragment().getSelection().getTableNode(),
			filterable = !!tableNode.getAttribute( 'filterable' );

		this.component.filterableToggle.setValue( filterable );

		ve.extendObject( this.component.initialValues, {
			filterable: filterable
		} );
	}, this );
	return parentProcess;
};

bs.filtbl.ui.plugin.FilterableOption.prototype.getActionProcess = function( parentProcess, action ) {
	parentProcess.next( function(){
		var surfaceModel, fragment;
		if ( action === 'done' ) {
			surfaceModel = this.component.getFragment().getSurface();
			fragment = surfaceModel.getLinearFragment(
				this.component.getFragment().getSelection().tableRange, true
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
		return new bs.filtbl.ui.plugin.FilterableOption( component );
	}
);