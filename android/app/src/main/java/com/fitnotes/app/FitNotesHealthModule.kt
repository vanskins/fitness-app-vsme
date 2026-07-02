package com.fitnotes.app

import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.StepsRecord
import androidx.health.connect.client.request.AggregateRequest
import androidx.health.connect.client.time.TimeRangeFilter
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.time.LocalDate
import java.time.ZoneId

class FitNotesHealthModule(
  private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {
  private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
  private val stepReadPermission = HealthPermission.getReadPermission(StepsRecord::class)
  private val requiredPermissions = setOf(stepReadPermission)
  private var pendingPermissionPromise: Promise? = null

  override fun getName(): String = "FitNotesHealth"

  @ReactMethod
  fun isAvailable(promise: Promise) {
    val status = HealthConnectClient.getSdkStatus(reactContext)
    promise.resolve(status == HealthConnectClient.SDK_AVAILABLE)
  }

  @ReactMethod
  fun getPermissionStatus(promise: Promise) {
    val client = getClientOrReject(promise) ?: return
    scope.launch {
      try {
        val granted = client.permissionController.getGrantedPermissions()
        promise.resolve(if (granted.containsAll(requiredPermissions)) "granted" else "denied")
      } catch (error: Exception) {
        promise.reject("HEALTH_PERMISSION_STATUS_FAILED", error)
      }
    }
  }

  @ReactMethod
  fun requestPermissions(promise: Promise) {
    if (pendingPermissionPromise != null) {
      promise.reject("HEALTH_PERMISSION_REQUEST_ACTIVE", "A Health Connect permission request is already active.")
      return
    }

    val activity = reactContext.currentActivity as? MainActivity
    if (activity == null) {
      promise.reject("HEALTH_ACTIVITY_UNAVAILABLE", "Cannot request Health Connect permissions without the FitNotes Activity.")
      return
    }

    pendingPermissionPromise = promise
    activity.requestHealthConnectPermissions(requiredPermissions) { grantedPermissions ->
      val pendingPromise = pendingPermissionPromise ?: return@requestHealthConnectPermissions
      pendingPermissionPromise = null
      pendingPromise.resolve(
        if (grantedPermissions.containsAll(requiredPermissions)) "granted" else "denied"
      )
    }
  }

  @ReactMethod
  fun readDailyActivity(date: String, promise: Promise) {
    val client = getClientOrReject(promise) ?: return
    scope.launch {
      try {
        val localDate = LocalDate.parse(date)
        val zone = ZoneId.systemDefault()
        val start = localDate.atStartOfDay(zone).toInstant()
        val end = localDate.plusDays(1).atStartOfDay(zone).toInstant()
        val response = client.aggregate(
          AggregateRequest(
            metrics = setOf(StepsRecord.COUNT_TOTAL),
            timeRangeFilter = TimeRangeFilter.between(start, end)
          )
        )

        val result = Arguments.createMap().apply {
          putDouble("steps", (response[StepsRecord.COUNT_TOTAL] ?: 0L).toDouble())
          putDouble("distanceKm", 0.0)
          putDouble("activeCalories", 0.0)
          putNull("activeMinutes")
        }

        withContext(Dispatchers.Main) {
          promise.resolve(result)
        }
      } catch (error: Exception) {
        promise.reject("HEALTH_READ_FAILED", error)
      }
    }
  }

  private fun getClientOrReject(promise: Promise): HealthConnectClient? {
    val status = HealthConnectClient.getSdkStatus(reactContext)
    if (status != HealthConnectClient.SDK_AVAILABLE) {
      promise.reject("HEALTH_CONNECT_UNAVAILABLE", "Health Connect is not available on this device.")
      return null
    }
    return HealthConnectClient.getOrCreate(reactContext)
  }
}
