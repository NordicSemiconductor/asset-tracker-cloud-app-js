import React from 'react'
import { useState } from 'react'

export const CollapsedContext = React.createContext<{
	visible: boolean
	setVisible: React.Dispatch<React.SetStateAction<boolean>>
}>({
	visible: true,
	setVisible: (boolean) => undefined,
})

export const CollapsedContextConsumer = CollapsedContext.Consumer

export const CollapsedContextProvider = ({
	children,
}: React.PropsWithChildren<any>) => {
	const [visible, setVisible] = useState(true)
	return (
		<CollapsedContext.Provider
			value={{
				visible,
				setVisible,
			}}
		>
			{children}
		</CollapsedContext.Provider>
	)
}
