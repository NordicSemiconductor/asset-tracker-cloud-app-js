import React, { PropsWithChildren } from 'react'

export const CurrentCatInfoContext = React.createContext<{
	setCatInfo: (args?: { avatar: string; name: string }) => void
	avatar?: string
	name?: string
}>({
	setCatInfo: () => undefined,
})

export class CurrentCatInfoContextProvider extends React.Component<
	PropsWithChildren<unknown>,
	{
		avatar?: string
		name?: string
		setCatInfo: (args?: { avatar: string; name: string }) => void
	}
> {
	constructor(props: PropsWithChildren<unknown>) {
		super(props)

		this.state = {
			setCatInfo: (info?: { avatar: string; name: string }) => {
				this.setState({ avatar: info?.avatar, name: info?.name })
			},
		}
	}

	render() {
		return (
			<CurrentCatInfoContext.Provider value={this.state}>
				{this.props.children}
			</CurrentCatInfoContext.Provider>
		)
	}
}
