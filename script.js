var config = ""
async function getMacros() {
	config = JSON.parse(await window.globalConfig.get())
	let content = `
		<table>
		<tr>
			<td>button</td>
			<td>action</td>
		</tr>
		<tr>
			<td>1</td>
<td><input type="text" id='macro1' value = '${config.macros["1"]}' ></td >
		</tr >
		<tr>
			<td>2</td>
			<td><input type="text" id='macro2' value = '${config.macros["2"]}'></td>
		</tr>
		<tr>
			<td>3</td>
			<td><input type="text" id='macro3' value = '${config.macros["3"]}'></td>
		</tr>
		<tr>
			<td>4</td>
			<td><input type="text" id='macro4' value = '${config.macros["4"]}'></td>
		</tr>
 		<tr>
			<td>5</td>
			<td><input type="text" id='macro5' value = '${config.macros["5"]}'></td>
		</tr>
		</table >
		<button onclick='saveMacros()'>save</button>
	`
	document.getElementById("content").innerHTML = content
}
async function getNob() {
	config = JSON.parse(await window.globalConfig.get())

	let content = `
		<table>
		<tr>
			<td>mode</td>
			<td>action</td>
		</tr>
		<tr>
			<td>0</td>
<td><input type="text" id='macro1' value = '${config.modes["0"]}' ></td >
		</tr >
		<tr>
			<td>1</td>
			<td><input type="text" id='macro2' value = '${config.modes["1"]}'></td>
		</tr>
		<tr>
			<td>2</td>
			<td><input type="text" id='macro3' value = '${config.modes["2"]}'></td>
		</tr>
		<tr>
			<td>3</td>
			<td><input type="text" id='macro4' value = '${config.modes["3"]}'></td>
		</tr>
		</table >
		<button onclick='saveModes()'>save</button>
	`
	document.getElementById("content").innerHTML = content
}
async function getCon() {
	config = JSON.parse(await window.globalConfig.get())
	let content = `
		<table>
		<tr>
			<td>serial path</td>
<td><input type="text" id='path' value = '${config.serial["path"]}' ></td >
		</tr >
		<tr>
			<td>baudRate</td>
			<td><input type="text" id='baudRate' value = '${config.serial["baudRate"]}'></td>
		</tr>
		<tr>
			<td>reconnect time</td>
			<td><input type="text" id='reconnectTime' value = '${config.serial["reconnectTime"]}'></td>
		</tr>
</table >
		<button onclick='saveCon()'>save</button>
	`
	document.getElementById("content").innerHTML = content
}
function saveMacros() {
	let val = ""
	for (x = 1; x < 6; x++) {
		val = document.getElementById(`macro${x}`).value
		config.macros[`${x}`] = val
	}
	window.globalConfig.save(JSON.stringify(config))
	saveBox()
}
function saveModes() {
	let val = ""
	for (x = 1; x < 5; x++) {
		val = document.getElementById(`macro${x}`).value
		config.modes[`${x - 1}`] = val
	}
	window.globalConfig.save(JSON.stringify(config))
	saveBox()
}
function saveCon() {
	let val = ""
	const Names = ["path", "baudRate", "reconnectTime"]
	for (x = 0; x < 3; x++) {
		val = document.getElementById(`${Names[x]}`).value
		config.serial[`${Names[x]}`] = val
	}
	window.globalConfig.save(JSON.stringify(config))
	saveBox()
}
async function check() {
	let isConn = await window.globalConfig.getCon()
	let mode = await window.globalConfig.getMode()
	console.log(isConn)
	let con = document.getElementById('isConnected')
	if (isConn) {
		con.innerHTML = `Connected mode: ${mode}`
		con.style.color = "green"
	} else {
		con.innerHTML = "Disconnected"
		con.style.color = "red"
	}
}
function saveBox() {
	document.getElementById("saveBox").style.opacity = 1;
	setTimeout(() => {
		document.getElementById("saveBox").style.opacity = 0;
	}, 2500)
}
setInterval(() => {
	console.log("checking connection...")
	check()
}, 1000)
