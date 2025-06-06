﻿/// <reference path="../../babylon.max.js" />
/// <reference path="babylon.demo.js" />

// Wind.mp3 Recorded by Mark DiAngelo 

window.addEventListener("load", function () {
    setTimeout(function () {
        var canvas = document.getElementById("renderCanvas");
        var soundBtn = document.getElementById("soundButton");
        var camBtn = document.getElementById("cameraButton");
        var speakersBtn = document.getElementById("speakersButton");

        // Babylon
        var engine = new BABYLON.Engine(canvas, true, null, true);
        engine.enableOfflineSupport = true;

        function togglerDebugLayer() {
            var scene = engine.scenes[0];
            if (scene.debugLayer.isVisible()) {
                scene.debugLayer.hide();
            }
            else {
                scene.debugLayer.show();
            }
        }

        document.addEventListener("keydown", function (event) {
            if (event.ctrlKey && event.shiftKey && event.keyCode == 68) {
                togglerDebugLayer();
            }
        });

        function onNewGamepadConnected(gamepad) {
            var xboxpad = gamepad;
            xboxpad.onbuttondown(function (buttonValue) {
                if (buttonValue == BABYLON.Xbox360Button.Y) {
                    togglerDebugLayer();
                }
                if (buttonValue == BABYLON.Xbox360Button.A) {
                    switchCamera();
                }
            });
        }

        var gamepads = new BABYLON.Gamepads(function (gamepad) { onNewGamepadConnected(gamepad); });

        // Demo
        var demoScheduler = new BABYLON.DEMO.Scheduler();
        demoScheduler.onInteractive = function () {
            if (!soundsInitialized) {
                getSoundsFromScene();
                soundsInitialized = true;
            }
            playSounds();
        }

        demoScheduler.run("demo.json", engine, function () {
            setTimeout(function () {
                switchCamera();
                togglerDebugLayer();
            }, 2000);
        });

        var soundMuted = false;
        var headphone = false;
        var soundsInitialized = false;

        var thunderSounds = [];
        var alwaysOnSounds = [];
        var thunderHandle;

        function getSoundsFromScene() {
            thunderSounds.push(engine.scenes[0].getSoundByName("thunder1"));
            thunderSounds.push(engine.scenes[0].getSoundByName("thunder2"));
            thunderSounds.push(engine.scenes[0].getSoundByName("thunder3"));

            alwaysOnSounds.push(engine.scenes[0].getSoundByName("firePart1"));
            alwaysOnSounds.push(engine.scenes[0].getSoundByName("firePart2"));
            alwaysOnSounds.push(engine.scenes[0].getSoundByName("firePart3"));
            alwaysOnSounds.push(engine.scenes[0].getSoundByName("firePart4"));
            alwaysOnSounds.push(engine.scenes[0].getSoundByName("wind"));
        }

        function playSounds() {
            for (var index = 0; index < alwaysOnSounds.length; index++) {
                alwaysOnSounds[index].play();
            }

            fireThunderSounds();
        }

        function stopSounds() {
            window.clearTimeout(thunderHandle);

            for (var index = 0; index < alwaysOnSounds.length; index++) {
                alwaysOnSounds[index].stop();
            }
        }

        function getRandomInt(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        function fireThunderSounds() {
            var randomIndex = getRandomInt(0, 2);
            var randomTiming = getRandomInt(5000, 25000);
            var thunderSound = thunderSounds[randomIndex];
            thunderSound.setPosition(new BABYLON.Vector3(getRandomInt(-15, 15), 15, getRandomInt(-15, 15)));
            thunderSound.play();
            thunderHandle = window.setTimeout(fireThunderSounds, randomTiming);
        }

        // UI
        switchSound = function () {
            if (soundMuted) {
                soundBtn.style.backgroundImage = "url(volume.png)";
                soundBtn.title = "Turn off the volume";
                BABYLON.Engine.audioEngine.setGlobalVolume(1);
            }
            else {
                soundBtn.style.backgroundImage = "url(mute.png)";
                soundBtn.title = "Turn on the volume";
                BABYLON.Engine.audioEngine.setGlobalVolume(0);
            }
            soundMuted = !soundMuted;
        }

        switchSpeakerType = function () {
            if (headphone) {
                speakersBtn.style.backgroundImage = "url(speaker.png)";
                speakersBtn.title = "Switch to headphone mode";
            }
            else {
                speakersBtn.style.backgroundImage = "url(headphone.png)";
                speakersBtn.title = "Switch to classic speaker mode";
            }
            headphone = !headphone;
            engine.scenes[0].headphone = headphone;
        }

        switchCamera = function () {
            if (!demoScheduler.interactive) {
                camBtn.disabled = true;
                demoScheduler.stop();
                var music = engine.scenes[0].getSoundByName("SponzaMusic.mp3")
                if (BABYLON.Engine.audioEngine.canUseWebAudio) {
                    music.setVolume(0, 1.5);
                    music.stop(1.5);
                }
                window.setTimeout(function () {
                    music.stop();
                    music.setVolume(1, 0.25);
                    camBtn.disabled = false;
                    camBtn.title = "Switch to demo mode";
                }, 1500);
                var fadePP = new BABYLON.DEMO.FadePostProcessEffect();
                fadePP.currentCamera = engine.scenes[0].activeCamera;
                fadePP.duration = 2000;
                fadePP.scene = engine.scenes[0];
                fadePP.toBlack = true;
                fadePP.start();
                window.setTimeout(function () {
                    var fadePP = new BABYLON.DEMO.FadePostProcessEffect();
                    fadePP.currentCamera = engine.scenes[0].cameras[0];
                    fadePP.duration = 500;
                    fadePP.scene = engine.scenes[0];
                    fadePP.start();
                    engine.scenes[0].activeCamera = engine.scenes[0].cameras[0];
                    engine.scenes[0].activeCamera.attachControl(canvas);
                    demoScheduler.interactive = true;
                }, 2000);
            }
            else {
                camBtn.title = "Switch to interactive mode";
                stopSounds();
                demoScheduler.interactive = false;
                var fadePP = new BABYLON.DEMO.FadePostProcessEffect();
                fadePP.currentCamera = engine.scenes[0].activeCamera;
                fadePP.duration = 1000;
                fadePP.scene = engine.scenes[0];
                fadePP.toBlack = true;
                fadePP.start();
                window.setTimeout(function () {
                    var fadePP = new BABYLON.DEMO.FadePostProcessEffect();
                    fadePP.currentCamera = engine.scenes[0].cameras[1];
                    fadePP.duration = 500;
                    fadePP.scene = engine.scenes[0];
                    fadePP.start();
                    demoScheduler.restart();
                }, 1000);
            }
        }

        var renderingZone = document.getElementById("renderingZone");
        var isFullScreen = false;

        document.addEventListener("fullscreenchange", onFullScreenChange, false);
        document.addEventListener("mozfullscreenchange", onFullScreenChange, false);
        document.addEventListener("webkitfullscreenchange", onFullScreenChange, false);
        document.addEventListener("msfullscreenchange", onFullScreenChange, false);

        function onFullScreenChange() {
            if (document.fullscreen !== undefined) {
                isFullScreen = document.fullscreen;
            } else if (document.mozFullScreen !== undefined) {
                isFullScreen = document.mozFullScreen;
            } else if (document.webkitIsFullScreen !== undefined) {
                isFullScreen = document.webkitIsFullScreen;
            } else if (document.msIsFullScreen !== undefined) {
                isFullScreen = document.msIsFullScreen;
            }
        }

        switchFullscreen = function () {
            if (!isFullScreen) {
                BABYLON.Tools.RequestFullscreen(renderingZone);
            }
            else {
                BABYLON.Tools.ExitFullscreen();
            }
        };
    }, 1000)
});