/**
 * Internal dependencies
 */
import lazyLoad from '../utils/lazy-load';
import initBlock from '../utils/init-block';

import metadata from './block.json';
import save from './save';
import variations from './variations';

const { name } = metadata;

export { metadata, name };

export const settings = {
	edit: lazyLoad( () =>
		import( /* webpackChunkName: "form-input/editor" */ './edit' )
	),
	save,
	variations,
};

export const init = () => initBlock( { name, metadata, settings } );
