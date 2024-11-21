import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'

const contractSource = readFileSync('./contracts/censorship-resistant-posting.clar', 'utf8')

describe('Censorship Resistant Posting Contract', () => {
  it('should define contract-owner constant', () => {
    expect(contractSource).toContain('(define-constant contract-owner tx-sender)')
  })
  
  it('should define error constants', () => {
    expect(contractSource).toContain('(define-constant err-owner-only (err u100))')
    expect(contractSource).toContain('(define-constant err-not-found (err u101))')
  })
  
  it('should define moderation-flags map', () => {
    expect(contractSource).toContain('(define-map moderation-flags uint {flagged: bool, reason: (string-utf8 200)})')
  })
  
  it('should define user-reputation map', () => {
    expect(contractSource).toContain('(define-map user-reputation principal int)')
  })
  
  it('should have a flag-post function', () => {
    expect(contractSource).toContain('(define-public (flag-post (post-id uint) (reason (string-utf8 200)))')
  })
  
  it('should set moderation flag in flag-post function', () => {
    expect(contractSource).toContain('(ok (map-set moderation-flags post-id {')
    expect(contractSource).toContain('flagged: true,')
    expect(contractSource).toContain('reason: reason')
  })
  
  it('should have a resolve-flag function', () => {
    expect(contractSource).toContain('(define-public (resolve-flag (post-id uint) (keep-visible bool))')
  })
  
  it('should check for contract owner in resolve-flag function', () => {
    expect(contractSource).toContain('(asserts! (is-eq tx-sender contract-owner) err-owner-only)')
  })
  
  it('should handle flag resolution based on keep-visible parameter', () => {
    expect(contractSource).toContain('(if keep-visible')
    expect(contractSource).toContain('(map-delete moderation-flags post-id)')
    expect(contractSource).toContain('(map-set moderation-flags post-id {flagged: false, reason: u""})')
  })
  
  it('should have a get-post-flag read-only function', () => {
    expect(contractSource).toContain('(define-read-only (get-post-flag (post-id uint))')
  })
  
  it('should have a get-user-reputation read-only function', () => {
    expect(contractSource).toContain('(define-read-only (get-user-reputation (user principal))')
  })
})

