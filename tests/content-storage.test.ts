import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'

const contractSource = readFileSync('./contracts/content-storage.clar', 'utf8')

describe('Content Storage Contract', () => {
  it('should define error constants', () => {
    expect(contractSource).toContain('(define-constant err-not-found (err u101))')
    expect(contractSource).toContain('(define-constant err-unauthorized (err u102))')
  })
  
  it('should define next-post-id data variable', () => {
    expect(contractSource).toContain('(define-data-var next-post-id uint u1)')
  })
  
  it('should define posts map', () => {
    expect(contractSource).toContain('(define-map posts uint {')
    expect(contractSource).toContain('author: principal,')
    expect(contractSource).toContain('content: (string-utf8 1000),')
    expect(contractSource).toContain('timestamp: uint,')
    expect(contractSource).toContain('ipfs-hash: (string-ascii 46)')
  })
  
  it('should have a create-post function', () => {
    expect(contractSource).toContain('(define-public (create-post (content (string-utf8 1000)) (ipfs-hash (string-ascii 46)))')
  })
  
  it('should set post data in create-post function', () => {
    expect(contractSource).toContain('(map-set posts post-id {')
    expect(contractSource).toContain('author: tx-sender,')
    expect(contractSource).toContain('content: content,')
    expect(contractSource).toContain('timestamp: block-height,')
    expect(contractSource).toContain('ipfs-hash: ipfs-hash')
  })
  
  it('should increment next-post-id in create-post function', () => {
    expect(contractSource).toContain('(var-set next-post-id (+ post-id u1))')
  })
  
  it('should have an update-post function', () => {
    expect(contractSource).toContain('(define-public (update-post (post-id uint) (new-content (string-utf8 1000)) (new-ipfs-hash (string-ascii 46)))')
  })
  
  it('should check post existence in update-post function', () => {
    expect(contractSource).toContain('(post (unwrap! (map-get? posts post-id) err-not-found))')
  })
  
  it('should check authorization in update-post function', () => {
    expect(contractSource).toContain('(asserts! (is-eq (get author post) tx-sender) err-unauthorized)')
  })
  
  it('should update post data in update-post function', () => {
    expect(contractSource).toContain('(map-set posts post-id (merge post {')
    expect(contractSource).toContain('content: new-content,')
    expect(contractSource).toContain('ipfs-hash: new-ipfs-hash')
  })
  
  it('should have a get-post read-only function', () => {
    expect(contractSource).toContain('(define-read-only (get-post (post-id uint))')
  })
  
  it('should have a get-latest-post-id read-only function', () => {
    expect(contractSource).toContain('(define-read-only (get-latest-post-id)')
  })
  
  it('should calculate latest post id correctly', () => {
    expect(contractSource).toContain('(- (var-get next-post-id) u1)')
  })
})

