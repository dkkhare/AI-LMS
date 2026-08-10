import { FormEvent, useCallback, useEffect, useState } from 'react';
import { administratorsApi, teachersApi } from '../../../services/api';
import type { ManagedMember, SaveManagedMemberInput, UserStatus } from '../../../types';

type Kind = 'administrators' | 'teachers';

const copy = {
  administrators: {
    eyebrow: 'Super administrator control',
    title: 'Administrators',
    description: 'Create and approve administrators who will operate assigned institutions.',
    singular: 'administrator',
    back: '/super-admin',
  },
  teachers: {
    eyebrow: 'Institution people',
    title: 'Teachers',
    description: 'Manage teachers within your assigned institution. Every teacher requires administrator approval.',
    singular: 'teacher',
    back: '/admin',
  },
} as const;

export function RoleMembersPage({ kind }: { kind: Kind }) {
  const api = kind === 'administrators' ? administratorsApi : teachersApi;
  const text = copy[kind];
  const [members, setMembers] = useState<ManagedMember[]>([]);
  const [status, setStatus] = useState<UserStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<ManagedMember | null | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { setMembers((await api.list(status, search)).data); }
    catch (reason) { setError(reason instanceof Error ? reason.message : `Unable to load ${kind}`); }
    finally { setLoading(false); }
  }, [api, kind, search, status]);

  useEffect(() => { void load(); }, [load]);

  async function save(input: SaveManagedMemberInput) {
    if (editing) await api.update(editing.public_id, input);
    else await api.create(input);
    setNotice(`${text.singular[0].toUpperCase()}${text.singular.slice(1)} ${editing ? 'updated' : 'created'} successfully.`);
    setEditing(undefined); await load();
  }

  async function decide(member: ManagedMember, action: 'approve' | 'reject' | 'delete') {
    try {
      if (action === 'approve') await api.approve(member.public_id);
      if (action === 'reject') {
        const reason = window.prompt(`Reason for rejecting ${member.display_name}:`);
        if (!reason) return;
        await api.reject(member.public_id, reason);
      }
      if (action === 'delete') {
        if (!window.confirm(`Delete ${member.display_name}? This action cannot be undone.`)) return;
        await api.remove(member.public_id);
      }
      setNotice(`${member.display_name} was ${action === 'delete' ? 'deleted' : `${action}d`}.`); await load();
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Action failed'); }
  }

  return <div className="people-page">
    <header className="people-header">
      <div><a href={text.back}>← Dashboard</a><span className="eyebrow">{text.eyebrow}</span><h1>{text.title}</h1><p>{text.description}</p></div>
      <button className="primary" onClick={() => setEditing(null)}>+ Create {text.singular}</button>
    </header>
    {notice && <div className="notice" role="status">{notice}<button aria-label="Dismiss" onClick={() => setNotice('')}>×</button></div>}
    {error && <div className="error" role="alert">{error}</div>}
    <section className="panel">
      <div className="toolbar">
        <div className="tabs" aria-label="Status filters">{(['all','pending_approval','active'] as const).map(value=><button className={status===value?'selected':''} onClick={()=>setStatus(value)} key={value}>{value.replaceAll('_',' ')}</button>)}</div>
        <label className="search"><span>Search {kind}</span><input value={search} onChange={event=>setSearch(event.target.value)} placeholder="Name, email or mobile"/></label>
      </div>
      {loading ? <div className="empty">Loading {kind}…</div> : members.length===0 ? <div className="empty"><strong>No {kind} found</strong><span>Create the first {text.singular} or change the filter.</span></div> : <div className="managed-list">{members.map(member=><article className="managed-row" key={member.public_id}>
        <div className="identity"><strong>{member.display_name}</strong><span>{member.email_masked} · {member.phone_masked}</span>{member.tenant&&<small>{member.tenant.name}</small>}</div>
        <span className={`status status-${member.status}`}>{member.status.replaceAll('_',' ')}</span>
        <div className="actions"><button onClick={()=>setEditing(member)}>Edit</button>{member.status==='pending_approval'&&<><button className="approve" onClick={()=>void decide(member,'approve')}>Approve</button><button onClick={()=>void decide(member,'reject')}>Reject</button></>}<button className="danger" onClick={()=>void decide(member,'delete')}>Delete</button></div>
      </article>)}</div>}
    </section>
    {editing!==undefined&&<MemberDialog member={editing} singular={text.singular} onClose={()=>setEditing(undefined)} onSave={save}/>} 
  </div>;
}

function MemberDialog({member,singular,onClose,onSave}:{member:ManagedMember|null;singular:string;onClose:()=>void;onSave:(input:SaveManagedMemberInput)=>Promise<void>}){
  const[saving,setSaving]=useState(false);const[error,setError]=useState('');
  async function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();setSaving(true);setError('');const data=new FormData(event.currentTarget);try{await onSave({first_name:String(data.get('first_name')),last_name:String(data.get('last_name')||''),email:String(data.get('email')),phone:String(data.get('phone'))})}catch(reason){setError(reason instanceof Error?reason.message:'Unable to save');setSaving(false)}}
  return <div className="modal-backdrop" onMouseDown={event=>event.target===event.currentTarget&&onClose()}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="member-dialog-title"><div className="modal-head"><div><span className="eyebrow">{member?'Update':'New'} account</span><h2 id="member-dialog-title">{member?'Edit':'Create'} {singular}</h2></div><button aria-label="Close" onClick={onClose}>×</button></div><p>Email and mobile must be unique. New accounts require both OTP verification and one-level-up approval.</p>{error&&<div className="error" role="alert">{error}</div>}<form onSubmit={submit}><div className="form-grid"><label>First name<input name="first_name" defaultValue={member?.first_name} required autoFocus/></label><label>Last name<input name="last_name" defaultValue={member?.last_name}/></label></div><label>Email address<input name="email" type="email" required placeholder={member?.email_masked}/></label><label>Mobile in E.164 format<input name="phone" type="tel" pattern="\+[1-9][0-9]{7,14}" required placeholder={member?.phone_masked||'+919876543210'}/></label><div className="modal-actions"><button type="button" onClick={onClose}>Cancel</button><button className="primary" disabled={saving}>{saving?'Saving…':'Save'}</button></div></form></section></div>
}
