function get_angle (current: number, target: number, pitch_angle_get: number) {
    if (pitch_angle_get == 0) {
        ans_get_angle = target
        ans_set_angle += -1
    } else {
        ans_get_angle = current
        if (current >= target + pitch_angle_get) {
            ans_get_angle += 0 - pitch_angle_get
        } else if (current <= target - pitch_angle_get) {
            ans_get_angle += pitch_angle_get
        } else {
            ans_get_angle = target
            ans_set_angle += -1
        }
    }
    return ans_get_angle
}
bluetooth.onBluetoothConnected(function () {
    basic.showIcon(IconNames.Happy)
})
bluetooth.onBluetoothDisconnected(function () {
    basic.showIcon(IconNames.Sad)
})
bluetooth.onUartDataReceived(serial.delimiters(Delimiters.NewLine), function () {
    line = bluetooth.uartReadUntil(serial.delimiters(Delimiters.NewLine))
    if (line == "lplay") {
        cmd_request = "lplay"
        bluetooth.uartWriteLine("OK request repeat play")
        bluetooth.uartWriteString("> ")
    } else if (line == "clear") {
        Repeat_playlist = []
        bluetooth.uartWriteLine("cleared")
        bluetooth.uartWriteString("> ")
    } else if (line == "list") {
        lcount = 0
        for (let index = 0; index < Repeat_playlist.length; index++) {
            bluetooth.uartWriteLine(Repeat_playlist[lcount])
            lcount += 1
        }
        bluetooth.uartWriteString("> ")
    } else if (line == "step on") {
        step_mode = 1
        step = 1
        bluetooth.uartWriteLine("step mode:ON")
        bluetooth.uartWriteString("> ")
    } else if (line == "step off") {
        step_mode = 0
        step = 0
        bluetooth.uartWriteLine("step mode:OFF")
        bluetooth.uartWriteString("> ")
    } else if (line == "step") {
        step_mode = 1
        step = 0
        bluetooth.uartWriteLine("1 step execute")
        bluetooth.uartWriteString("> ")
    } else if (line == "stop") {
        cmd_request = "stop"
        bluetooth.uartWriteLine("OK request stop")
        bluetooth.uartWriteString("> ")
    } else {
        cmds = line.split(",")
        if (cmds.length == 6) {
            cmds1 = cmds[0]
            if (cmds1 == "p") {
                cmd_request = "splay"
                Single_playlist = ["" + cmds[1] + "," + cmds[2] + "," + cmds[3] + "," + cmds[4] + "," + cmds[5]]
                bluetooth.uartWriteLine("OK request single play")
                bluetooth.uartWriteString("> ")
            }
        }
        cmds = line.split(":")
        if (cmds.length == 2) {
            if (cmds[0] == "a") {
                Repeat_playlist.push(cmds[1])
                bluetooth.uartWriteLine(cmds[1])
                bluetooth.uartWriteString("> ")
            }
        }
    }
})
function set_angle (fore_left: string, hide_left: string, fore_right: string, hide_right: string, pitch_angle: number) {
    ans_set_angle = 4
    fore_foot_angle = get_angle(fore_foot_angle, parseFloat(fore_left), pitch_angle)
    kitronik_i2c_16_servo.servoWrite(kitronik_i2c_16_servo.Servos.Servo1, fore_foot_angle + (fore_foot_angle_init - 90))
    hind_foot_angle = get_angle(hind_foot_angle, parseFloat(hide_left), pitch_angle)
    kitronik_i2c_16_servo.servoWrite(kitronik_i2c_16_servo.Servos.Servo2, hind_foot_angle + (hind_foot_angle_init - 90))
    fore_leg_angle = get_angle(fore_leg_angle, parseFloat(fore_right), pitch_angle)
    kitronik_i2c_16_servo.servoWrite(kitronik_i2c_16_servo.Servos.Servo3, fore_leg_angle + (fore_leg_angle_init - 90))
    hind_leg_angle = get_angle(hind_leg_angle, parseFloat(hide_right), pitch_angle)
    kitronik_i2c_16_servo.servoWrite(kitronik_i2c_16_servo.Servos.Servo4, hind_leg_angle + (hind_leg_angle_init - 90))
    return ans_set_angle
}
let list_para: string[] = []
let hind_leg_angle = 0
let fore_leg_angle = 0
let hind_foot_angle = 0
let fore_foot_angle = 0
let cmds1 = ""
let cmds: string[] = []
let lcount = 0
let cmd_request = ""
let line = ""
let ans_set_angle = 0
let ans_get_angle = 0
let step = 0
let step_mode = 0
let Single_playlist: string[] = []
let Repeat_playlist: string[] = []
let hind_leg_angle_init = 0
let fore_leg_angle_init = 0
let hind_foot_angle_init = 0
let fore_foot_angle_init = 0
led.setBrightness(10)
basic.showIcon(IconNames.House)
bluetooth.startUartService()
fore_foot_angle_init = 98
hind_foot_angle_init = 96
fore_leg_angle_init = 89
hind_leg_angle_init = 84
set_angle("90", "90", "90", "90", 0)
Repeat_playlist = [
"160,160,20,20,8",
"160,100,50,100,8",
"90,70,55,105,5",
"80,30,70,130,3",
"60,10,120,120,3",
"10,20,160,160,3",
"90,90,90,90,8"
]
Single_playlist = []
step_mode = 0
step = 0
let list_play_mode = 0
let playlist_work: string[] = []
let list_play_pointer = 0
loops.everyInterval(50, function () {
    if (list_play_mode == 0) {
        if (cmd_request == "lplay") {
            playlist_work = []
            list_play_pointer = 0
            for (let index = 0; index < Repeat_playlist.length; index++) {
                playlist_work.push(Repeat_playlist[list_play_pointer])
                list_play_pointer += 1
            }
            list_play_pointer = 0
            list_play_mode = 1
        } else if (cmd_request == "splay") {
            playlist_work = []
            list_play_pointer = 0
            for (let index = 0; index < Single_playlist.length; index++) {
                playlist_work.push(Single_playlist[list_play_pointer])
                list_play_pointer += 1
            }
            list_play_pointer = 0
            list_play_mode = 1
        }
    } else {
        list_para = playlist_work[list_play_pointer].split(",")
        if (0 == set_angle(list_para[0], list_para[1], list_para[2], list_para[3], parseFloat(list_para[4]))) {
            if (step == 0) {
                list_play_pointer += 1
            }
            if (step_mode == 1) {
                step = 1
            }
        }
        if (list_play_pointer >= playlist_work.length) {
            list_play_pointer = 0
            if (cmd_request != "lplay") {
                list_play_mode = 0
            }
        }
    }
})
