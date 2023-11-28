/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { privateApis as routerPrivateApis } from '@wordpress/router';
import { store as coreStore, useEntityProp } from '@wordpress/core-data';
import { parse, serialize } from '@wordpress/blocks';
/**
 * Internal dependencies
 */
import { unlock } from '../../lock-unlock';

const { useHistory } = unlock( routerPrivateApis );

const DEFAULT_NAVIGATION_OVERLAY = {
	slug: 'navigation-overlay',
	content: {
		raw: `<!-- wp:group {"layout":{"type":"flex","orientation":"vertical","justifyContent":"center"}} -->
<div class="wp-block-group"><!-- wp:navigation {"layout":{"type":"flex","orientation":"vertical","justifyContent":"left"}} /--></div>
<!-- /wp:group -->`,
	},
};

export default function EditOverlayButton( { navRef } ) {
	const [ navTitle ] = useEntityProp(
		'postType',
		'wp_navigation',
		'title',
		navRef
	);

	// get the template part with the slug navigation-overlay
	const { baseOverlay, customOverlay } = useSelect(
		( select ) => {
			const themeSlug = select( coreStore ).getCurrentTheme()?.stylesheet;

			// Try for overlay provided by Theme (falling back to default
			// provided by Core).
			const _baseOverlay = themeSlug
				? select( coreStore ).getEntityRecord(
						'postType',
						'wp_template_part',
						`${ themeSlug }//navigation-overlay`
				  )
				: null;

			const _customOverlay = themeSlug
				? select( coreStore ).getEntityRecord(
						'postType',
						'wp_template_part',
						`${ themeSlug }//navigation-overlay-${ navRef }`
				  )
				: null;

			return {
				baseOverlay: _baseOverlay,
				customOverlay: _customOverlay,
			};
		},
		[ navRef ]
	);

	const { saveEntityRecord } = useDispatch( coreStore );

	const history = useHistory();

	function findNavigationBlock( blocks ) {
		const block = blocks[ 0 ];
		if ( block.name === 'core/navigation' ) {
			return block;
		}
		if ( block.innerBlocks.length ) {
			return findNavigationBlock( block.innerBlocks );
		}
		return null;
	}

	function goToOverlayEditor( overlayId ) {
		history.push( {
			postId: overlayId,
			postType: 'wp_template_part',
			canvas: 'edit',
		} );
	}

	async function handleEditOverlay( event ) {
		event.preventDefault();

		// If there is already a Custom Overlay for this Navigation Menu
		// the go to the editor for that overlay template part.
		if ( customOverlay ) {
			goToOverlayEditor( customOverlay.id );
			return;
		}

		// No custom overoverlay - create one from base template.
		// TODO: catch and handle errors.
		const overlayBlocks = buildOverlayBlocks( baseOverlay, navRef );
		const newOverlay = await createCustomOverlay( overlayBlocks );

		goToOverlayEditor( newOverlay?.id );
		return;
	}

	function buildOverlayBlocks( baseOverlay, navRef ) {
		const parsedBlocks = parse( baseOverlay.content.raw );
		const overlayNavBlock = findNavigationBlock( parsedBlocks );

		// Update the Navigation block in the overlay to use
		// the same ref as the parent block.
		// Todo: what happens if ref doesn't exist?
		// Should we copy the uncontrolled inner blocks?
		overlayNavBlock.attributes.ref = navRef;
		return parsedBlocks;
	}

	async function createCustomOverlay( overlayBlocks ) {
		return await saveEntityRecord(
			'postType',
			'wp_template_part',
			{
				slug: `${ baseOverlay?.slug }-${ navRef }`,
				title: `Navigation Overlay for ${ navTitle }`,
				content: serialize( overlayBlocks ),
				area: 'navigation-overlay',
			},
			{ throwOnError: true }
		);
	}

	if ( ! history && ! baseOverlay && ! customOverlay ) {
		return null;
	}

	return (
		<Button
			aria-label={ __( 'Edit Overlay' ) }
			variant="link"
			onClick={ handleEditOverlay }
		>
			{ __( 'Edit' ) }
		</Button>
	);
}
