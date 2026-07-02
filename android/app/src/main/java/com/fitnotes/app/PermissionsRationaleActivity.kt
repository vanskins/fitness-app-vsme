package com.fitnotes.app

import android.app.Activity
import android.os.Bundle
import android.widget.LinearLayout
import android.widget.TextView

class PermissionsRationaleActivity : Activity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    val container = LinearLayout(this).apply {
      orientation = LinearLayout.VERTICAL
      setPadding(48, 64, 48, 48)
    }

    val title = TextView(this).apply {
      text = "Health Data Access"
      textSize = 22f
      setTextColor(0xFF15171A.toInt())
    }

    val body = TextView(this).apply {
      text =
        "FitNotes reads your step count from Health Connect only to show your daily activity. " +
          "Workout logging stays separate, and FitNotes does not write or overwrite Health Connect data."
      textSize = 16f
      setTextColor(0xFF6B7280.toInt())
      setPadding(0, 24, 0, 0)
    }

    container.addView(title)
    container.addView(body)
    setContentView(container)
  }
}
