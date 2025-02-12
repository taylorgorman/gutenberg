/**
 * External dependencies
 */
import { css } from '@emotion/react';
import styled from '@emotion/styled';

/**
 * Internal dependencies
 */
import { CONFIG, COLORS } from '../../utils';
import type { ToggleGroupControlProps } from '../types';

export const toggleGroupControl = ( {
	isBlock,
	isDeselectable,
	size,
	__next40pxDefaultSize,
}: Pick<
	ToggleGroupControlProps,
	'isBlock' | 'isDeselectable' | '__next40pxDefaultSize'
> & {
	size: NonNullable< ToggleGroupControlProps[ 'size' ] >;
} ) => css`
	background: ${ COLORS.ui.background };
	border: 1px solid transparent;
	border-radius: ${ CONFIG.controlBorderRadius };
	display: inline-flex;
	min-width: 0;
	padding: 2px;
	position: relative;

	${ toggleGroupControlSize( size, __next40pxDefaultSize ) }
	${ ! isDeselectable && enclosingBorders( isBlock ) }
`;

const enclosingBorders = ( isBlock: ToggleGroupControlProps[ 'isBlock' ] ) => {
	const enclosingBorder = css`
		border-color: ${ COLORS.ui.border };
	`;

	return css`
		${ isBlock && enclosingBorder }

		&:hover {
			border-color: ${ COLORS.ui.borderHover };
		}

		&:focus-within {
			border-color: ${ COLORS.ui.borderFocus };
			box-shadow: ${ CONFIG.controlBoxShadowFocus };
			z-index: 1;
			// Windows High Contrast mode will show this outline, but not the box-shadow.
			outline: 2px solid transparent;
			outline-offset: -2px;
		}
	`;
};

export const toggleGroupControlSize = (
	size: NonNullable< ToggleGroupControlProps[ 'size' ] >,
	__next40pxDefaultSize: ToggleGroupControlProps[ '__next40pxDefaultSize' ]
) => {
	const heights = {
		default: '40px',
		'__unstable-large': '40px',
	};

	if ( ! __next40pxDefaultSize ) {
		heights.default = '36px';
	}

	return css`
		min-height: ${ heights[ size ] };
	`;
};

export const block = css`
	display: flex;
	width: 100%;
`;

export const VisualLabelWrapper = styled.div`
	// Makes the inline label be the correct height, equivalent to setting line-height: 0
	display: flex;
`;
