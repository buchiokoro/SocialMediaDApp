;; contracts/censorship-resistant-posting.clar

;; Define constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))

;; Define maps
(define-map moderation-flags uint {flagged: bool, reason: (string-utf8 200)})
(define-map user-reputation principal {score: int})

;; Public functions

;; Flag a post for moderation
(define-public (flag-post (post-id uint) (reason (string-utf8 200)))
  (let
    (
      (post (unwrap! (contract-call? .content-storage get-post post-id) err-not-found))
      (current-flag (default-to {flagged: false, reason: u""} (map-get? moderation-flags post-id)))
    )
    (map-set moderation-flags post-id {
      flagged: true,
      reason: reason
    })
    (ok true)
  )
)

;; Resolve a flagged post (only contract owner)
(define-public (resolve-flag (post-id uint) (keep-visible bool))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (let
      (
        (post (unwrap! (contract-call? .content-storage get-post post-id) err-not-found))
        (author (get author post))
      )
      (if keep-visible
        (map-delete moderation-flags post-id)
        (contract-call? .content-storage delete-post post-id)
      )
      (update-user-reputation author (if keep-visible u1 (- u0 u1)))
      (ok true)
    )
  )
)

;; Private functions

(define-private (update-user-reputation (user principal) (change int))
  (let
    (
      (current-score (default-to {score: 0} (map-get? user-reputation user)))
    )
    (map-set user-reputation user {
      score: (+ (get score current-score) change)
    })
  )
)

;; Read-only functions

(define-read-only (get-post-flag (post-id uint))
  (map-get? moderation-flags post-id))

(define-read-only (get-user-reputation (user principal))
  (default-to {score: 0} (map-get? user-reputation user)))
