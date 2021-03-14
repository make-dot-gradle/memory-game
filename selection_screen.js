var idx = 0;
const removeParent = el => {
	let parent = el.parentElement;
	parent.parentElement.removeChild(parent);
};
const makeRow = (idx, pair) => mkFromTmplt({
	tag: "div",
	attrs: {"class": "pair"},
	children: [
		{tag: "input", attrs: {"class": "car", value: pair[0]}},
		{tag: "input", attrs: {"class": "cdr", value: pair[1]}},
		{tag: "input", attrs: {type: "button", value: "✖️"}, listeners: {click: ev => removeParent(ev.target)}}
	]
});
function addField(obj) {
	document.getElementById("fields").appendChild(makeRow(idx, obj));
	idx++;
}
const getPairs = () => [...document.getElementsByClassName("pair")]
      .map(el => ["car", "cdr"].map(c => el.getElementsByClassName(c)[0].value));
const loadPairs = pairs => pairs.forEach(addField);

function startGame() {
	const pairs = getPairs();
	if (!pairs) {
		alert("No pairs provided!");
		return;
	}
	sessionStorage.setItem("pairs", JSON.stringify(pairs));
	document.location.href = "game.html";
}
async function loadPresetOptions() {
	const index = await fetchPreset("index");
	const select = document.getElementById("preset-selection");
	const no_pairs = {
		tag: "option",
		attrs: {value: "nopairs"},
		children: ["(nav pāru)"]
	};
	const template = {
		tag: "select",
		attrs: {id: "preset-select"},
		children: [no_pairs, ...index.map(([name, file]) => ({
			tag: "option",
			attrs: {value: file},
			children: [name]
		}))],
		listeners: {change: loadSelectedPreset}
	}
	document.getElementById("preset-select").replaceWith(mkFromTmplt(template));
}
async function loadSelectedPreset() {
	document.getElementById("fields").innerHTML = "";
	const preset = document.getElementById("preset-select").value;
	if (preset === "nopairs") return;
	const pairs = await fetchPreset(preset);
	loadPairs(pairs);
}
function updateSampleSize() {
	let el = document.querySelector("#sample-size");
	const input = el.value;
	if (input === "visi") {
		sessionStorage.removeItem("sample-size");
	} else {
		const size = parseInt(input);
		if (isNaN(size)) {
			el.classList.add("invalid");
			return;
		}
		el.classList.remove("invalid");
		sessionStorage.setItem("sample-size", size);
	}
}

function download() {
	const pairs = getPairs();
	const width = [...Array(pairs[0].length).keys()].map(idx => Math.max(...pairs.map(p => p[idx].length)));
	const padIdx = (pair, idx) => pair[idx].padEnd(width[idx], " ");
	const file = pairs.map(pair => `${padIdx(pair, 0)} - ${padIdx(pair, 1)}`).join("\n");
	const blob = new Blob([file], {type: "application/octet-stream"});
	mkFromTmplt({
		tag: "a",
		attrs: {
			href: URL.createObjectURL(blob),
			download: "preset123.txt"
		}
	}).click();
}

async function upload() {
	document.getElementById("fields").textContent = "";
	for (const file of [...document.getElementById("upload-box").files]) {
		const text = await file.text();
		loadPairs(parsePairs(text));
	}
}

window.addEventListener("load", function() {
	const data = sessionStorage.getItem("pairs");
	if (data !== null) {
		loadPairs(JSON.parse(data));
	}
	loadPresetOptions();

	document.querySelector("#sample-size").value = sessionStorage.getItem("sample-size");
});
