package com.airpods.custom.sensors

import kotlin.math.abs

class HeadGestureDetector(
    private val threshold: Float = 1.5f
) {
    private var lastPitch = 0f
    private var nodCount = 0

    enum class Gesture { NONE, NOD, SHAKE }

    fun detect(pitch: Float): Gesture {
        val delta = pitch - lastPitch
        if (abs(delta) > threshold) {
            nodCount++
            lastPitch = pitch
        }
        if (nodCount >= 2) {
            nodCount = 0
            return Gesture.NOD
        }
        return Gesture.NONE
    }
}
