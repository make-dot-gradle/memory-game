function parsePairs(text) {
	return [...text.matchAll(/^(.*?)\s*-\s*(.*?)$/gm)].map(x => x.splice(1, 3));
}

async function fetchPreset(text) {
	const res = await fetch(`presets/${text}.txt`);
	if (res.ok) {
		const text = await res.text();
		return parsePairs(text);
	}
}

const fetchIndex = () => fetchPreset("index");
