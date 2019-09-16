import React from 'react'
import { CatsMap } from './CatsMap'
import styled from 'styled-components'

const CatMapMain = styled.main`
	width: 100%;
	height: 100%;
	max-width: 100%;
	position: absolute;
	margin: 0;
	top: 55px;
	z-index: 10;
	.leaflet-container {
		height: 100%;
	}
`

export const CatsMapPage = () => (
	<CatMapMain>
		<CatsMap />
	</CatMapMain>
)
