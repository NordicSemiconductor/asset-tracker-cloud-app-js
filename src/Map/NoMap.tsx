import styled from 'styled-components'
import { emojify } from '../Emojify/Emojify'

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
