import React from 'react'
import { Main } from '../../Styles'
import { ApiClientConsumer } from '../App'
import { Cat } from './Cat'
import { CatRouteProps } from '../../Cat/CatRouteProps'
import { CatLoader } from '../../Cat/CatLoader'
import { Device } from '../api'
import { ConnectionInformation } from '../../theme/ConnectionInformation'
import { HistoricalButtonPresses } from '../../theme/bootstrap4/HistoricalButtonPresses'
import { DisplayError } from '../../theme/bootstrap4/Error'
import { Collapsable } from '../../theme/Collapsable/Collapsable'
import { DeleteCat } from '../../theme/bootstrap4/Cat/DeleteCat'
import { Cat as CatTheme } from '../../theme/bootstrap4/Cat/CatCard'
import { CatDeleted } from '../../theme/bootstrap4/Cat/CatDeleted'
import { Progress } from '../../theme/bootstrap4/Progress'
import { SignalRDisabledWarning } from '../../theme/bootstrap4/azure/SignalRDisabledWarning'

export const CatPage = (props: CatRouteProps) => (
	<Main>
		<ApiClientConsumer>
			{(apiClient) => (
				<CatLoader<Device>
					catId={props.match.params.catId}
					loader={async (catId) => apiClient.getDevice(catId)}
					renderError={DisplayError}
					renderLoading={() => (
						<Progress title={`Deleting ${props.match.params.catId}...`} />
					)}
				>
					{(cat, update) => (
						<Cat
							cat={cat}
							update={update}
							apiClient={apiClient}
							renderConnectionInformation={ConnectionInformation}
							renderHistoricalButtonPresses={HistoricalButtonPresses}
							renderError={DisplayError}
							renderCollapsable={Collapsable}
							renderDelete={DeleteCat}
							renderDivider={() => <hr />}
							render={CatTheme}
							renderOnDeleted={() => (
								<CatDeleted catId={props.match.params.catId} />
							)}
							renderOnDeleting={() => (
								<Progress title={`Deleting ${props.match.params.catId}...`} />
							)}
							renderSignalRDisabledWarning={SignalRDisabledWarning}
						/>
					)}
				</CatLoader>
			)}
		</ApiClientConsumer>
	</Main>
)
