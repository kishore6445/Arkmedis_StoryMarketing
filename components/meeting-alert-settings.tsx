'use client'

import React, { useState, useEffect } from 'react'
import { Bell, CheckCircle2, AlertCircle, Save, Loader } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MeetingAlertPreferences {
  enabled: boolean
  soundEnabled: boolean
  browserNotificationsEnabled: boolean
  reminderTimes: {
    oneDay: boolean
    oneHour: boolean
    atStart: boolean
  }
  showWidget: 'sidebar' | 'dashboard' | 'both'
  phoneNumber: string
  whatsappEnabled: boolean
}

const DEFAULT_PREFERENCES: MeetingAlertPreferences = {
  enabled: true,
  soundEnabled: true,
  browserNotificationsEnabled: true,
  reminderTimes: {
    oneDay: true,
    oneHour: true,
    atStart: true
  },
  showWidget: 'dashboard',
  phoneNumber: '',
  whatsappEnabled: true
}

export function MeetingAlertSettings() {
  const [preferences, setPreferences] = useState<MeetingAlertPreferences>(DEFAULT_PREFERENCES)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [saveMessage, setSaveMessage] = useState('')

  // Load preferences from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('meeting_alert_preferences')
    if (stored) {
      try {
        setPreferences(JSON.parse(stored))
      } catch (error) {
        console.error('Error loading preferences:', error)
      }
    }
  }, [])

  const handleSavePreferences = async () => {
    setIsSaving(true)
    setSaveStatus('idle')

    try {
      // Save to localStorage
      localStorage.setItem('meeting_alert_preferences', JSON.stringify(preferences))

      // Also sync with backend if user has WhatsApp enabled
      if (preferences.whatsappEnabled && preferences.phoneNumber) {
        const response = await fetch('/api/user/meeting-preferences', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phoneNumber: preferences.phoneNumber,
            notificationsEnabled: preferences.enabled,
            reminders: preferences.reminderTimes
          })
        })

        if (!response.ok) throw new Error('Failed to save to server')
      }

      setSaveStatus('success')
      setSaveMessage('Preferences saved successfully')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch (error) {
      setSaveStatus('error')
      setSaveMessage(error instanceof Error ? error.message : 'Failed to save preferences')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  const togglePreference = (key: keyof Omit<MeetingAlertPreferences, 'phoneNumber' | 'showWidget'>) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const toggleReminderTime = (time: 'oneDay' | 'oneHour' | 'atStart') => {
    setPreferences(prev => ({
      ...prev,
      reminderTimes: {
        ...prev.reminderTimes,
        [time]: !prev.reminderTimes[time]
      }
    }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Bell className="w-5 h-5 text-blue-600" />
          Meeting Alert Preferences
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Configure how you receive notifications for scheduled meetings
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        {/* Global Enable/Disable */}
        <div className="flex items-center justify-between pb-6 border-b border-gray-200">
          <div>
            <h4 className="font-medium text-gray-900">Enable Meeting Alerts</h4>
            <p className="text-sm text-gray-600 mt-1">
              Receive notifications for your scheduled meetings
            </p>
          </div>
          <button
            onClick={() => togglePreference('enabled')}
            className={cn(
              'relative inline-flex h-8 w-14 items-center rounded-full transition-colors',
              preferences.enabled ? 'bg-blue-600' : 'bg-gray-300'
            )}
          >
            <span
              className={cn(
                'inline-block h-6 w-6 transform rounded-full bg-white transition-transform',
                preferences.enabled ? 'translate-x-7' : 'translate-x-1'
              )}
            />
          </button>
        </div>

        {/* Notification Channels */}
        {preferences.enabled && (
          <>
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Notification Channels</h4>

              {/* Sound Alerts */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <label className="font-medium text-gray-900 block">Sound Alerts</label>
                  <p className="text-sm text-gray-600 mt-1">
                    Play a sound for imminent meetings (1 hour before)
                  </p>
                </div>
                <button
                  onClick={() => togglePreference('soundEnabled')}
                  className={cn(
                    'relative inline-flex h-8 w-14 items-center rounded-full transition-colors',
                    preferences.soundEnabled ? 'bg-green-600' : 'bg-gray-300'
                  )}
                >
                  <span
                    className={cn(
                      'inline-block h-6 w-6 transform rounded-full bg-white transition-transform',
                      preferences.soundEnabled ? 'translate-x-7' : 'translate-x-1'
                    )}
                  />
                </button>
              </div>

              {/* Browser Notifications */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <label className="font-medium text-gray-900 block">Browser Notifications</label>
                  <p className="text-sm text-gray-600 mt-1">
                    Show desktop notifications for upcoming meetings
                  </p>
                </div>
                <button
                  onClick={() => togglePreference('browserNotificationsEnabled')}
                  className={cn(
                    'relative inline-flex h-8 w-14 items-center rounded-full transition-colors',
                    preferences.browserNotificationsEnabled ? 'bg-blue-600' : 'bg-gray-300'
                  )}
                >
                  <span
                    className={cn(
                      'inline-block h-6 w-6 transform rounded-full bg-white transition-transform',
                      preferences.browserNotificationsEnabled ? 'translate-x-7' : 'translate-x-1'
                    )}
                  />
                </button>
              </div>
            </div>

            {/* Reminder Times */}
            <div className="space-y-4 pb-6 border-b border-gray-200">
              <h4 className="font-medium text-gray-900">Alert Reminders</h4>

              <div className="space-y-3">
                {/* 1 Day Before */}
                <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.reminderTimes.oneDay}
                    onChange={() => toggleReminderTime('oneDay')}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <div>
                    <span className="font-medium text-gray-900">1 Day Before</span>
                    <p className="text-sm text-gray-600">Get a reminder 24 hours before meeting</p>
                  </div>
                </label>

                {/* 1 Hour Before */}
                <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.reminderTimes.oneHour}
                    onChange={() => toggleReminderTime('oneHour')}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <div>
                    <span className="font-medium text-gray-900">1 Hour Before (Critical)</span>
                    <p className="text-sm text-gray-600">Urgent reminder 1 hour before meeting</p>
                  </div>
                </label>

                {/* At Start Time */}
                <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.reminderTimes.atStart}
                    onChange={() => toggleReminderTime('atStart')}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <div>
                    <span className="font-medium text-gray-900">At Meeting Start Time</span>
                    <p className="text-sm text-gray-600">Notification when meeting begins</p>
                  </div>
                </label>
              </div>
            </div>

            {/* WhatsApp Settings */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">WhatsApp Notifications</h4>

              {/* WhatsApp Toggle */}
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                <div>
                  <label className="font-medium text-gray-900 block">Enable WhatsApp Alerts</label>
                  <p className="text-sm text-gray-600 mt-1">
                    Receive meeting reminders via WhatsApp
                  </p>
                </div>
                <button
                  onClick={() => togglePreference('whatsappEnabled')}
                  className={cn(
                    'relative inline-flex h-8 w-14 items-center rounded-full transition-colors',
                    preferences.whatsappEnabled ? 'bg-green-600' : 'bg-gray-300'
                  )}
                >
                  <span
                    className={cn(
                      'inline-block h-6 w-6 transform rounded-full bg-white transition-transform',
                      preferences.whatsappEnabled ? 'translate-x-7' : 'translate-x-1'
                    )}
                  />
                </button>
              </div>

              {/* Phone Number Input */}
              {preferences.whatsappEnabled && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-900">
                    WhatsApp Phone Number
                  </label>
                  <p className="text-xs text-gray-600 mb-2">
                    Enter your phone number with country code (e.g., +919876543210)
                  </p>
                  <input
                    type="tel"
                    value={preferences.phoneNumber}
                    onChange={(e) => setPreferences(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500">
                    We'll send you meeting reminders on this WhatsApp number
                  </p>
                </div>
              )}
            </div>

            {/* Widget Display Location */}
            <div className="space-y-4 pb-6 border-b border-gray-200">
              <h4 className="font-medium text-gray-900">Widget Display</h4>
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="showWidget"
                    value="dashboard"
                    checked={preferences.showWidget === 'dashboard'}
                    onChange={() => setPreferences(prev => ({ ...prev, showWidget: 'dashboard' }))}
                    className="w-4 h-4"
                  />
                  <span className="text-gray-900">Show on Dashboard only</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="showWidget"
                    value="sidebar"
                    checked={preferences.showWidget === 'sidebar'}
                    onChange={() => setPreferences(prev => ({ ...prev, showWidget: 'sidebar' }))}
                    className="w-4 h-4"
                  />
                  <span className="text-gray-900">Show in Sidebar only</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="showWidget"
                    value="both"
                    checked={preferences.showWidget === 'both'}
                    onChange={() => setPreferences(prev => ({ ...prev, showWidget: 'both' }))}
                    className="w-4 h-4"
                  />
                  <span className="text-gray-900">Show in Both locations</span>
                </label>
              </div>
            </div>
          </>
        )}

        {/* Status Message */}
        {saveStatus !== 'idle' && (
          <div className={cn(
            'p-4 rounded-lg flex items-start gap-3',
            saveStatus === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          )}>
            {saveStatus === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <p className={saveStatus === 'success' ? 'text-green-900' : 'text-red-900'}>
              {saveMessage}
            </p>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
          <button
            onClick={handleSavePreferences}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
          >
            {isSaving ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Preferences
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
