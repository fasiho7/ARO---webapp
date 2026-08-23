"use client";

import { useState } from "react";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Toggle } from "@/components/ui/Toggle";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/Button";
import { careerOptions } from "@/data/roadmaps/careerOptions";
import { profileDisplayName } from "@/lib/auth/display";
import { validateFullName, validateUsername } from "@/lib/auth/validation";

export function SettingsForm() {
  const { theme, setTheme } = useTheme();
  const { user, profile, configured, updateProfile } = useAuth();
  const [language, setLanguage] = useState("English");
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [streakNotifs, setStreakNotifs] = useState(true);
  const [productNotifs, setProductNotifs] = useState(false);
  const [shareProgress, setShareProgress] = useState(false);
  const [dailyGoal, setDailyGoal] = useState("45 minutes");
  const profileId = profile?.id ?? "";
  const [formForId, setFormForId] = useState(profileId);
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [username, setUsername] = useState(profile?.username ?? "");
  const [preferredTrack, setPreferredTrack] = useState(
    profile?.selected_career ?? "",
  );
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");

  if (formForId !== profileId) {
    setFormForId(profileId);
    setFullName(profile?.full_name ?? "");
    setUsername(profile?.username ?? "");
    setPreferredTrack(profile?.selected_career ?? "");
  }

  async function saveAccount() {
    setSaveMessage("");
    setSaveError("");
    const nameError = validateFullName(fullName);
    const usernameError = validateUsername(username);
    if (nameError) {
      setSaveError(nameError);
      return;
    }
    if (usernameError) {
      setSaveError(usernameError);
      return;
    }
    setSaving(true);
    const { error } = await updateProfile({
      full_name: fullName.trim(),
      username: username.trim().toLowerCase(),
      selected_career: preferredTrack || null,
    });
    setSaving(false);
    if (error) {
      setSaveError(error);
      return;
    }
    setSaveMessage("Profile saved.");
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Settings"
        description="Appearance stays on this device. Your name and selected career are stored on your Aro profile."
      />

      <div className="space-y-4">
        <Card>
          <h2 className="display text-base font-semibold">Appearance</h2>
          <Toggle
            label="Dark mode"
            description="Aro defaults to the dark studio look from the brand preview."
            checked={theme === "dark"}
            onChange={(checked) => setTheme(checked ? "dark" : "light")}
          />
        </Card>

        <Card>
          <h2 className="display text-base font-semibold">Profile</h2>
          <label className="mt-3 block text-sm">
            <span className="text-muted">Full name</span>
            <input
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className="mt-1.5 w-full rounded-xl border border-line bg-surface-2 px-3 py-2.5 text-ink"
            />
          </label>
          <label className="mt-4 block text-sm">
            <span className="text-muted">Username</span>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              className="mt-1.5 w-full rounded-xl border border-line bg-surface-2 px-3 py-2.5 text-ink"
            />
            <span className="mt-1.5 block text-xs text-muted">
              3–20 characters. Letters, numbers, and underscore.
            </span>
          </label>
          <label className="mt-4 block text-sm">
            <span className="text-muted">Preferred career path</span>
            <select
              value={preferredTrack}
              onChange={(event) => setPreferredTrack(event.target.value)}
              className="mt-1.5 w-full rounded-xl border border-line bg-surface-2 px-3 py-2.5 text-ink"
            >
              <option value="">Not selected yet</option>
              {careerOptions.map((career) => (
                <option key={career.slug} value={career.slug}>
                  {career.title}
                </option>
              ))}
            </select>
          </label>
          {saveError ? (
            <p className="mt-3 text-sm text-danger">{saveError}</p>
          ) : null}
          {saveMessage ? (
            <p className="mt-3 text-sm text-success">{saveMessage}</p>
          ) : null}
          <Button
            type="button"
            className="mt-4"
            disabled={saving}
            onClick={() => void saveAccount()}
          >
            {saving ? "Saving…" : "Save profile"}
          </Button>
        </Card>

        <Card>
          <h2 className="display text-base font-semibold">Learning Preferences</h2>
          <label className="mt-3 block text-sm">
            <span className="text-muted">Language</span>
            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              className="mt-1.5 w-full rounded-xl border border-line bg-surface-2 px-3 py-2.5 text-ink"
            >
              <option>English</option>
              <option>Urdu</option>
            </select>
          </label>
          <label className="mt-4 block text-sm">
            <span className="text-muted">Daily goal</span>
            <select
              value={dailyGoal}
              onChange={(event) => setDailyGoal(event.target.value)}
              className="mt-1.5 w-full rounded-xl border border-line bg-surface-2 px-3 py-2.5 text-ink"
            >
              <option>20 minutes</option>
              <option>45 minutes</option>
              <option>90 minutes</option>
            </select>
          </label>
        </Card>

        <Card>
          <h2 className="display text-base font-semibold">Notifications</h2>
          <Toggle
            label="Email reminders"
            description="A weekly summary of streak and problems solved."
            checked={emailNotifs}
            onChange={setEmailNotifs}
          />
          <Toggle
            label="Streak alerts"
            description="Nudge me if I am about to lose a streak."
            checked={streakNotifs}
            onChange={setStreakNotifs}
          />
          <Toggle
            label="Product updates"
            description="New roadmaps and challenges."
            checked={productNotifs}
            onChange={setProductNotifs}
          />
        </Card>

        <Card>
          <h2 className="display text-base font-semibold">Privacy</h2>
          <Toggle
            label="Show progress on profile"
            description="Others would see streaks and awards later. Off for now."
            checked={shareProgress}
            onChange={setShareProgress}
          />
        </Card>

        <Card>
          <h2 className="display text-base font-semibold">Account</h2>
          <p className="mt-2 text-sm text-muted">
            Signed in as {profileDisplayName(profile, user)}
            {user?.email ? ` · ${user.email}` : ""}
          </p>
          {!configured ? (
            <p className="mt-3 rounded-xl border border-dashed border-line px-3 py-3 text-sm text-muted">
              Supabase keys are missing in <code>.env.local</code>, so this
              session is local-only.
            </p>
          ) : (
            <p className="mt-3 text-sm text-muted">
              Passwords are handled by Supabase Auth. Aro never stores them.
            </p>
          )}
          <div className="mt-4 max-w-xs">
            <LogoutButton />
          </div>
        </Card>
      </div>
    </div>
  );
}
