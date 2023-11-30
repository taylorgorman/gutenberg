/**
 * WordPress dependencies
 */
import { store as coreStore } from '@wordpress/core-data';
import { useSelect } from '@wordpress/data';

export default function useCustomOverlay( navRef ) {
	return useSelect(
		( select ) => {
			const themeSlug = select( coreStore ).getCurrentTheme()?.stylesheet;

			const customOverlay =
				themeSlug && navRef
					? select( coreStore ).getEntityRecord(
							'postType',
							'wp_template_part',
							`${ themeSlug }//navigation-overlay-${ navRef }`
					  )
					: null;

			return customOverlay;
		},
		[ navRef ]
	);
}
