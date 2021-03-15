function bigFactors(n) {
    for (let i = Math.floor(Math.sqrt(n)); i >= 1; i--) {
            if (n % i == 0) return [n / i, i]; 
    }
}


function Stats(correct, incorrect, remaining, startTime) {
	this.correct = correct;
	this.incorrect = incorrect
	this.remaining = remaining;
	this.startTime = startTime;
	this.interval  = null;
}

Stats.prototype.update = function() {
	const dict = {
		correct: this.correct,
		incorrect: this.incorrect,
		total: this.correct + this.incorrect,
		remaining: this.remaining
	};
	Object.entries(dict).forEach(([id, value]) => document.getElementById(id).textContent = value);
}

function fmtMilliseconds(ms) {
	const units = [12, 4, 7, 24, 60, 60, 1000];
	let allZeroes = true;
	return units.reduceRight(function(accumulator, unit) {
		let lastUnit = accumulator[0]; // what we need to divide to get the next unit
		if (lastUnit === undefined)
			lastUnit = ms; // if this is the first time we're iterating, we're gonna want ms here
		const inUnit = Math.floor(lastUnit / unit); // converts ms to the unit we're working in and rounds the result down
		return [inUnit, ...accumulator];
	}, [])
		.map(function(inUnit, idx) {
			if (inUnit === 0 && allZeroes) return;
			else allZeroes = false;
			// the next unit so that we have a way to know what amount of x would be classified as something greater
			const nextUnit = units[idx-1];
			if (nextUnit === undefined)
				return inUnit.toString();
			const remainder = inUnit % nextUnit;
			const padding = Math.floor(Math.log10(nextUnit)) + 1;
			return remainder.toString().padStart(padding, "0")
		})
		.filter(x => x !== undefined)
		.join(":");
}



Stats.prototype.countTime = function() {
	const startTime = this.startTime;
	this.interval = setInterval(function() {
		const currentTime = Date.now();
		const tdelta = currentTime - startTime;
		document.getElementById("time").textContent = fmtMilliseconds(tdelta);
	}, 1000);
}

Stats.prototype.cancelTimecount = function() {
	clearInterval(this.interval);
}


let opened_el = null;
let stats;
let disabled = false;



function handleClick(ev) {
	let el = ev.currentTarget;

	if (disabled)                          return;
	if (el.classList.contains("defeated")) return;
	if (opened_el === el)                  return;

	let content = el.querySelector(".tile-content");
	content.classList.remove("hidden");
	if (opened_el === null) {
		opened_el = el;
	} else {
		if (el.dataset.text === opened_el.dataset.other) {
			[el, opened_el].forEach(x => x.classList.add("defeated", "hidden"));
			stats.correct++;
			stats.remaining--;
		} else {
			disabled = true;
			[content, opened_el.querySelector(".tile-content")].forEach(tile => setTimeout(function() {
				tile.classList.add("hidden");
				disabled = false;
			}, 500));
			stats.incorrect++;
		}
		opened_el = null;
		stats.update();
	}
	if (stats.remaining === 0) {
		document.getElementById("victory").classList.remove("hidden");
		stats.cancelTimecount();
	}
}

let file_cache = {}

async function requestUpload(file) {
	if (file_cache[file] !== undefined) return;
	let modal = document.getElementById("modal");
	modal.style.display = "flex";
	const content = document.getElementById("modal-content");
	document.getElementById("file-to-upload").textContent = file;
	let input = document.getElementById("upload-box");
	input.value = "";
	file_cache[file] = await new Promise(resolve => {
		input.addEventListener("change", function() {
			resolve(URL.createObjectURL(input.files[0]));
		}, {once: true});
	});
	modal.style.display = "none";
}

// parses SLightly Rich(er) Text
function parseSLRT(s) {
	if (s.startsWith("!")) {
		return {
			tag: "img",
			attrs: {
				"class": "embedded-image",
				"src": s.startsWith("!#") ? file_cache[s.slice(2)] : s.slice(1)
			}
		}
	} else return s;
}

function makeGrid(pairs) {
	pairs = pairs.map(([a, b]) => [[a, b], [b, a]]).flat();
	pairs = shuffle(pairs);
	const [width, height] = bigFactors(pairs.length);
	let tiles = [];
	for (let row = 0; row < height; row++) {
		for (let col = 0; col < width; col++) {
			const idx = row * width + col;
			const pair = pairs[idx];
			tiles.push({
				tag: "div",
				attrs: {
					"class": "tile",
					"data-text":  pair[0],
					"data-other": pair[1]
				},
				style: {
					"--column": col + 1,
					"--row": row + 1
				},
				children: [
					{
						tag: "div",
						attrs: {"class": "tile-content hidden"},
						children: [parseSLRT(pair[0])]
					}
				],
				listeners: {
					click: handleClick
				}
			});
		}
	}
	return mkFromTmplt({
		tag: "div",
		attrs: {id: "game"},
		children: tiles
	});
}

async function newGame() {
	let pairs = JSON.parse(sessionStorage.getItem("pairs"));
	for (const elem of pairs.flat()) {
		if (elem.startsWith("!#")) {
			await requestUpload(elem.slice(2));
		}
	}
	let sample_size = parseInt(sessionStorage.getItem("sample-size"));

	if (sample_size)
		pairs = shuffle(pairs).splice(0, parseInt(sample_size));
	
	document.getElementById("game").replaceWith(makeGrid(pairs));
	document.getElementById("victory").classList.add("hidden");
	stats = new Stats(0, 0, pairs.length, Date.now());
	stats.countTime();
	stats.update();
}

window.addEventListener("load", newGame);
