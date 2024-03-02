import colors from 'picocolors'

function log(type: string, code: string, message: string) {
	if (typeof process !== 'undefined' && process.env.JEST_WORKER_ID) return

	console.warn(colors.bold(type), '-'/*, colors.bold(code) + ':'*/, message)
}

export const info = (code: string, message: string) => log(colors.cyan('info'), code, message)

export const warn = (code: string, message: string) => log(colors.yellow('warn'), code, message)

export const risk = (code: string, message: string) => log(colors.magenta('risk'), code, message)
