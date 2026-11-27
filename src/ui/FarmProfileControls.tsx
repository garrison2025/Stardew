import React, {useEffect, useState} from 'react';
import {activeFarm, createFarm, DEFAULT_FARM, farmProfiles, selectFarm, type FarmProfile} from '../lib/farm-profiles';

export default function FarmProfileControls() {
 const [profiles, setProfiles] = useState<FarmProfile[]>([]);
 const [active, setActive] = useState<FarmProfile | null>(null);
 const [name, setName] = useState('');
 const [error, setError] = useState('');
 const [creating, setCreating] = useState(false);
 useEffect(() => {
  try {
   setProfiles(farmProfiles());
   setActive(activeFarm());
  } catch (err) { setError(String(err)); }
 }, []);
 function run(action: () => void) {
  try { action(); }
  catch (err) { setError(String(err)); }
 }
 async function create() {
  setCreating(true);
  setError('');
  try { await createFarm(name); }
  catch (err) { setError(String(err)); }
  finally { setCreating(false); }
 }
 return <details className="panel farm-profiles">
  <summary>Farm profile{active ? ' · ' + active.name : ''}</summary>
  <p className="muted">Farm layouts and progress are separate for each profile on this browser. A new tab starts with Default farm. Save edits before switching.</p>
  <div className="formgrid two">
   <label>Open farm profile<select value={active?.id ?? ''} onChange={event => run(() => selectFarm(event.target.value))}>
    {!active && <option value="" disabled>Select farm</option>}
    {(profiles.length ? profiles : [DEFAULT_FARM]).map(profile => <option key={profile.id} value={profile.id}>{profile.name}</option>)}
   </select></label>
   <form onSubmit={event => { event.preventDefault(); void create(); }}>
    <label>New farm name<input value={name} maxLength={60} onChange={event => setName(event.target.value)}/></label>
    <button type="submit" disabled={creating || !name.trim() || profiles.length >= 13}>Create farm profile</button>
   </form>
  </div>
  {error && <p role="alert" className="error">{error}</p>}
 </details>;
}
