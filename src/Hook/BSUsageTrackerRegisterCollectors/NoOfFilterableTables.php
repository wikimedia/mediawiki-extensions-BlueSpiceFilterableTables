<?php

namespace BlueSpice\FilterableTables\Hook\BSUsageTrackerRegisterCollectors;

use BS\UsageTracker\Hook\BSUsageTrackerRegisterCollectors;

class NoOfFilterableTables extends BSUsageTrackerRegisterCollectors {

	protected function doProcess() {
		$this->collectorConfig['no-of-filterable-tables'] = [
			'class' => 'Property',
			'config' => [
				'identifier' => 'filterable-table',
				'internalDesc' => 'Number of pages with Filterable Tables'
			]
		];
	}
}
