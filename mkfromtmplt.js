function mkFromTmplt(tmplt) {
	if (typeof tmplt === "string") return tmplt;
	let el = document.createElement(tmplt.tag);
	if (tmplt.attrs !== undefined)
		Object.entries(tmplt.attrs).forEach(a => el.setAttribute(...a));
	if (tmplt.listeners !== undefined)
		Object.entries(tmplt.listeners).forEach(l => el.addEventListener(...l));
	if (tmplt.style !== undefined)
		Object.entries(tmplt.style).forEach(s => el.style.setProperty(...s.flat()));
	if (tmplt.children !== undefined)
		tmplt.children.forEach(c => el.append(mkFromTmplt(c)));
	return el;
}
