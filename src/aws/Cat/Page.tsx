import React from 'react'
import { CatActions } from './CatActions'
import { Main } from '../../theme/bootstrap4/Styles'
import { CatRouteProps } from '../../Cat/CatRouteProps'
import { CatDeleted } from '../../theme/bootstrap4/Cat/CatDeleted'
import { DisplayError } from '../../theme/bootstrap4/Error'
import { ConnectionInformation } from '../../theme/ConnectionInformation'
import { HistoricalButtonPresses } from '../../theme/bootstrap4/HistoricalButtonPresses'
import { Collapsable } from '../../theme/Collapsable/Collapsable'
import { DeleteCat } from '../../theme/bootstrap4/Cat/DeleteCat'
import { Cat } from '../../theme/bootstrap4/Cat/CatCard'
import { Progress } from '../../theme/bootstrap4/Progress'
import { FOTAJobs } from '../../theme/bootstrap4/aws/FOTA/FOTAJobs'
import { CreateFOTAJob } from '../../theme/bootstrap4/CreateFOTAJob'

export const CatPage = (props: CatRouteProps) => (
	<Main>
		<CatActions
			catId={props.match.params.catId}
			renderOnDeleted={() => <CatDeleted catId={props.match.params.catId} />}
			renderError={DisplayError}
			renderConnectionInformation={ConnectionInformation}
			renderHistoricalButtonPresses={HistoricalButtonPresses}
			// FIXME: figure out how to pass this instead: renderCollapsable={Collapsable}
			renderCollapsable={({ children, ...rest }) => (
				<Collapsable {...rest}>{children}</Collapsable>
			)}
			renderDelete={DeleteCat}
			renderDivider={() => <hr />}
			render={Cat}
			renderLoading={() => (
				<Progress title={`Opening can for cat ${props.match.params.catId}`} />
			)}
			renderFOTAJobs={FOTAJobs}
			renderCreateFOTAJob={(args) => <CreateFOTAJob {...args} />}
		/>
	</Main>
)
