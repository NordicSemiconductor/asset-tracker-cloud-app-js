import React, { useEffect, useState } from 'react'
import { IdentityIdContext, IotContext, CredentialsContext } from '../App'
import { Card, CardHeader } from 'reactstrap'
import { Iot } from 'aws-sdk'
import { Loading } from '../Loading/Loading'
import { Error } from '../Error/Error'
import { thingShadow } from 'aws-iot-device-sdk'

const ShowCat = ({ catId, iot, identityId, credentials }: {
	iot: Iot
	catId: string
	identityId: string
	credentials: {
		accessKeyId: string;
		sessionToken: string;
		secretAccessKey: string;
	}
}) => {
	const [loading, setLoading] = useState(true)
	const [cat, setCat] = useState({ name: catId })
	const [error, setError] = useState()

	useEffect(() => {
		Promise.all([
			iot.describeThing({
				thingName: catId,
			})
				.promise(),
			new Promise(resolve => {
				const connection = new thingShadow({
					clientId: `user-${identityId}`,
					region: process.env.REACT_APP_REGION,
					host: process.env.REACT_APP_MQTT_ENDPOINT,
					protocol: 'wss',
					accessKeyId: credentials.accessKeyId,
					sessionToken: credentials.sessionToken,
					secretKey: credentials.secretAccessKey,
					debug: true,
				})
				connection.on('connect', async () => {
					console.log('connected')
					connection.register(catId, {}, async () => {
						resolve(connection)
					})
				})
			}),
		])

			.then(([{ thingName }, connection]) => {
				setLoading(false)
				if (thingName) {
					setCat({
						name: thingName,
					})
				}
			})
			.catch(err => {
				setError(err)
				setLoading(false)
			})
	}, [iot, catId, identityId, credentials])
	if (loading) return <Loading text={`Opening can for ${catId}...`}/>
	if (error) return <Error error={error}/>
	return <Card>
		<CardHeader>{cat.name}</CardHeader>
	</Card>
}

export const Cat = ({ catId }: { catId: string }) => <CredentialsContext.Consumer>{credentials =>
	<IdentityIdContext.Consumer>
		{identityId => <IotContext.Consumer>
			{({ iot }) => <ShowCat catId={catId} iot={iot} identityId={identityId} credentials={credentials}/>}
		</IotContext.Consumer>}
	</IdentityIdContext.Consumer>}</CredentialsContext.Consumer>
