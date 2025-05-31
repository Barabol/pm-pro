const { SerialPort } = require('serialport')
const { exec } = require('child_process')
const { readFileSync, writeFileSync, existsSync } = require('fs')
const { app, BrowserWindow, Tray, Menu } = require('electron')
const { ipcMain } = require('electron/main')

var config = JSON.parse(readFileSync(__dirname + "/config.json", "UTF-8"))
console.log(config)
var serial = ""
serialReconnect()
var lastBrt = -1
var mode = "0"
var top = {}
var isConnected = false
let menu = Menu.buildFromTemplate([
	{ role: "quit" },
]);

function createWindow() {
	top.win = new BrowserWindow({
		width: 800,
		height: 600,
		icon: __dirname + "/src/img.png",
		minimizable: false,
		show: false,
		webPreferences: {
			preload: __dirname + '/preload.js'
		}
	})

	top.win.getNativeWindowHandle()
	top.win.loadFile('index.html')

	top.tray = new Tray(__dirname + `/src/${mode}.png`);
	top.win.on("close", () => {
		top.win.hide()
		top.win = null
	});

	top.tray.on('click', () => {
		if (top.win == null) {
			top.win = new BrowserWindow({
				width: 800,
				height: 600,
				icon: __dirname + "/src/img.png",
				minimizable: false,
				show: false,
				webPreferences: {
					preload: __dirname + '/preload.js'
				}
			})
			top.win.getNativeWindowHandle()
			top.win.loadFile('index.html')
			top.win.on("close", () => {
				top.win.hide()
				top.win = null
			});
		}
		top.win.show();
	})
	top.tray.setToolTip("mode 0");
	top.tray.setContextMenu(menu);
	top.icons = new BrowserWindow({
		show: false, webPreferences: { offscreen: true }
	});
}
app.whenReady().then(() => {
	createWindow()
	nativeTheme.themeSource = 'system'
	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow()
		}
	})
})
function serialRead(data) {
	try {
		data = String(data)
		console.log(data)
		if (data.charAt(0) == 's') {
			let brt = Number(data.split(':')[2])
			if (lastBrt == -1)
				lastBrt = brt
			if (brt)
				brt = Math.floor((brt / 4095) * 100)

			if (brt - lastBrt >= 30 || brt - lastBrt <= -30) {
				lastBrt = brt
				return
			}
			lastBrt = brt

			if (config.modes[mode] == "")
				return
			let command = config.modes[mode].split("%s")
			let ex = ""
			for (x = 0; x < command.length; x++) {
				ex += command[x]
				if ((x + 1) < command.length)
					ex += brt
			}
			try {
				exec(ex)
			}
			catch (err) {
				console.log("cannot run command")
			}
			return
		}
		if (data.charAt(0) <= '5') {
			if (config.macros[data] == "")
				return
			console.log("Starting: " + config.macros[data])
			try {
				exec(config.macros[data])
			}
			catch (err) {
				console.log("cannot run command")
			}
		}
		else {
			data = data.split(":")
			mode = data[1]
			top.tray.setToolTip(`mode ${mode}`);
			top.tray.setImage(__dirname + `/src/${mode}.png`);
		}
	}
	catch (err) {
		console.log("error while reading serial port")
		console.log(err)
	}

}


app.on('before-quit', () => {
})
ipcMain.handle("configSave", (info, data) => {
	writeFileSync(__dirname + "/config.json", data)
	config = JSON.parse(data)
})
ipcMain.handle("configGet", () => {
	return JSON.stringify(config)
})
ipcMain.handle("getMode", () => {
	return mode
})
ipcMain.handle("conGet", () => {
	return isConnected
})
async function serialReconnect() {
	setTimeout(() => {
		console.log("reconnectiong...")
		try {
			if (existsSync(config.serial.path)) {
				serial = new SerialPort({ path: config.serial.path, baudRate: Number(config.serial.baudRate) })
				if (!serial.closed) {
					serial.on("data", (data) => {
						serialRead(data)
					})
					serial.on('close', async () => {
						serialReconnect()
						console.log("close")
					})
				}
				else {
					isConnected = false
					serialReconnect()
				}
				console.log("connected")
				isConnected = true

			} else {
				isConnected = false
				serialReconnect()
			}
		}
		catch (err) {
			serialReconnect()
			console.log("cannot connect ",err)
		}
	}, config.serial.reconnectTime)
}

