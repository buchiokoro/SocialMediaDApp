;; Define constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))

;; Define maps
(define-map moderation-flags uint {flagged: bool, reason: (string-utf8 200)})
(define-map user-reputation principal int)

;; Public functions

;; Flag a post for moderation
(define-public (flag-post (post-id uint) (reason (string-utf8 200)))
  (ok (map-set moderation-flags post-id {
    flagged: true,
    reason: reason
  }))
)

;; Resolve a flagged post (only contract owner)
(define-public (resolve-flag (post-id uint) (keep-visible bool))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (if keep-visible
      (map-delete moderation-flags post-id)
      (map-set moderation-flags post-id {flagged: false, reason: u""})
    )
    (ok true)
  )
)

;; Read-only functions

(define-read-only (get-post-flag (post-id uint))
  (map-get? moderation-flags post-id))

(define-read-only (get-user-reputation (user principal))
  (default-to 0 (map-get? user-reputation user)))

