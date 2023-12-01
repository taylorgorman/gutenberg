/**
 * WordPress dependencies
 */
import { Button, Icon, ToggleControl, PanelBody } from '@wordpress/components';
import { close } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';

export default function Edit( { attributes, setAttributes } ) {
	const blockProps = useBlockProps();
	const { hasIcon } = attributes;

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Display' ) }>
					<ToggleControl
						__nextHasNoMarginBottom
						label={ __( 'Use icon' ) }
						help={ __(
							'Configure whether the button use an icon or text.'
						) }
						onChange={ ( value ) =>
							setAttributes( { hasIcon: value } )
						}
						checked={ hasIcon }
					/>
				</PanelBody>
			</InspectorControls>
			<Button
				{ ...blockProps }
				aria-label={ hasIcon && __( 'Close menu' ) }
			>
				{ hasIcon ? <Icon icon={ close } /> : __( 'Close' ) }
			</Button>
		</>
	);
}
