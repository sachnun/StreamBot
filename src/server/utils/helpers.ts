// Helper function to stringify objects for display in templates
export function stringify(obj: unknown): string {
	// if string, return it
	if (typeof obj === "string") {
		return obj;
	}

	if (Array.isArray(obj)) {
		return `<ul>${obj.map(item => {
			return `<li>${stringify(item)}</li>`;
		}).join("")}</ul>`;
	} else if (typeof obj === "object" && obj !== null) {
		const record = obj as Record<string, unknown>;
		return `<ul>${Object.keys(record).map(key => {
			return `<li>${key}: ${stringify(record[key])}</li>`;
		}).join("")}</ul>`;
	} else {
		return String(obj);
	}
}

// Helper function to format file size
export function prettySize(bytes: number): string {
	const units = ["B", "KB", "MB", "GB", "TB"];
	let i = 0;
	while (bytes >= 1024 && i < units.length - 1) {
		bytes /= 1024;
		i++;
	}
	return `${bytes.toFixed(2)} ${units[i]}`;
}