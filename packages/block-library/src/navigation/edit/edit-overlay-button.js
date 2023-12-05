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
import useGoToOverlayEditor from './use-go-to-overlay-editor';
import useCustomOverlay from './use-custom-overlay';

const { useHistory } = unlock( routerPrivateApis );

export default function EditOverlayButton( { navRef } ) {
	const [ navTitle ] = useEntityProp(
		'postType',
		'wp_navigation',
		'title',
		navRef
	);

	// Get any custom overlay with the slug `navigation-overlay-${navRef}`.
	const customOverlay = useCustomOverlay( navRef );

	// Get the fallback template part with the slug `navigation-overlay`.
	const { baseOverlay } = useSelect( ( select ) => {
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

		return {
			baseOverlay: _baseOverlay,
		};
	}, [] );

	const { saveEntityRecord } = useDispatch( coreStore );

	const history = useHistory();

	const goToOverlayEditor = useGoToOverlayEditor();

	function findNavigationBlock( blocks ) {
		for ( const block of blocks ) {
			if ( block.name === 'core/navigation' ) {
				return block;
			}

			// If this block has inner blocks, recurse.
			if ( block.innerBlocks.length ) {
				const innerBlock = findNavigationBlock( block.innerBlocks );
				if ( innerBlock ) {
					return innerBlock;
				}
			}
		}

		return null;
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
		const overlayBlocks = buildOverlayBlocks(
			baseOverlay.content.raw,
			navRef
		);
		const newOverlay = await createCustomOverlay( overlayBlocks );

		goToOverlayEditor( newOverlay?.id );
	}

	function buildOverlayBlocks( content, parentNavRef ) {
		const parsedBlocks = parse( content );
		const overlayNavBlock = findNavigationBlock( parsedBlocks );

		// Update the Navigation block in the overlay to use
		// the same ref as the parent block.
		// Todo: what happens if ref doesn't exist?
		// Should we copy the uncontrolled inner blocks?
		overlayNavBlock.attributes.ref = parentNavRef;
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
