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

	const closeText = __( 'Close' );

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
			<Button { ...blockProps } aria-label={ hasIcon && closeText }>
				{ hasIcon ? <Icon icon={ close } /> : closeText }
			</Button>
		</>
	);
}
