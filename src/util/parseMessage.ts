import { Message } from '../@types/Message'

/**
 * This merges a device message
 */
export const parseMessage = (message: {
	[key: string]: { v: any; ts: number }
}): Message | undefined => ({
	...(message.btn !== undefined && {
		btn: {
			v: message.btn.v,
			ts: new Date(message.btn.ts),
		},
	}),
	...(message.impact !== undefined && {
		impact: {
			v: message.impact.v,
			ts: new Date(message.impact.ts),
		},
	}),
})
