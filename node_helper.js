
const NodeHelper = require("node_helper");

const mqtt = require("mqtt");
module.exports = NodeHelper.create({

	start: function() {
		console.log("Starting module: " + this.name);
		this.config = {};
		this.config.server = "home.local";
		this.config.port = "1883";
		this.config.mqttTopic = "test/timstock/set";
		this.mqttClient = 0;

	},

	setupMQTT: function() {
		if(this.mqttClient) {
			return;
		}
		self = this;
		var server = "mqtt://" + this.config.server + ":" + this.config.port;
		client = mqtt.connect(server, {
			//username: config.username,
			//password: config.password,
			clientId:"MQTT_COMMAND" + Math.random().toString(16).substr(2, 8),
			keepalive:60,
		});
		this.mqttClient = client;
		//
		//  OnConnect - we need to subscribe to the COMMAND topic
		//  if an availability topic is defined then publish that
		//
		client.on("connect", function() {
			console.log("MQTT Connected");
			//Subscribe to command
			var cmd = self.config.mqttTopic;
			client.subscribe( cmd, { qos:0 });
		});

		//
		//  onDisconnect - send unavailable if that is defined
		//
		client.on("disconnect", function() {
			console.log("MQTT disconnected");
			//client.command.publishAvailability(false);
		});

		//
		//  onMessage - the command
		//
		client.on("message", function (mqttTopic, message) {
			console.log("got mqtt message", mqttTopic, message.toString());

			// Failsafe - check topic (even though we only subscribe to one)
			if(mqttTopic == self.config.mqttTopic) {
				// COMMAND
				console.log("COMMAND SET" + mqttTopic + message);
				command = JSON.parse(message.toString());
				console.log(command.mode);
				if (command.mode === "ON") {
					console.log("Sending socket notif");
					self.sendSocketNotification("TIMSTOCK_START", command);
				} else if (command.mode = "OFF") {
					self.sendSocketNotification("TIMSTOCK_STOP", command);
				}
			}
		});

		client.on("error", function (error) {
			console.log("Error" + error);
		});

	},

	// Override socketNotificationReceived method.
	socketNotificationReceived: function(notification, payload) {
		console.log(this.name + " received " + notification);

		if (notification === "CONFIG") {
			//this.config = payload;
			this.setupMQTT();
			return true;
		}

	},

});