;; contracts/content-storage.clar

;; Define constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))

;; Define data variables
(define-data-var next-post-id uint u1)

;; Define maps
(define-map posts uint {
  author: principal,
  content: (string-utf8 1000),
  timestamp: uint,
  ipfs-hash: (string-ascii 46)
})

;; Private functions
(define-private (is-owner)
  (is-eq tx-sender contract-owner))

;; Public functions

;; Create a new post
(define-public (create-post (content (string-utf8 1000)) (ipfs-hash (string-ascii 46)))
  (let
    (
      (post-id (var-get next-post-id))
    )
    (map-set posts post-id {
      author: tx-sender,
      content: content,
      timestamp: block-height,
      ipfs-hash: ipfs-hash
    })
    (var-set next-post-id (+ post-id u1))
    (ok post-id)
  )
)

;; Update an existing post
(define-public (update-post (post-id uint) (new-content (string-utf8 1000)) (new-ipfs-hash (string-ascii 46)))
  (let
    (
      (post (unwrap! (map-get? posts post-id) err-not-found))
    )
    (asserts! (is-eq (get author post) tx-sender) err-unauthorized)
    (map-set posts post-id (merge post {
      content: new-content,
      ipfs-hash: new-ipfs-hash
    }))
    (ok true)
  )
)

;; Delete a post
(define-public (delete-post (post-id uint))
  (let
    (
      (post (unwrap! (map-get? posts post-id) err-not-found))
    )
    (asserts! (is-eq (get author post) tx-sender) err-unauthorized)
    (map-delete posts post-id)
    (ok true)
  )
)

;; Read-only functions

(define-read-only (get-post (post-id uint))
  (map-get? posts post-id))

(define-read-only (get-latest-post-id)
  (- (var-get next-post-id) u1))
