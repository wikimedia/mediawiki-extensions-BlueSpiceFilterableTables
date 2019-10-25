<?php

namespace BlueSpice\FilterableTables\Hook\BeforePageDisplay;

class AddResources extends \BlueSpice\Hook\BeforePageDisplay {

	protected function doProcess() {
		$this->out->addModules( 'ext.bluespice.filterabletables' );
		return true;
	}
}
