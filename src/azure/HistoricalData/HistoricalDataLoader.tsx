import React, { useEffect, useState } from 'react'
import { Loading } from '../../Loading/Loading'
import { DisplayError as ShowError } from '../../Error/Error'
import { ApiClient } from '../api'
import { isLeft } from 'fp-ts/lib/Either'
import { ErrorInfo } from '../../Error/ErrorInfo'

export function HistoricalDataLoader<I, T>({
	apiClient,
	children,
	QueryString,
	loading,
	formatFields,
}: {
	apiClient: ApiClient
	QueryString: string
	loading?: React.ReactElement<any>
	formatFields: (item: I) => T
	children: (args: { data: T[] }) => React.ReactElement<any>
}) {
	const [data, setData] = useState<T[]>()
	const [error, setError] = useState<ErrorInfo>()

	useEffect(() => {
		let removed = false
		apiClient
			.queryHistoricalDeviceData(QueryString)
			.then((res) => {
				if (removed) {
					console.debug(
						'[Historical Data]',
						'Received result, but was removed already.',
					)
					return
				}
				if (isLeft(res)) {
					if (!removed) setError(res.left)
				} else {
					console.debug('[Historical Data]', res.right.result)
					setData((res.right.result as I[]).map(formatFields))
				}
			})
			.catch(setError)
		return () => {
			removed = true
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [QueryString, apiClient, formatFields])

	return (
		<>
			{!data && (loading || <Loading text={`Fetching historical data...`} />)}
			{error && <ShowError error={error} />}
			{data && children({ data })}
		</>
	)
}
