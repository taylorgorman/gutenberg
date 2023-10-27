/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { privateApis as routerPrivateApis } from '@wordpress/router';
import { store as coreStore } from '@wordpress/core-data';
import { parse, serialize } from '@wordpress/blocks';
/**
 * Internal dependencies
 */
import { unlock } from '../../lock-unlock';

const { useHistory } = unlock( routerPrivateApis );

export default function EditOverlayButton( { navRef } ) {
	// TODO: get the slug of the currently active theme
	const themeSlug = 'emptytheme';

	// get the template part with the slug navigation-overlay
	const { baseOverlay, customOverlay } = useSelect(
		( select ) => {
			const _baseOverlay = select( coreStore ).getEntityRecord(
				'postType',
				'wp_template_part',
				`${ themeSlug }//navigation-overlay`
			);

			const _customOverlay = select( coreStore ).getEntityRecord(
				'postType',
				'wp_template_part',
				`${ themeSlug }//navigation-overlay-${ navRef }`
			);

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
		// get the block dynamically via recusion
		// as the template part block structure
		// may not be simple.
		return blocks[ 0 ].innerBlocks[ 0 ];
	}

	if ( ! baseOverlay && ! customOverlay ) {
		return null;
	}

	return (
		<Button
			varqiant="secondary"
			onClick={ async ( event ) => {
				event.preventDefault();

				// If there is an overlay already
				// then just show it.
				if ( customOverlay ) {
					history.push( {
						postId: customOverlay.id,
						postType: 'wp_template_part',
						canvas: 'edit',
					} );
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
						title: `Navigation Overlay ${ navRef }`,
						content: serialize( parsedBlocks ),
						area: 'navigation-overlay',
					},
					{ throwOnError: true }
				);

				// 2. Redirect to template editor
				history.push( {
					postId: newOverlay.id,
					postType: 'wp_template_part',
					canvas: 'edit',
				} );
			} }
		>
			{ __( 'Edit Overlay' ) }
		</Button>
	);
}
