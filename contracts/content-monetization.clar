;; Define constants
(define-constant err-not-found (err u101))
(define-constant err-insufficient-funds (err u103))

;; Define fungible token
(define-fungible-token social-token)

;; Define maps
(define-map post-tips uint uint)

;; Public functions

;; Mint social tokens
(define-public (mint-tokens (amount uint) (recipient principal))
  (ft-mint? social-token amount recipient))

;; Tip a post
(define-public (tip-post (post-id uint) (amount uint))
  (let
    (
      (current-tips (default-to u0 (map-get? post-tips post-id)))
    )
    (asserts! (>= (ft-get-balance social-token tx-sender) amount) err-insufficient-funds)
    (try! (ft-transfer? social-token amount tx-sender (as-contract tx-sender)))
    (map-set post-tips post-id (+ current-tips amount))
    (ok true)
  )
)

;; Read-only functions

(define-read-only (get-post-tips (post-id uint))
  (default-to u0 (map-get? post-tips post-id)))

(define-read-only (get-token-balance (account principal))
  (ft-get-balance social-token account))

