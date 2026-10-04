export function downloadUrl(url: string, filename: string) {
	const link = document.createElement("a")
	link.href = url
	link.download = filename
	document.body.appendChild(link)
	link.click()
	link.remove()
}

export function downloadBlob(blob: Blob, filename: string) {
	const url = URL.createObjectURL(blob)
	downloadUrl(url, filename)
	window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
