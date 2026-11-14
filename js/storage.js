/*
  AstroVitals - storage.js
  Saves and loads check-ins using the browser's localStorage.

  License: MIT (see LICENSE)
  AI disclosure: drafted with the help of Claude (Anthropic), reviewed by the team.

  WHY try/catch EVERYWHERE?
  localStorage can fail: private browsing, storage full, blocked by browser
  settings, or broken saved data. If it fails, the app must keep working,
  so we fall back to a simple array in memory (lost when the page closes).

  DATA FORMAT
  One check-in ("entry") is a plain object, for example:
    {
      timestamp: "2026-11-14T08:30:00.000Z",   // when it was saved (ISO text)
      heartRate: 72, bpSystolic: 118, bpDiastolic: 76,
      glucose: 95, temperature: 36.6, sleep: 7.5, mood: 4,
      spo2: 98, weight: 70.5, exercise: 120     // optional ones may be missing
    }
  All entries are stored together as ONE JSON array under one key.

  NOTE: the name is VitalsStore (not "Storage") because the browser already
  has a built-in object called Storage.
*/

const VitalsStore = {

  // The key under which our data lives in localStorage
  KEY: "astrovitals.entries.v1",

  // Fallback used only when localStorage does not work
  memoryEntries: [],

  // Becomes false after the first failure, so the app can warn the user
  persistent: true,

  /* Returns all saved entries as an array, oldest first.
     Never throws: on any problem it returns what is in memory. */
  loadEntries() {
    try {
      const text = localStorage.getItem(this.KEY);
      if (text === null) {
        return [];                      // nothing saved yet
      }
      const entries = JSON.parse(text); // may throw if the text is damaged
      if (!Array.isArray(entries)) {
        return [];                      // unexpected shape - ignore it
      }
      return entries;
    } catch (error) {
      console.warn("AstroVitals: could not read saved data.", error);
      this.persistent = false;
      return this.memoryEntries;
    }
  },

  /* Adds one entry and saves the whole list.
     Returns true if it was saved to localStorage,
     false if it is only kept in memory. */
  saveEntry(entry) {
    const entries = this.loadEntries();

    // Add the time of saving if the caller did not set one
    const newEntry = { timestamp: new Date().toISOString(), ...entry };
    entries.push(newEntry);

    try {
      localStorage.setItem(this.KEY, JSON.stringify(entries));
      this.persistent = true;           // saving works (again)
      return true;
    } catch (error) {
      console.warn("AstroVitals: could not save data. Keeping it in memory only.", error);
      this.persistent = false;
      this.memoryEntries = entries;
      return false;
    }
  },

  /* Replaces the whole history with a new list (used for the sample data).
     Returns true if it was saved to localStorage. */
  replaceEntries(entries) {
    try {
      localStorage.setItem(this.KEY, JSON.stringify(entries));
      this.persistent = true;
      return true;
    } catch (error) {
      console.warn("AstroVitals: could not save data. Keeping it in memory only.", error);
      this.persistent = false;
      this.memoryEntries = entries;
      return false;
    }
  },

  /* Returns the most recent entry, or null if there is none */
  getLatestEntry() {
    const entries = this.loadEntries();
    return entries.length > 0 ? entries[entries.length - 1] : null;
  },

  /* Deletes all saved entries (used by a "Clear history" button later) */
  clearEntries() {
    this.memoryEntries = [];
    try {
      localStorage.removeItem(this.KEY);
    } catch (error) {
      console.warn("AstroVitals: could not clear saved data.", error);
    }
  }
};
