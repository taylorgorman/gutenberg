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

	function goToEditOverlay( overlayId ) {
		history.push( {
			postId: overlayId,
			postType: 'wp_template_part',
			canvas: 'edit',
		} );
	}

	if ( ! history && ! baseOverlay && ! customOverlay ) {
		return null;
	}

	return (
		<Button
			aria-label={ __( 'Edit Overlay' ) }
			variant="link"
			onClick={ async ( event ) => {
				event.preventDefault();

				// If there is an overlay already
				// then just show it.
				if ( customOverlay ) {
					goToEditOverlay( customOverlay.id );
					return;
				}

				const parsedBlocks = parse( baseOverlay.content.raw );
				const overlayNavBlock = findNavigationBlock( parsedBlocks );

				// Update the Navigation block in the overlay to use
				// the same ref as the parent block.
				// Todo: what happens if ref doesn't exist?
				// Should we copy the uncontrolled inner blocks?
				overlayNavBlock.attributes.ref = navRef;

				// No overlay - create one from base template.
				// TODO: catch and handle errors.
				const newOverlay = await saveEntityRecord(
					'postType',
					'wp_template_part',
					{
						slug: `${ baseOverlay?.slug }-${ navRef }`,
						title: `Navigation Overlay for ${ navTitle }`,
						content: serialize( parsedBlocks ),
						area: 'navigation-overlay',
					},
					{ throwOnError: true }
				);

				goToEditOverlay( newOverlay );
			} }
		>
			{ __( 'Edit' ) }
		</Button>
	);
}
