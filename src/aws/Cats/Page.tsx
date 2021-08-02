import React from 'react'
import { List } from './List'
import { Main } from '../../theme/bootstrap4/Styles'
import { ErrorCard } from '../../theme/bootstrap4/Error'
import { Progress } from '../../theme/bootstrap4/Progress'
import { CatsList } from '../../theme/bootstrap4/CatsList'

export const CatsPage = () => (
	<Main>
		<List
			renderLoading={() => <Progress title={'Herding cats...'} />}
			renderError={ErrorCard}
			render={CatsList}
		/>
	</Main>
)
