package com.airpods.custom.audio

import android.media.audiofx.AcousticEchoCanceler
import android.media.audiofx.NoiseSuppressor
import android.util.Log

class NoiseCancellationManager {
    private var noiseSuppressor: NoiseSuppressor? = null
    private var echoCanceler: AcousticEchoCanceler? = null

    fun enableNoiseSuppression(audioSessionId: Int): Boolean {
        if (audioSessionId <= 0) return false
        
        if (NoiseSuppressor.isAvailable()) {
            noiseSuppressor = NoiseSuppressor.create(audioSessionId)?.apply { enabled = true }
        }
        if (AcousticEchoCanceler.isAvailable()) {
            echoCanceler = AcousticEchoCanceler.create(audioSessionId)?.apply { enabled = true }
        }
        return noiseSuppressor?.enabled == true
    }

    fun release() {
        noiseSuppressor?.enabled = false
        noiseSuppressor?.release()
        echoCanceler?.enabled = false
        echoCanceler?.release()
    }
}
