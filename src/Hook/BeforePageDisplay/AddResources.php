<?php

namespace BlueSpice\FilterableTables\Hook\BeforePageDisplay;

class AddResources extends \BlueSpice\Hook\BeforePageDisplay {

	/**
	 * @return bool
	 */
	protected function doProcess() {
		$this->out->addModules( 'ext.bluespice.filterabletables' );
		return true;
	}
}
