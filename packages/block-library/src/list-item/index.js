/**
 * WordPress dependencies
 */
import { listItem as icon } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import edit from './edit';
import initBlock from '../utils/init-block';
import metadata from './block.json';

import save from './save';
import transforms from './transforms';

const { name } = metadata;

export { metadata, name };

export const settings = {
	icon,
	edit,
	save,
	merge( attributes, attributesToMerge ) {
		return {
			...attributes,
			content: attributes.content + attributesToMerge.content,
		};
	},
	transforms,
};

export const init = () => initBlock( { name, metadata, settings } );
