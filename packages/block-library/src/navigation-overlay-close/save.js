/**
 * WordPress dependencies
 */
import { useBlockProps } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';

export default function save( { attributes } ) {
	const { hasIcon } = attributes;
	const blockProps = useBlockProps.save();
	return (
		<button { ...blockProps } aria-label={ hasIcon && __( 'Close menu' ) }>
			{ __( 'Close menu' ) }
		</button>
	);
}
