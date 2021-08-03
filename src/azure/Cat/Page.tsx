import React from 'react'
import { Main } from '../../theme/bootstrap4/Styles'
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
					loader={async () => apiClient.getDevice(props.match.params.catId)}
					renderError={DisplayError}
					renderLoading={() => (
						<Progress title={`Deleting ${props.match.params.catId}...`} />
					)}
					render={({ cat, update }) => (
						<Cat
							cat={cat}
							update={update}
							apiClient={apiClient}
							renderConnectionInformation={ConnectionInformation}
							renderHistoricalButtonPresses={HistoricalButtonPresses}
							renderError={DisplayError}
							// FIXME: figure out how to pass this instead: renderCollapsable={Collapsable}
							renderCollapsable={({ children, ...rest }) => (
								<Collapsable {...rest}>{children}</Collapsable>
							)}
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
				/>
			)}
		</ApiClientConsumer>
	</Main>
)
