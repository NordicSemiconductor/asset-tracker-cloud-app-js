import React from 'react'
import { emojify } from '../theme/Emojify/Emojify'
import styled from 'styled-components'

const NoMapDiv = styled.div`
	background-color: #ccc;
	display: flex;
	height: 250px;
	justify-content: space-around;
	align-items: center;
`

export const NoMap = () => (
	<NoMapDiv>{emojify('❌ No position known.')}</NoMapDiv>
)
