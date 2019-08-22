/* global Module */

/* Magic Mirror
 * Module: MMM-Time
 *
 * By Fredrik Santander   
 * MIT Licensed.
 */

Module.register("MMM-Timstock", {

	// Define module defaults
	defaults: {	
		timerinterval: 1000,
	},

	//
	//	OnStart-method
	//
	start: function () {
		Log.log("Starting module: " + this.name);

		this.timerText = "";
		this.startTime = 0;
		this.timerMinutes = 20;
		this.timer_on = false;
		this.timer = 0;
		this.remainingMinutes = 0;
		this.remainingSeconds = 0;
		this.timerinterval = this.config.timerinterval;
		this.sendSocketNotification("CONFIG", this.config);
	},

	// Subclass getStyles method.
	getStyles: function() {
		return ["MMM-Timstock.css"];
	},
	//
	// onSocketNotification
	//		- Todo: enable debug information or other info to be presented on screen
	//

	socketNotificationReceived: function (notification, payload) {
		Log.log(this.name + " received a socket notification: " + notification + " - Payload: " + payload);
		self = this;
		if (notification === "TIMSTOCK_START") {
			this.timer_on = true;
			this.timerMinutes = payload.minutes;
			this.timerinterval = payload.interval ? payload.interval : this.config.timerinterval;
			this.timerText = payload.text;
			this.startTime = Date.now();
			if(this.timer) {
				clearInterval(this.timer);
			}
			this.timer = setInterval(function() {
				self.updateTimer(self);
			}, this.timerinterval);

		} else if(notification === "TIMSTOCK_STOP") {
			if(this.timer) {
				clearInterval(this.timer);
			}
		}
	},

	updateTimer(self) {
		var elapsedTime = Date.now() - self.startTime;
		var elapsedMinutes = Math.trunc((elapsedTime) / 60000);
		self.remainingSeconds = 60 - Math.trunc((elapsedTime % 60000) / 1000);
		self.remainingMinutes = self.timerMinutes - elapsedMinutes;
		console.log(self.remainingMinutes, ":", self.remainingSeconds);
		if (self.remainingMinutes <= 0) {
			console.log("ending timer");
			self.finished = true;
			self.timer_on = false;
			clearInterval(self.timer);
			self.timer = 0;
		}
		this.updateDom();
	},

	// Override dom generator.
	getDom: function () {

		var minutes = this.timerMinutes;

		var wrapper = document.createElement("div");

		// Header and text
		var div = document.createElement("div");
		div.className = "header";
		wrapper.appendChild(div);
		if (this.timer) {
			div.innerText = this.timerText + " om " + String(this.remainingMinutes) + " minuter";
		} else {
			div.innerText = "";
		}
		var timeTable = document.createElement("table");
		timeTable.className = "timetable";
		var tr = document.createElement("tr");
		tr.className = "timerow";
		timeTable.appendChild(tr);
		for(var i=0; i<minutes; i++) {
			var td = document.createElement("td");
			tr.appendChild(td);
			if(i < this.remainingMinutes ) {
				td.className = "filled";
			}
/*			if (i == this.remainingMinutes - 1) {
				var t2 = document.createElement("table");
				t2.className = "secondtable";
				td.appendChild(t2);
				var tr2 = document.createElement("tr");
				t2.appendChild(tr2);
				for(var c=0; c<60;c++) {
					var td2 = document.createElement("td");
					tr2.appendChild(td2);
					if (c < Math.trunc(this.remainingSeconds)) {
						td2.className = "filledSecond";
					}
				}
			}
			*/
		}
		wrapper.appendChild(timeTable);
		return wrapper;
	}
});
