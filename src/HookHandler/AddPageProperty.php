<?php

namespace BlueSpice\FilterableTables\HookHandler;

use MediaWiki\Content\Hook\ContentAlterParserOutputHook;
use WikitextContent;

class AddPageProperty implements ContentAlterParserOutputHook {

	/**
	 * @inheritDoc
	 */
	public function onContentAlterParserOutput( $content, $title, $parserOutput	) {
		if ( $title->getContentModel() !== CONTENT_MODEL_WIKITEXT ) {
			return;
		}
		if ( !( $content instanceof WikitextContent ) ) {
			return;
		}

		$text = $content->getText();
		$regex = '/^\{\| class="wikitable[a-z ]*filterable/m';

		if ( preg_match( $regex, $text ) ) {
			$parserOutput->setPageProperty( 'filterable-table', 1 );
		} else {
			$parserOutput->unsetPageProperty( 'filterable-table' );
		}
	}
}
