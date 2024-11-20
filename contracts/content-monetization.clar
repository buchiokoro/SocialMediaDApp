;; contracts/content-monetization.clar

;; Define constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))
(define-constant err-insufficient-funds (err u103))

;; Define fungible token
(define-fungible-token social-token)

;; Define maps
(define-map post-tips uint {total-tips: uint, tippers: (list 100 principal)})

;; Public functions

;; Mint social tokens (only contract owner)
(define-public (mint-tokens (amount uint) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ft-mint? social-token amount recipient)))

;; Tip a post
(define-public (tip-post (post-id uint) (amount uint))
  (let
    (
      (post (unwrap! (contract-call? .content-storage get-post post-id) err-not-found))
      (author (get author post))
      (current-tips (default-to {total-tips: u0, tippers: (list)} (map-get? post-tips post-id)))
    )
    (asserts! (>= (ft-get-balance social-token tx-sender) amount) err-insufficient-funds)
    (try! (ft-transfer? social-token amount tx-sender author))
    (map-set post-tips post-id {
      total-tips: (+ (get total-tips current-tips) amount),
      tippers: (unwrap-panic (as-max-len? (append (get tippers current-tips) tx-sender) u100))
    })
    (ok true)
  )
)

;; Read-only functions

(define-read-only (get-post-tips (post-id uint))
  (map-get? post-tips post-id))

(define-read-only (get-token-balance (account principal))
  (ft-get-balance social-token account))
