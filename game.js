function bigFactors(n) {
    for (let i = Math.floor(Math.sqrt(n)); i >= 1; i--) {
            if (n % i == 0) return [n / i, i]; 
    }
}

const shuffle = a => a
      .map(x => ({sort: Math.random(), value: x}))
      .sort((a, b) => a.sort - b.sort)
      .map(x => x.value);


let opened_el = null;
let correct = 0;
let incorrect;
let disabled = false;

function updateStats() {
	console.log("updateStats() placeholder");
}

function handleClick(ev) {
	let el = ev.target;

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
			correct++;
		} else {
			disabled = true;
			[content, opened_el.querySelector(".tile-content")].forEach(tile => setTimeout(function() {
				tile.classList.add("hidden");
				disabled = false;
			}, 500));
			opened_el = null;
			incorrect++;
		}
		updateStats();
	}
}



function makeGrid(pairs) {
	incorrect = -pairs.length
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
						children: [pair[0]]
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

function newGame() {
	let pairs = JSON.parse(sessionStorage.getItem("pairs"));
	document.getElementById("game").replaceWith(makeGrid(pairs));
}

window.addEventListener("load", newGame);
