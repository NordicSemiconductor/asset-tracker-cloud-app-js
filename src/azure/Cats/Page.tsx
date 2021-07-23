import React from 'react'
import { Main } from '../../Styles'
import { ApiClientConsumer } from '../App'
import { List } from './List'
import { ButtonWarnings } from '../../ButtonWarnings/ButtonWarnings'
import { CatsList } from '../../theme/bootstrap4/CatsList'
import { ErrorCard } from '../../theme/bootstrap4/Error'
import { Progress } from '../../theme/bootstrap4/Progress'
import { SignalRDisabledWarning } from '../../theme/bootstrap4/azure/SignalRDisabledWarning'

export const CatsPage = () => (
	<Main>
		<ApiClientConsumer>
			{(apiClient) => (
				<ButtonWarnings>
					{(buttonWarningProps) => (
						<List
							apiClient={apiClient}
							{...buttonWarningProps}
							render={CatsList}
							renderError={ErrorCard}
							renderLoading={() => <Progress title={'Herding cats...'} />}
							renderSignalRDisabledWarning={SignalRDisabledWarning}
						/>
					)}
				</ButtonWarnings>
			)}
		</ApiClientConsumer>
	</Main>
)
