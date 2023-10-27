/*
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { privateApis as routerPrivateApis } from '@wordpress/router';
import { store as coreStore } from '@wordpress/core-data';

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

				// No overlay - create one from base template.
				// TODO: catch and handle errors.
				const newOverlay = await saveEntityRecord(
					'postType',
					'wp_template_part',
					{
						slug: `${ baseOverlay?.slug }-${ navRef }`,
						title: `Navigation Overlay ${ navRef }`,
						content: baseOverlay?.content?.raw,
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
