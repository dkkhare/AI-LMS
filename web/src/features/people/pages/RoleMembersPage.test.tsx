import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RoleMembersPage } from './RoleMembersPage';

describe('RoleMembersPage',()=>{
  beforeEach(()=>vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:true,json:async()=>({data:[],meta:{current_page:1,last_page:1,total:0}})})));
  afterEach(()=>{cleanup();vi.unstubAllGlobals()});
  it('provides administrator CRUD and approval page',async()=>{render(<RoleMembersPage kind="administrators"/>);expect(screen.getByRole('heading',{name:'Administrators'})).toBeInTheDocument();expect(screen.getByRole('button',{name:'+ Create administrator'})).toBeInTheDocument();await waitFor(()=>expect(screen.getByText('No administrators found')).toBeInTheDocument())});
  it('keeps teacher management institution scoped',async()=>{render(<RoleMembersPage kind="teachers"/>);expect(screen.getByText(/within your assigned institution/i)).toBeInTheDocument();expect(screen.getByRole('button',{name:'+ Create teacher'})).toBeInTheDocument();await waitFor(()=>expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/tenant/teachers'),expect.anything()))});
});
