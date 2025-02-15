;(function(window, Utils) {
    'use strict';

    var existingServerListApis = [
        "https://raw.githubusercontent.com/ainilili/ratel/master/serverlist.json",
    ];
    var existingServerList = [
        "121.5.140.133:1024:Nico[v1.3.0]"
    ];

    function Server(s) {
        if (!Server.pattern.test(s)) {
            throw new Error("Illegal server address. Server address schema like: ip:port:name[version].");
        }
        var arr = Server.pattern.exec(s);
        this.host = arr[1];
        this.port = parseInt(arr[2]);
        if (arr[3]) this.name = arr[3];
        if (arr[4]) this.version = parseInt(arr[4].replace(/\./g, ""));
    }

    Server.pattern = /([\w\.]+):(\d+)(?::(\w+)\[v(1\.\d\.\d)\])?/i;
    Server.requiredMinVersion = "v1.2.7";

    Server.prototype.compareVersion = function(otherVersion) {
        if (otherVersion.startsWith("v") || otherVersion.startsWith("V")) {
            otherVersion = otherVersion.substr(1);
        }

        return this.version - parseInt(otherVersion.replace(/\./g, ""));
    };

    Server.prototype.toString = function() {
        var s = this.host + ":" + this.port;
        if (this.name) s += ":" + this.name;
        if (this.version) s += "[v" + this.version + "]";
        return s;
    };

    // ---------------------------------------------------------------------------------------------
    var defaultLoadTimeout = 1000;

    function loadServerList() {
        existingServerListApis.forEach((api, i) => {
            Utils.timeout(new Promise((resolve, reject) => {
                fetch(api)
                .then(response => {
                    resolve(response.json())
                })
                .catch((e) => {
                    reject(e)
                });
            }), defaultLoadTimeout)
            .then(data => {
                showServerList(existingServerList = data.length > 0 ? data : existingServerList)
            })
            .catch(showServerList);
        });
    }

    function showServerList() {
        var contentDiv = document.querySelector("#content");
        contentDiv.innerHTML += "Nickname: ";
        // existingServerList.forEach((server, i) => {
        //     contentDiv.innerHTML += (i + 1) + ". &nbsp;" + server + "</br>";
        // });
        var input = document.querySelector("#input");
        input.addEventListener("keypress", selectServer, false);
        input.focus();
    }

    function selectServer(e) {
        if (e.keyCode != 13) {
            return;
        }

        var contentEl = document.querySelector("#content");
        var input = document.querySelector("#input");
        var s = "49.235.95.125:9998:Nico[v1.0.0]"
        var server = new Server(s);
        window.name = input.value;
        input.value = "";

        var contentDiv = document.querySelector("#content");
        contentDiv.innerHTML += name + " </br>";

        start(server.host, server.port)
            .then(() => input.removeEventListener("keypress", selectServer, false))
            .catch(e => {
                console.error(e);
                contentEl.innerHTML += "Connect server [" + server.toString() + "] fail, please choose another server.</br>";
            });
    }

    function start(host, port) {
        if (typeof host === "undefined") {
            host = "127.0.0.1";
        }
        if (typeof port === "undefined") {
            port = 1025;
        }

        window.wsClient = new WsClient("ws://" + host + ":" + port + "/ws");
        window.wsClient.panel.help()

        document.querySelector("#content").innerHTML += "Connect to ws://" + host + ":" + port + "/ws .</br></br>";
        var client = window.wsClient.init();
        return client;
    }

    window.onload = function() {
        defaultSite.render();
        loadServerList();
    };
} (this, this.Utils));